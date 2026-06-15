# みやしょうPASS

児童が一人一台のタブレットで使う、各サービスのID・パスワードをかんたんに確認できるアプリです。
児童は自分のGoogleアカウントでログインし、自分の情報だけをサービスごとのタブで確認できます。
先生は管理ページ（`/admin`）から、校務システムのExcelを取り込んでデータを更新します。

- フロント/サーバー: **Next.js (App Router) + TypeScript + Tailwind CSS v4 + Zustand**
- バックエンド: **Firebase（Authentication + Firestore）**
- デプロイ: **Vercel**

---

## できること

- **児童**: 「Googleでログイン」→ 自分のメール（Excel備考5のGmail）に一致する情報を表示
  - タブ: Google / スマイルネクスト / ミライシード / iPad（データがある分だけ表示）
  - コピー・パスワード表示切替つき。未登録アカウントは「先生に聞いてね」表示。
- **管理（/admin・パスワード `444325`）**: Excel取り込み、取込日時の記録、学年・組・番号での絞り込み、全校一覧。

---

## セットアップ（はじめにやること）

### 1. Firebase
1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを作成
2. **Authentication → Sign-in method → Google を有効化**（サポートメール設定）
   - 「Authorized domains」に Vercel本番ドメインと `localhost` を追加
3. **Firestore Database → 作成（本番モード・リージョン asia-northeast1 推奨）**
4. **Firestore → ルール** に本リポジトリの `firestore.rules`（全拒否）を貼り付けて公開
5. **⚙️設定 → プロジェクトの設定 →「サービス アカウント」タブ → 新しい秘密鍵を生成**（JSONをダウンロード）

> Web用構成（`NEXT_PUBLIC_FIREBASE_*`）は `lib/firebase/client.ts` に既定値として**埋め込み済み**です。
> 別プロジェクトへ切り替える場合のみ環境変数で上書きしてください（通常は不要）。

### 2. 環境変数（必須なのは「サーバー専用」のみ）
`.env.local`（ローカル）と Vercel のプロジェクト設定に、以下の**サーバー専用4種**を設定します（`.env.example` 参照）。

| 変数 | 取得元 |
|---|---|
| `FIREBASE_PROJECT_ID` | サービスアカウントJSONの `project_id`（= `miyasyo-idpass`） |
| `FIREBASE_CLIENT_EMAIL` | サービスアカウントJSONの `client_email` |
| `FIREBASE_PRIVATE_KEY` | サービスアカウントJSONの `private_key` |
| `ADMIN_PASSWORD` | 管理ページのパスワード（既定 `444325`） |
| `ADMIN_SESSION_SECRET` | 32文字以上のランダム文字列 |

> `FIREBASE_PRIVATE_KEY` は改行を `\n` のままにして、ダブルクォートで囲んでください（コード側で復元します）。
> これらサーバー専用の変数には絶対に `NEXT_PUBLIC_` を付けないでください。

### 3. ローカル実行
```bash
npm install
npm run dev   # http://localhost:3000
```

### 4. デプロイ（Vercel）
- GitHub リポジトリを Vercel に import（Next.js を自動検出）
- 上記の環境変数を Production / Preview / Development に設定して再デプロイ
- 本番ドメインを Firebase の Authorized domains に追加

---

## Excelの形式（校務システム出力）

| 列 | 内容 |
|---|---|
| C / D / E | 学年 / 組 / 番号 |
| G / H | ひまわり（特別支援）学級の情報（あれば併記表示） |
| Q / R | 名前 / ふりがな |
| AL（備考5） | `Gmailアドレス/Googleアカウントパスワード/iPad機体番号`（半角スラッシュ区切り） |
| BE（備考6） | `ミライシードパスワード/スマイルネクストID/スマイルネクストパスワード` |

- 番号（E列）が正の整数の行をデータ行として読み取ります（先頭シート）。
- Gmail未入力の行は保存されず、取り込み結果に警告として表示されます。
- 同じメールは最新の取り込み内容で上書き。今回ファイルに無い既存児童は自動削除しません（件数のみ表示）。

---

## セキュリティの考え方

- Firestore は**クライアントから直接アクセスできません**（ルールで全拒否）。すべてサーバーAPI（Firebase Admin SDK）経由。
- 児童は `/api/me` で、検証済みIDトークンのメールに一致する**自分のデータのみ**取得します。
- 管理パスワードはサーバーで照合し、署名付き httpOnly Cookie でセッション管理します。
- `ADMIN_PASSWORD` が6桁の場合、ブルートフォース対策として失敗時に遅延を入れています。より強い値への変更も検討してください。

---

## タブレットでのログインについて

学校のGoogle Workspaceアカウントでのログインを想定しています。ポップアップがブロックされる端末では、
必要に応じてリダイレクト方式（`signInWithRedirect`）への切り替えを検討してください。
