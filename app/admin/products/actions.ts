"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/data/home";

function parseProduct(formData: FormData) {
  const category = String(formData.get("category") ?? "");
  const emoji = String(formData.get("emoji") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const weight = String(formData.get("weight") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const available = formData.get("available") === "on";
  const sortOrderRaw = Number(formData.get("sortOrder") ?? 0);

  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return "Danh mục không hợp lệ.";
  }
  if (!emoji || !name || !weight || !price) {
    return "Vui lòng điền đầy đủ: icon, tên, quy cách, giá.";
  }

  return {
    category,
    emoji,
    name,
    weight,
    price,
    badge: badge || null,
    description: description || null,
    featured,
    available,
    sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0,
  };
}

export async function createProduct(_prevState: string | undefined, formData: FormData) {
  const parsed = parseProduct(formData);
  if (typeof parsed === "string") return parsed;

  await prisma.product.create({ data: parsed });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prevState: string | undefined, formData: FormData) {
  const parsed = parseProduct(formData);
  if (typeof parsed === "string") return parsed;

  await prisma.product.update({ where: { id }, data: parsed });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setProductAvailable(id: string, available: boolean) {
  await prisma.product.update({ where: { id }, data: { available } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}
