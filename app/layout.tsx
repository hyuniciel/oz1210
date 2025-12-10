import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * 커스텀 한국어 로컬라이제이션
 *
 * 기본 koKR 로컬라이제이션에 커스텀 에러 메시지를 추가합니다.
 * 필요에 따라 다른 텍스트도 커스터마이징할 수 있습니다.
 */
const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 커스텀 에러 메시지 예제
    not_allowed_access:
      "접근 권한이 없습니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
    form_identifier_not_found:
      "입력하신 이메일 주소로 등록된 계정을 찾을 수 없습니다.",
    form_password_pwned:
      "이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.",
    form_password_length_too_short:
      "비밀번호가 너무 짧습니다. 최소 8자 이상 입력해주세요.",
    form_password_validation_failed:
      "비밀번호가 요구사항을 만족하지 않습니다.",
    form_username_invalid_length:
      "사용자 이름은 3자 이상 20자 이하여야 합니다.",
    form_param_format_invalid:
      "입력 형식이 올바르지 않습니다. 다시 확인해주세요.",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description: "전국 관광지 정보를 검색하고 지도에서 확인하세요",
  keywords: ["관광지", "여행", "한국", "지도", "관광", "여행지"],
  authors: [{ name: "My Trip" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://mytrip.example.com",
    siteName: "My Trip",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "전국 관광지 정보를 검색하고 지도에서 확인하세요",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Trip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "전국 관광지 정보를 검색하고 지도에서 확인하세요",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={customKoKR}
      appearance={{
        cssLayerName: "clerk", // Tailwind CSS 4 호환성
      }}
    >
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
