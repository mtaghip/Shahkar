"use client";

import { useActionState, useState } from "react";
import ProductMedia from "./ProductMedia";
import Link from "next/link";
import type { ProductFormState } from "@/lib/actions/admin";
import type { Product } from "@prisma/client";

type Action = (
  prev: ProductFormState,
  formData: FormData
) => Promise<ProductFormState>;

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: Action;
  product?: Product;
  submitLabel: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  const priceValue = product
    ? (product.pricePence / 100).toString()
    : "";

  return (
    <form action={formAction}>
      <div className="pform">
        <label className="field"><span>Publishing status</span><select name="status" defaultValue={product?.status ?? "DRAFT"}><option value="DRAFT">Draft — hidden from the shop</option><option value="ACTIVE">Active — visible in the shop</option><option value="ARCHIVED">Archived — hidden from the shop</option></select></label>
        <label className="field"><span>SKU / stock reference</span><input name="sku" maxLength={100} defaultValue={product?.sku}/></label>
        <ProductMedia initial={product?.imageIds} onBusy={setUploading}/>
        <label className="field field--wide">
          <span>Name</span>
          <input type="text" name="name" required defaultValue={product?.name} />
        </label>

        <label className="field">
          <span>Slug (URL) — leave blank to auto-generate</span>
          <input type="text" name="slug" defaultValue={product?.slug} placeholder="e.g. heriz" />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={product?.category ?? "antique"}>
            <option value="antique">Antique &amp; collectable</option>
            <option value="contemporary">Contemporary handmade</option>
          </select>
        </label>

        <label className="field">
          <span>Tag (e.g. “Antique · c. 1910”)</span>
          <input type="text" name="tag" defaultValue={product?.tag} />
        </label>
        <label className="field">
          <span>Meta (size · materials)</span>
          <input type="text" name="meta" defaultValue={product?.meta} />
        </label>

        <label className="field">
          <span>Price (£)</span>
          <input
            type="text"
            name="price"
            required
            inputMode="decimal"
            defaultValue={priceValue}
            placeholder="18400"
          />
        </label>
        <label className="field">
          <span>Stock (units available)</span>
          <input
            type="number"
            name="stock"
            min={0}
            defaultValue={product?.stock ?? 1}
          />
        </label>

        <label className="field field--wide">
          <span>Image caption / alt text</span>
          <input
            type="text"
            name="imageCaption"
            defaultValue={product?.imageCaption}
            placeholder="Heriz — geometric medallion, rust and indigo"
          />
        </label>

        <label className="field field--wide">
          <span>Description</span>
          <textarea
            name="description"
            rows={5}
            defaultValue={product?.description}
          />
        </label>

        <label className="field field--wide">
          <span>Provenance</span>
          <textarea
            name="provenance"
            rows={3}
            defaultValue={product?.provenance}
          />
        </label>

        <div className="field--wide" style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <label className="checkline">
            <input
              type="checkbox"
              name="priceFrom"
              defaultChecked={product?.priceFrom}
            />
            Show price as “from £…”
          </label>
          <label className="checkline">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
            />
            Feature on the homepage
          </label>
          <label className="checkline">
            <input
              type="checkbox"
              name="reserved"
              defaultChecked={product?.reserved}
            />
            Mark as reserved
          </label>
        </div>
      </div>

      {state.error ? (
        <p className="authform__error" role="alert" style={{ maxWidth: 900, marginTop: 24 }}>
          {state.error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn--solid" disabled={pending || uploading}>
          {uploading ? "Uploading photos…" : pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin" className="btn btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
