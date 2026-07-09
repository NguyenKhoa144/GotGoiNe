"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#f0f9e1] px-4">
      <form
        action={formAction}
        className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(30,92,45,0.15)] transition-all duration-300 ease-out ${
          isPending ? "-translate-y-2 scale-95 opacity-0" : "animate-[fade-in-up_0.4s_ease-out]"
        }`}
      >
        <h1 className="mb-1 text-xl font-extrabold text-[#1E5C2D]">Đăng nhập quản trị</h1>
        <p className="mb-6 text-sm text-[#4a6e4d]">Gọt Gòi Nè — khu vực quản trị</p>

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
      </form>
    </main>
  );
}
