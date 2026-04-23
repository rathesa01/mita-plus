import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mitaplus.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'MITA+ | ทำคอนเทนต์แล้วได้เงินน้อยไปไหม? เช็กฟรีใน 3 นาที',
  description: 'บอก Platform กับจำนวนผู้ติดตาม — MITA+ จะบอกว่าคุณพลาดเงินไปเดือนละเท่าไหร่ และต้องทำอะไรให้ได้เงินเพิ่ม ฟรี 100% ผลออกใน 3 นาที',
  keywords: ['creator', 'ทำเงินจาก content', 'คอนเทนต์ครีเอเตอร์', 'รายได้ creator', 'MITA+', 'เพิ่มรายได้'],
  openGraph: {
    title: 'MITA+ — ทำคอนเทนต์แล้วได้เงินน้อยไปไหม?',
    description: 'เช็กฟรีใน 3 นาที · รู้เลยว่าพลาดเงินไปเท่าไหร่ · เริ่มได้เงินเพิ่มใน 7 วัน',
    url: BASE_URL,
    siteName: 'MITA+',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'MITA+ — Money In The Air | AI Revenue Analysis สำหรับ Creator',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MITA+ — ทำคอนเทนต์แล้วได้เงินน้อยไปไหม?',
    description: 'เช็กฟรีใน 3 นาที · รู้เลยว่าพลาดเงินไปเท่าไหร่',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#080810] text-white" style={{ fontFamily: 'var(--font-noto-sans-thai), sans-serif' }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
