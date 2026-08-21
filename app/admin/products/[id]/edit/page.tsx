import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { updateProduct } from "@/app/admin/products/actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div className="p-4">
      <h1 className="mb-2 text-center text-lg font-bold text-neutral-900">Sửa sản phẩm</h1>
      <ProductForm
        action={boundUpdate}
        categories={PRODUCT_CATEGORIES}
        submitLabel="Lưu thay đổi"
        initial={{
          id: product.id,
          category: product.category,
          emoji: product.emoji,
          name: product.name,
          weight: product.weight,
          price: product.price,
          badge: product.badge ?? undefined,
          featured: product.featured,
          description: product.description ?? undefined,
          available: product.available,
          sortOrder: product.sortOrder,
        }}
      />
    </div>
  );
}
