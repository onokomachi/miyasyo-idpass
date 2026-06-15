// Excel（校務システム出力）の列マッピングと分割ヘルパー。
// ExcelJS は列名（'AL' など）でセルを直接取得できる。

export const COL = {
  GRADE: 'C', // 学年
  CLASS: 'D', // 組
  NUMBER: 'E', // 番号
  HIMA_GRADE: 'G', // ひまわり学年
  HIMA_CLASS: 'H', // ひまわり組
  NAME: 'Q', // 名前
  KANA: 'R', // ふりがな
  BIKO5: 'AL', // 備考5: Gmail / Googleパスワード / iPad機体番号
  BIKO6: 'BE', // 備考6: ミライシードPW / スマイルネクストID / スマイルネクストPW
} as const;

// セル値を文字列に整える（数値・日付・null も安全に）。
export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    // ExcelJS のリッチテキスト / ハイパーリンク / 数式結果
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === 'string') return obj.text.trim();
    if (typeof obj.result !== 'undefined') return String(obj.result).trim();
    if (Array.isArray((obj as { richText?: unknown }).richText)) {
      return (obj as { richText: { text?: string }[] }).richText
        .map((r) => r.text ?? '')
        .join('')
        .trim();
    }
  }
  return String(value).trim();
}

// "a/b/c" 形式を期待する個数に分割する。
// 全角スラッシュを半角に正規化し、各要素を trim。空文字は undefined にする。
export function splitField(value: string, expected: number): (string | undefined)[] {
  const normalized = value.replace(/／/g, '/').trim();
  const parts = normalized.length ? normalized.split('/') : [];
  const result: (string | undefined)[] = [];
  for (let i = 0; i < expected; i++) {
    const part = parts[i]?.trim();
    result.push(part && part.length ? part : undefined);
  }
  return result;
}
