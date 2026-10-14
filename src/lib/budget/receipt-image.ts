/**
 * Client-side receipt photo compression: downscale to a receipt-friendly
 * size and encode as JPEG so the image fits under the server's data-URL cap
 * (`MAX_RECEIPT_CHARS` in validation.ts). Browser-only (canvas/image APIs).
 */

export const MAX_RECEIPT_CHARS = 400_000;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/** Error codes thrown by {@link compressReceiptImage} (i18n-mapped by callers). */
export type ReceiptImageError =
  | "receipt_error_type"
  | "receipt_error_large"
  | "receipt_error_decode"
  | "receipt_error_size";

class ReceiptCompressError extends Error {
  code: ReceiptImageError;
  constructor(code: ReceiptImageError) {
    super(code);
    this.code = code;
  }
}

const PASSES: { scale: number; quality: number }[] = [
  { scale: 1, quality: 0.75 },
  { scale: 1, quality: 0.6 },
  { scale: 0.75, quality: 0.6 },
  { scale: 0.6, quality: 0.5 },
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ReceiptCompressError("receipt_error_decode"));
    };
    img.src = url;
  });
}

export async function compressReceiptImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ReceiptCompressError("receipt_error_type");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ReceiptCompressError("receipt_error_large");
  }

  const img = await loadImage(file);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  if (!longEdge) throw new ReceiptCompressError("receipt_error_decode");

  for (const { scale, quality } of PASSES) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * (scale * Math.min(1, 1280 / longEdge))));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * (scale * Math.min(1, 1280 / longEdge))));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ReceiptCompressError("receipt_error_decode");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_RECEIPT_CHARS) return dataUrl;
  }

  throw new ReceiptCompressError("receipt_error_size");
}
