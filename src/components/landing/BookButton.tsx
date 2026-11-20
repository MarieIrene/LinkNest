"use client";

import type { ProductId } from "@/lib/products";

export const BOOK_EVENT = "linknest:book";

/** Jumps to the booking form and preselects a product. */
export function BookButton({
  product,
  className = "btn-press",
  children,
}: {
  product?: ProductId;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#book"
      className={className}
      onClick={() => {
        if (product) window.dispatchEvent(new CustomEvent<ProductId>(BOOK_EVENT, { detail: product }));
      }}
    >
      {children}
    </a>
  );
}
