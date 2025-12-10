/**
 * @file app/sign-up/[[...sign-up]]/page.tsx
 * @description Clerk 회원가입 페이지 (한국어)
 *
 * Clerk의 SignUp 컴포넌트를 사용하여 회원가입 페이지를 구현합니다.
 * 한국어 로컬라이제이션이 자동으로 적용됩니다 (ClerkProvider에서 설정).
 *
 * 주요 기능:
 * 1. 이메일/소셜 회원가입 지원
 * 2. 로그인 페이지로 이동 링크
 * 3. 한국어 UI 자동 적용
 *
 * @dependencies
 * - @clerk/nextjs: SignUp 컴포넌트
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        redirectUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
}

