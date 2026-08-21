import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { updateProduct } from "@/app/admin/products/actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div className="p-4">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <Link href="/admin/products" className="text-sm text-neutral-500 hover:text-[#1e5c2e]">
          ← Về thực đơn
        </Link>
        <h1 className="text-lg font-bold text-[#152b1a]">Sửa sản phẩm</h1>
        <DeleteProductButton id={product.id} name={product.name} />
      </div>

      <ProductForm
        action={boundUpdate}
        categories={PRODUCT_CATEGORIES}
        submitLabel="Lưu thay đổi"
        initial={{
          category: product.category,
          emoji: product.emoji,
          name: product.name,
          weight: product.weight,
          price: product.price,
          badge: product.badge ?? undefined,
          description: product.description ?? undefined,
          featured: product.featured,
        }}
      />
    </div>
  );
}
