import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

interface ImageSlotProps {
  src?: string;
  caption: string;
  /** aspect-ratio, e.g. "4/5". Omit when the parent sets the height. */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  /** Responsive sizes hint for the optimiser. */
  sizes?: string;
  /** Load eagerly — use for the largest above-the-fold image. */
  priority?: boolean;
  /** Overlay content rendered above the image (badges, scrims). */
  children?: ReactNode;
}

/**
 * A product/editorial image in a fixed-ratio frame. With a src it renders an
 * optimised next/image (responsive AVIF/WebP, lazy-loaded, no layout shift);
 * without one it shows the design's labelled placeholder.
 */
export default function ImageSlot({
  src,
  caption,
  ratio,
  className,
  style,
  sizes = "(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  children,
}: ImageSlotProps) {
  const wrapStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    background: "var(--card)",
    ...(ratio ? { aspectRatio: ratio } : { height: "100%" }),
    ...style,
  };
  return (
    <div className={className} style={wrapStyle}>
      {src ? (
        <Image
          src={src}
          alt={caption}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="imgslot" role="img" aria-label={caption}>
          <span className="imgslot__cap">{caption}</span>
        </div>
      )}
      {children}
    </div>
  );
}
