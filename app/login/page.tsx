"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { authenticate } from "./actions";
import { AuthScene } from "@/components/auth/auth-scene";

function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <form
      action={formAction}
      className={`w-full max-w-sm rounded-2xl border border-white/40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.2)_180px,rgba(255,255,255,0.2)_100%)] p-8 shadow-[0_8px_40px_rgba(30,92,45,0.18)] backdrop-blur-2xl backdrop-saturate-150 [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_14px_rgba(255,255,255,0.75)] transition-all duration-300 ease-out ${
        isPending ? "-translate-y-2 scale-95 opacity-0" : "animate-[fade-in-up_0.4s_ease-out]"
      }`}
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="mb-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[#2d6b3a]">Hi bạn! Gọt nè</p>
        <h1 className="mb-1 text-xl font-extrabold text-[#123f1c]">Đăng nhập</h1>
      </div>

      <label className="mb-1 block text-sm font-semibold text-[#1E5C2D]">Tên đăng nhập</label>
      <input
        name="username"
        type="text"
        required
        autoFocus
        className="mb-4 w-full rounded-lg border-2 border-white/70 bg-white/70 px-3 py-2 text-[#1a2e1c] outline-none transition-colors focus:border-[#3A7D44]"
      />

      <label className="mb-1 block text-sm font-semibold text-[#1E5C2D]">Mật khẩu</label>
      <div className="relative mb-4">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          className="w-full rounded-lg border-2 border-white/70 bg-white/70 px-3 py-2 pr-10 text-[#1a2e1c] outline-none transition-colors focus:border-[#3A7D44]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[#4a6e4d] transition-colors hover:text-[#1E5C2D]"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {errorMessage ? <p className="mb-4 text-sm font-medium text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#1E5C2D] py-2.5 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3A7D44] hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="mt-4 text-center text-sm text-[#4a6e4d]">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-[#1E5C2D] transition-colors hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthScene>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthScene>
  );
}
