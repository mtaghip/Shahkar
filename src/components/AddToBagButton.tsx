"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

export default function AddToBagButton() {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="btn btn--solid btn--block"
      onClick={() => {
        add();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
    >
      {added ? "Added to bag ✓" : "Add to bag"}
    </button>
  );
}
