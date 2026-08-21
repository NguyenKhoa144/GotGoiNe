import { ProductForm } from "@/components/admin/product-form";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { createProduct } from "@/app/admin/products/actions";

export default function NewProductPage() {
  return (
    <div className="p-4">
      <h1 className="mb-2 text-center text-lg font-bold text-neutral-900">Thêm sản phẩm</h1>
      <ProductForm action={createProduct} categories={PRODUCT_CATEGORIES} submitLabel="Thêm sản phẩm" />
    </div>
  );
}
