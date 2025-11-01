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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          #splash-screen {
            position: fixed;
            inset: 0;
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.5s ease-out;
          }

          #splash-screen.fade-out {
            opacity: 0;
            pointer-events: none;
          }

          #splash-logo {
            width: 200px;
            height: 200px;
            object-fit: contain;
          }

          #splash-text {
            position: absolute;
            bottom: 3rem;
            font-size: 1.5rem;
            font-weight: bold;
            color: #000;
            animation: fadeInUp 0.5s ease-out 0.3s both;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        ` }} />
      </head>
      <body
        className={`${pretendard.className} antialiased`}
      >
        {/* 정적 Splash 화면 */}
        <div id="splash-screen">
          <img id="splash-logo" src="/logo.png" alt="Scan&Sell Logo" />
          <h1 id="splash-text">Scan&Sell</h1>
        </div>

        {children}
        <Toaster />

        {/* Splash 화면 제거 스크립트 */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            // 세션 확인
            const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
            const splashScreen = document.getElementById('splash-screen');

            if (hasSeenSplash) {
              // 이미 본 경우 즉시 제거
              if (splashScreen) {
                splashScreen.style.display = 'none';
              }
            } else {
              // 처음인 경우 1.5초 후 fade out
              setTimeout(function() {
                if (splashScreen) {
                  splashScreen.classList.add('fade-out');
                  sessionStorage.setItem('hasSeenSplash', 'true');
                  setTimeout(function() {
                    splashScreen.style.display = 'none';
                  }, 500);
                }
              }, 1500);
            }
          });
        ` }} />
      </body>
    </html>
  );
}
