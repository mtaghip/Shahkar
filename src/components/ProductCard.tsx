import Link from "next/link";
import ImageSlot from "./ImageSlot";
import type { Carpet } from "@/lib/catalogue";

export default function ProductCard({ carpet }: { carpet: Carpet }) {
  return (
    <Link href={`/product/${carpet.id}`} className="card">
      <ImageSlot caption={carpet.ph} ratio="4/5">
        {carpet.sold ? <span className="tag-reserved">Reserved</span> : null}
      </ImageSlot>
      <div>
        <div className="card__tag">{carpet.tag}</div>
        <div className="card__name">{carpet.name}</div>
        <div className="card__meta">{carpet.meta}</div>
        <div className="card__price">{carpet.price}</div>
      </div>
    </Link>
  );
}
