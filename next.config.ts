import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // firebase-admin / exceljs は Node 専用。サーバー外部パッケージとして扱う。
  serverExternalPackages: ['firebase-admin', 'exceljs'],
  eslint: {
    // Vercel ビルドが lint で止まらないようにする（lint は `npm run lint` で実行）。
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
