import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Scan&Sell",
  description: "Scan&Sell: 중고 물품, 이젠 3D로 실물처럼 확인! AI가 흠집까지 분석해주는 가장 투명한 중고거래 솔루션.",
};

const pretendard = localFont({
  src: '../public/fonts/pretendard/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body
        className={`${pretendard.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
