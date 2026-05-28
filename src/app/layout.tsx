import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// Pretendard Variable — 기본 UI 폰트 (SIL OFL 1.1)
// src: ./fonts/PretendardVariable.woff2 (로컬 캐싱, 네트워크 의존 없음)
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// Noto Sans KR — fallback 전용 (한글 글리프 보험)
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "레어리티 - 트레이딩 카드 거래 플랫폼",
  description: "포켓몬, 원피스 카드를 안전하게 사고 팔고 교환하는 국내 최고의 트레이딩 카드 거래 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${notoSansKR.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ background: "var(--bg)" }}
      >
        {children}
      </body>
    </html>
  );
}
