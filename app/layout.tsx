import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Xamsiya Market - Telefon aksessuarlari onlayn-do‘koni',
  description: 'Sifatli chexollar, zaryadlovchilar, quloqchinlar, himoya oynalari va telefon aksessuarlari',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="scroll-smooth">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
