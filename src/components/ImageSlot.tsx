import type { CSSProperties, ReactNode } from "react";

interface ImageSlotProps {
  caption: string;
  /** aspect-ratio, e.g. "4/5". Omit when the parent sets the height. */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  /** Overlay content rendered above the placeholder (badges, scrims). */
  children?: ReactNode;
}

/**
 * Drop-in image placeholder, faithful to the design's <image-slot>: a labelled
 * empty state on the warm card ground with a dashed ring. Replace with a real
 * <Image> (or a background photo) when photography is available.
 */
export default function ImageSlot({
  caption,
  ratio,
  className,
  style,
  children,
}: ImageSlotProps) {
  const wrapStyle: CSSProperties = {
    position: "relative",
    background: "var(--card)",
    ...(ratio ? { aspectRatio: ratio } : { height: "100%" }),
    ...style,
  };
  return (
    <div className={className} style={wrapStyle}>
      <div className="imgslot" role="img" aria-label={caption}>
        <span className="imgslot__cap">{caption}</span>
      </div>
      {children}
    </div>
  );
}
