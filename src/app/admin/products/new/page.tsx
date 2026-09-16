import ProductForm from "@/components/ProductForm";
import { createProductAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <>
      <div className="admin-h">
        <h2>Add a product</h2>
      </div>
      <ProductForm action={createProductAction} submitLabel="Create product" />
    </>
  );
}
