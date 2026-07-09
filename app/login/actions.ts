"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Sai tên đăng nhập hoặc mật khẩu.";
    }
    throw error;
  }
}
