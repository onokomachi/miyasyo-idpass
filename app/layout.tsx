import type { Metadata, Viewport } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';

const rounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-rounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'みやしょうPASS',
  description:
    'みやしょうPASS — 自分のGoogleアカウントでログインして、IDやパスワードをいつでもかんたんに確認できるアプリです。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={rounded.variable}>
      <body className="font-sans text-slate-800 antialiased">{children}</body>
    </html>
  );
}
