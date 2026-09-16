"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";

export default function AddToBagButton({
  productId,
  soldOut,
}: {
  productId: string;
  soldOut?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (soldOut) {
    return (
      <button type="button" className="btn btn--solid btn--block" disabled>
        Reserved
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn--solid btn--block"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await addToCart(productId);
          setAdded(true);
          router.refresh();
          window.setTimeout(() => setAdded(false), 2000);
        })
      }
    >
      {pending ? "Adding…" : added ? "Added to bag ✓" : "Add to bag"}
    </button>
  );
}
