import ProductForm from "@/components/ProductForm";
import { createProductAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <div className="admin-h">
        <h2>Add a product</h2>
      </div>
      <ProductForm action={createProductAction} submitLabel="Create product" />
    </>
  );
}
