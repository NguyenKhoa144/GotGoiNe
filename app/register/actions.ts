"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export async function register(_prevState: string | undefined, formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName || !username || !dateOfBirth || !password || !phone || !email) {
    return "Vui lòng điền đầy đủ thông tin.";
  }
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Email không hợp lệ.";
  }
  if (!/^0\d{9,10}$/.test(phone)) {
    return "Số điện thoại không hợp lệ.";
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        fullName,
        username,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash,
        phone,
        email,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[] | undefined)?.[0];
      if (field === "username") return "Tên đăng nhập đã tồn tại.";
      if (field === "email") return "Email đã tồn tại.";
      if (field === "phone") return "Số điện thoại đã tồn tại.";
      return "Thông tin đã tồn tại.";
    }
    throw error;
  }

  try {
    await signIn("credentials", { username, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Đăng ký thành công nhưng đăng nhập tự động thất bại. Vui lòng đăng nhập lại.";
    }
    throw error;
  }
}
