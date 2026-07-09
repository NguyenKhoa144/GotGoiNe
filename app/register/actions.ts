"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { REGISTRATION_LOCKED_MESSAGE } from "./constants";

// Regex kiểm tra định dạng chuẩn HTML5 cho input[type=email] — chặt hơn hẳn
// \S+@\S+\.\S+ trước đây (chuỗi đó lỏng đến mức "a@b@c.com" vẫn qua được vì
// \S cho phép chứa luôn ký tự @).
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Số di động Việt Nam sau khi chuyển đổi đầu số 11 số -> 10 số (2018): luôn
// đúng 10 chữ số, bắt đầu bằng 0 rồi tới đầu số nhà mạng hợp lệ (3/5/7/8/9).
// Không còn số 11 số, không có đầu số 0/1/2/4/6.
const VN_PHONE_PATTERN = /^0[35789]\d{8}$/;

// Công tắc tạm khoá đăng ký — đổi thành true để mở lại. Form vẫn hiển thị và
// bấm được bình thường, nhưng submit sẽ luôn trả về REGISTRATION_LOCKED_MESSAGE
// thay vì tạo tài khoản mới. (Thông báo nằm ở ./constants.ts vì file "use
// server" chỉ được export async function, không được export hằng số.)
const REGISTRATION_ENABLED = false;

export async function register(_prevState: string | undefined, formData: FormData) {
  if (!REGISTRATION_ENABLED) {
    return REGISTRATION_LOCKED_MESSAGE;
  }

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
  if (!EMAIL_PATTERN.test(email)) {
    return "Email không hợp lệ.";
  }
  if (!VN_PHONE_PATTERN.test(phone)) {
    return "Số điện thoại không hợp lệ. Vui lòng nhập đúng số di động Việt Nam (10 số, bắt đầu bằng 03/05/07/08/09).";
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
