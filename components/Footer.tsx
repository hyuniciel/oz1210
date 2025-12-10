/**
 * @file Footer.tsx
 * @description 푸터 컴포넌트
 *
 * My Trip 프로젝트의 푸터 컴포넌트입니다.
 * 저작권 정보, 링크, API 제공 표시를 포함합니다.
 */

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              My Trip © {currentYear}
            </p>
            <p className="text-xs text-muted-foreground">
              한국관광공사 API 제공
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

