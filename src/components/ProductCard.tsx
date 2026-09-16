import Link from "next/link";
import ImageSlot from "./ImageSlot";
import { formatPrice } from "@/lib/money";
import type { Product } from "@prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.reserved || product.stock <= 0;
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <ImageSlot caption={product.imageCaption} ratio="4/5">
        {soldOut ? <span className="tag-reserved">Reserved</span> : null}
      </ImageSlot>
      <div>
        <div className="card__tag">{product.tag}</div>
        <div className="card__name">{product.name}</div>
        <div className="card__meta">{product.meta}</div>
        <div className="card__price">
          {formatPrice(product.pricePence, product.priceFrom)}
        </div>
      </div>
    </Link>
  );
}
