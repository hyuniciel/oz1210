/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * My Trip 프로젝트의 메인 네비게이션 바입니다.
 * 로고, 검색창, 네비게이션 링크, 로그인 버튼을 포함합니다.
 */

'use client';

import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/stats', label: '통계' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">My Trip</span>
          </Link>

          {/* 데스크톱 검색창 */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="관광지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </form>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <SignedIn>
              <Link
                href="/bookmarks"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                북마크
              </Link>
            </SignedIn>
          </nav>

          {/* 데스크톱 인증 버튼 */}
          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="redirect" asChild>
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect" asChild>
                <Button size="sm">회원가입</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex md:hidden items-center gap-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="메뉴 열기/닫기"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            {/* 모바일 검색창 */}
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="관광지 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </form>

            {/* 모바일 네비게이션 */}
            <nav className="flex flex-col gap-2 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <SignedIn>
                <Link
                  href="/bookmarks"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  북마크
                </Link>
              </SignedIn>
            </nav>

            {/* 모바일 인증 버튼 */}
            <div className="flex flex-col gap-2 px-2 pt-2 border-t">
              <SignedOut>
                <SignInButton mode="redirect" asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    로그인
                  </Button>
                </SignInButton>
                <SignUpButton mode="redirect" asChild>
                  <Button className="w-full">회원가입</Button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
