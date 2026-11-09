// Browser-only: shrink a photo before upload so phone and camera originals
// (often 4–12 MB, sometimes HEIC) fit the server's 3 MB limit. The server
// still validates and re-encodes everything it receives.

const UPLOAD_LIMIT = 2_900_000; // just under the server's 3 MB limit
const MAX_EDGE = 2400; // the server stores at most 1600px, so this loses nothing
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export class UnreadableImageError extends Error {}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  // createImageBitmap applies EXIF rotation by default in current browsers.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // fall through to <img>, which Safari uses to decode HEIC
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    throw new UnreadableImageError(
      `"${file.name}" couldn't be read by this browser. Export it as a JPEG and try again.`
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Return a file the server will accept. Small JPEG/PNG/WebP files go through
 * untouched; anything else is scaled down and re-encoded as JPEG.
 */
export async function shrinkForUpload(file: File): Promise<File> {
  if (ACCEPTED.includes(file.type) && file.size <= UPLOAD_LIMIT) return file;

  const { source, width, height } = await decode(file);
  if (!width || !height) throw new UnreadableImageError(`"${file.name}" doesn't look like a photo.`);

  let edge = Math.min(MAX_EDGE, Math.max(width, height));
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = edge / Math.max(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#fff"; // transparent PNGs become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.88, 0.8, 0.7]) {
      const blob = await encode(canvas, quality);
      if (blob && blob.size <= UPLOAD_LIMIT) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
      }
    }
    edge = Math.round(edge * 0.75);
  }
  throw new UnreadableImageError(`"${file.name}" couldn't be made small enough. Try a smaller photo.`);
}
