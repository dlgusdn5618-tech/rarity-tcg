import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

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
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
