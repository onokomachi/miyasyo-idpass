// 児童1人分のデータモデル。Excel（校務システム出力）から抽出して Firestore に保存する。

export interface HimawariInfo {
  grade?: string; // ひまわり学年（G列）
  class?: string; // ひまわり組（H列）
}

export interface GoogleCredential {
  email: string; // 備考5[0] Gmailアドレス
  password: string; // 備考5[1] Googleアカウントパスワード
}

export interface SmileNextCredential {
  id?: string; // 備考6[1] スマイルネクストID
  password?: string; // 備考6[2] スマイルネクストパスワード
}

export interface MiraiSeedCredential {
  password?: string; // 備考6[0] ミライシードパスワード
}

// Firestore に保存する形（importedAt は保存時にサーバー時刻を入れる）
export interface StudentDoc {
  email: string; // 小文字化した Gmail（= ドキュメントID）
  grade: number; // C 学年
  homeClass: string; // D 組
  number: number; // E 番号
  name: string; // Q 名前
  kana: string; // R ふりがな
  himawari?: HimawariInfo; // G/H（埋まっている時のみ）
  google: GoogleCredential;
  ipadSerial?: string; // 備考5[2] iPad機体番号
  smileNext?: SmileNextCredential;
  miraiSeed?: MiraiSeedCredential;
  importBatchId?: string; // 取り込みバッチID（内部用）
  // importedAt は Firestore Timestamp として保存される
}

// 児童本人に返す形（内部フィールドを除き、取り込み日時を ISO 文字列にしたもの）
export interface SanitizedStudent {
  grade: number;
  homeClass: string;
  number: number;
  name: string;
  kana: string;
  himawari?: HimawariInfo;
  google: GoogleCredential;
  ipadSerial?: string;
  smileNext?: SmileNextCredential;
  miraiSeed?: MiraiSeedCredential;
  importedAt: string | null; // ISO 8601。いつの情報か。
}

// Firestore のドキュメントデータ（importedAt を含む）を児童向けに整形する。
export function sanitizeStudent(
  data: Record<string, unknown>,
): SanitizedStudent {
  const rawImportedAt = data.importedAt;
  let importedAtIso: string | null = null;
  if (rawImportedAt && typeof rawImportedAt === 'object' && 'toDate' in rawImportedAt) {
    // Firestore Timestamp（SDK経由）
    const ts = rawImportedAt as { toDate?: () => Date };
    if (typeof ts.toDate === 'function') importedAtIso = ts.toDate().toISOString();
  } else if (typeof rawImportedAt === 'string') {
    // REST API 経由は ISO 文字列で返る
    importedAtIso = rawImportedAt;
  }

  return {
    grade: (data.grade as number) ?? 0,
    homeClass: (data.homeClass as string) ?? '',
    number: (data.number as number) ?? 0,
    name: (data.name as string) ?? '',
    kana: (data.kana as string) ?? '',
    himawari: data.himawari as HimawariInfo | undefined,
    google: (data.google as GoogleCredential) ?? { email: '', password: '' },
    ipadSerial: data.ipadSerial as string | undefined,
    smileNext: data.smileNext as SmileNextCredential | undefined,
    miraiSeed: data.miraiSeed as MiraiSeedCredential | undefined,
    importedAt: importedAtIso,
  };
}
