import 'server-only';

// firebase-admin Firestore SDK を使わず、Firestore REST API を直接呼ぶ実装。
// SDK がサーバーレス環境で接続できない場合のフォールバック。

import { cert } from 'firebase-admin/app';
import { getServiceAccount } from '@/lib/firebase/admin';

// このプロジェクトのFirestoreデータベースIDは「default」（カッコ無し）。
// 標準の無料データベースは本来「(default)」だが、作成時にIDへ default と
// 入力されたため、名前付きデータベース default として作られている。
// 直接観測（databases.list API）で確認済み。
const DB_ID = 'default';

type FVal =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, FVal> } }
  | { arrayValue: { values?: FVal[] } };

function toFVal(v: unknown): FVal {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFVal) } };
  if (typeof v === 'object') {
    const fields: Record<string, FVal> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      fields[k] = toFVal(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function fromFVal(v: FVal): unknown {
  if ('nullValue' in v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue; // ISO文字列
  if ('mapValue' in v) {
    const obj: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.mapValue.fields ?? {})) {
      obj[k] = fromFVal(val);
    }
    return obj;
  }
  if ('arrayValue' in v) {
    return (v.arrayValue.values ?? []).map(fromFVal);
  }
  return null;
}

function fromDoc(doc: { fields?: Record<string, FVal> }): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    result[k] = fromFVal(v);
  }
  return result;
}

function toFields(data: Record<string, unknown>): Record<string, FVal> {
  const fields: Record<string, FVal> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFVal(v);
  }
  return fields;
}

// アクセストークンをキャッシュ（Vercel warm start 間で再利用）。
let tokenCache: { token: string; exp: number } | null = null;

async function getBearerToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.exp - 60_000) return tokenCache.token;
  const sa = getServiceAccount();
  const credential = cert(sa);
  const { access_token, expires_in } = await credential.getAccessToken();
  tokenCache = { token: access_token, exp: Date.now() + (expires_in ?? 3600) * 1000 };
  return access_token;
}

function baseUrl(): string {
  const { projectId } = getServiceAccount();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DB_ID}/documents`;
}

async function authHeaders() {
  const token = await getBearerToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** ドキュメント1件取得。存在しなければ null。 */
export async function restGetDoc(
  collection: string,
  docId: string,
): Promise<Record<string, unknown> | null> {
  const headers = await authHeaders();
  const res = await fetch(`${baseUrl()}/${collection}/${encodeURIComponent(docId)}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore GET ${collection}/${docId}: ${res.status} ${await res.text()}`);
  return fromDoc(await res.json());
}

/** ドキュメント1件書き込み（PATCH = upsert）。サーバーtimestampフィールドは文字列で渡す。 */
export async function restSetDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  serverTimestampFields: string[] = [],
): Promise<void> {
  const headers = await authHeaders();
  const fields = toFields(data);

  // updateMask を使わず全フィールドを上書き（merge:false 相当）。
  const url = `${baseUrl()}/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Firestore SET ${collection}/${docId}: ${res.status} ${await res.text()}`);

  // サーバータイムスタンプが必要なフィールドは commit で fieldTransform を使う。
  if (serverTimestampFields.length > 0) {
    await restServerTimestamp(collection, docId, serverTimestampFields);
  }
}

/** サーバータイムスタンプを特定フィールドに設定（commit API）。 */
async function restServerTimestamp(
  collection: string,
  docId: string,
  fields: string[],
): Promise<void> {
  const { projectId } = getServiceAccount();
  const headers = await authHeaders();
  const docName = `projects/${projectId}/databases/${DB_ID}/documents/${collection}/${encodeURIComponent(docId)}`;
  const writes = [{
    transform: {
      document: docName,
      fieldTransforms: fields.map((f) => ({ fieldPath: f, setToServerValue: 'REQUEST_TIME' })),
    },
  }];
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DB_ID}/documents:commit`,
    { method: 'POST', headers, body: JSON.stringify({ writes }) },
  );
  if (!res.ok) throw new Error(`Firestore serverTimestamp: ${res.status} ${await res.text()}`);
}

/** 最大500件ずつバッチ書き込み（upsert）。各エントリに serverTimestampFields を適用。 */
export async function restBatchSet(
  collection: string,
  docs: { id: string; data: Record<string, unknown> }[],
  serverTimestampFields: string[] = [],
): Promise<void> {
  if (docs.length === 0) return;
  const { projectId } = getServiceAccount();
  const headers = await authHeaders();

  const CHUNK = 500;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const chunk = docs.slice(i, i + CHUNK);
    const writes: unknown[] = [];

    for (const { id, data } of chunk) {
      const docName = `projects/${projectId}/databases/${DB_ID}/documents/${collection}/${encodeURIComponent(id)}`;
      writes.push({ update: { name: docName, fields: toFields(data) } });
      if (serverTimestampFields.length > 0) {
        writes.push({
          transform: {
            document: docName,
            fieldTransforms: serverTimestampFields.map((f) => ({
              fieldPath: f,
              setToServerValue: 'REQUEST_TIME',
            })),
          },
        });
      }
    }

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DB_ID}/documents:commit`,
      { method: 'POST', headers, body: JSON.stringify({ writes }) },
    );
    if (!res.ok) throw new Error(`Firestore batchSet: ${res.status} ${await res.text()}`);
  }
}

interface QueryFilter {
  field: string;
  op: 'EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL';
  value: unknown;
}

interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction?: 'ASCENDING' | 'DESCENDING' }[];
  limit?: number;
}

/** コレクションに対して構造化クエリを実行。 */
export async function restRunQuery(
  collection: string,
  opts: QueryOptions = {},
): Promise<Record<string, unknown>[]> {
  const { projectId } = getServiceAccount();
  const headers = await authHeaders();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const structuredQuery: Record<string, any> = {
    from: [{ collectionId: collection }],
  };

  if (opts.filters && opts.filters.length > 0) {
    const fieldFilters = opts.filters.map((f) => ({
      fieldFilter: {
        field: { fieldPath: f.field },
        op: f.op,
        value: toFVal(f.value),
      },
    }));
    structuredQuery.where =
      fieldFilters.length === 1
        ? fieldFilters[0]
        : { compositeFilter: { op: 'AND', filters: fieldFilters } };
  }

  if (opts.orderBy && opts.orderBy.length > 0) {
    structuredQuery.orderBy = opts.orderBy.map((o) => ({
      field: { fieldPath: o.field },
      direction: o.direction ?? 'ASCENDING',
    }));
  }

  if (opts.limit !== undefined) {
    structuredQuery.limit = opts.limit;
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DB_ID}/documents:runQuery`,
    { method: 'POST', headers, body: JSON.stringify({ structuredQuery }) },
  );
  if (!res.ok) throw new Error(`Firestore runQuery: ${res.status} ${await res.text()}`);

  const results: unknown[] = await res.json();
  const docs: Record<string, unknown>[] = [];
  for (const item of results as { document?: { fields?: Record<string, FVal> } }[]) {
    if (item.document) docs.push(fromDoc(item.document));
  }
  return docs;
}

/** コレクション内の全ドキュメントIDを取得（orphan 検出用）。 */
export async function restListDocIds(collection: string): Promise<string[]> {
  const docs = await restRunQuery(collection, {});
  // ドキュメントIDは email フィールドに格納されている。
  return docs.map((d) => String(d.email ?? '')).filter(Boolean);
}
