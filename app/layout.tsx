import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mitaplus.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'MITA+ | วิเคราะห์ Revenue Gap ฟรี — Creator ควรได้เงินเท่าไหร่?',
  description: 'บอก Platform, Followers และระบบที่มีอยู่ — MITA+ จะวิเคราะห์ว่าคุณกำลังเสียเงินเท่าไหร่ต่อเดือน และต้องทำอะไรเพื่อดึงเงินกลับมา ฟรี 100% ผลออกใน 3 นาที',
  keywords: ['creator monetization', 'revenue gap', 'thai creator', 'influencer income', 'MITA+', 'ทำเงินจาก content'],
  openGraph: {
    title: 'MITA+ — Creator ควรได้เงินเท่าไหร่?',
    description: 'วิเคราะห์ฟรี · ผลออกใน 3 นาที · เห็นเงินใน 7 วัน',
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
    title: 'MITA+ — Creator ควรได้เงินเท่าไหร่?',
    description: 'วิเคราะห์ Revenue Gap ฟรี · ผลออกใน 3 นาที',
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
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#080810] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
