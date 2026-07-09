"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authenticate } from "./actions";

function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <form
      action={formAction}
      className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(30,92,45,0.15)] transition-all duration-300 ease-out ${
        isPending ? "-translate-y-2 scale-95 opacity-0" : "animate-[fade-in-up_0.4s_ease-out]"
      }`}
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <h1 className="mb-1 text-xl font-extrabold text-[#1E5C2D]">Đăng nhập</h1>
      <p className="mb-6 text-sm text-[#4a6e4d]">Gọt Gòi Nè</p>

      <label className="mb-1 block text-sm font-semibold text-[#1E5C2D]">Tên đăng nhập</label>
      <input
        name="username"
        type="text"
        required
        autoFocus
        className="mb-4 w-full rounded-lg border-2 border-[#c8dbb8] px-3 py-2 text-[#1a2e1c] outline-none focus:border-[#3A7D44]"
      />

      <label className="mb-1 block text-sm font-semibold text-[#1E5C2D]">Mật khẩu</label>
      <input
        name="password"
        type="password"
        required
        className="mb-4 w-full rounded-lg border-2 border-[#c8dbb8] px-3 py-2 text-[#1a2e1c] outline-none focus:border-[#3A7D44]"
      />

      {errorMessage ? <p className="mb-4 text-sm font-medium text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#1E5C2D] py-2.5 font-bold text-white transition-colors hover:bg-[#3A7D44] disabled:opacity-70"
      >
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="mt-4 text-center text-sm text-[#4a6e4d]">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-[#1E5C2D] hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#f0f9e1] px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
