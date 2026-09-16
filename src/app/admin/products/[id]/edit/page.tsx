import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getById } from "@/lib/products";
import { updateProductAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getById(id);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <>
      <div className="admin-h">
        <h2>Edit — {product.name}</h2>
      </div>
      <ProductForm
        action={action}
        product={product}
        submitLabel="Save changes"
      />
    </>
  );
}
