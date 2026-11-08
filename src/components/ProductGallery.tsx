"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageSlot from "./ImageSlot";

export default function ProductGallery({
  imageIds,
  name,
  caption,
  reserved,
}: {
  imageIds: string[];
  name: string;
  caption: string;
  reserved: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchX = useRef<number | null>(null);
  const src = (id: string) => `/api/media/${id}`;
  const count = imageIds.length;

  const open = (i: number) => {
    setIndex(i);
    setZoom(null);
    dialog.current?.showModal();
  };
  const go = useCallback(
    (delta: number) => {
      setZoom(null);
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (count === 0) {
    return (
      <ImageSlot caption={caption} ratio="1/1">
        {reserved ? <span className="tag-reserved">Reserved</span> : null}
      </ImageSlot>
    );
  }

  return (
    <>
      <button type="button" className="gallery-main" onClick={() => open(0)} aria-label={`Enlarge photo 1 of ${count}`}>
        <ImageSlot src={src(imageIds[0])} caption={caption} ratio="1/1" sizes="(max-width: 900px) 100vw, 50vw" priority>
          {reserved ? <span className="tag-reserved">Reserved</span> : null}
          <span className="gallery-hint" aria-hidden="true">Click to enlarge</span>
        </ImageSlot>
      </button>
      {count > 1 && (
        <div className="gallery-thumbs">
          {imageIds.slice(1).map((id, i) => (
            <button key={id} type="button" onClick={() => open(i + 1)} aria-label={`Enlarge photo ${i + 2} of ${count}`}>
              <ImageSlot src={src(id)} caption={`${name} — photo ${i + 2}`} ratio="1/1" sizes="(max-width: 900px) 33vw, 17vw" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${name} photos`}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        onClose={() => setZoom(null)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || zoom) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="lightbox__bar">
          <span>
            {index + 1} / {count}
          </span>
          <span className="lightbox__tip">{zoom ? "Click to zoom out" : "Click the photo to zoom"}</span>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close">
            ✕
          </button>
        </div>
        <div
          className="lightbox__stage"
          data-zoomed={zoom ? "true" : "false"}
          onClick={(e) => {
            if (zoom) return setZoom(null);
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseMove={(e) => {
            if (!zoom) return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
        >
          <Image
            key={imageIds[index]}
            src={src(imageIds[index])}
            alt={`${name} — photo ${index + 1}`}
            fill
            sizes="100vw"
            style={{
              objectFit: "contain",
              transform: zoom ? "scale(2.5)" : "none",
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
            }}
          />
        </div>
        {count > 1 && (
          <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
              ›
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
