export const normalizedPhotoLimitBytes = 5 * 1024 * 1024;
export const normalizedPhotoLongestEdge = 2048;

export function isUnsupportedHeic(file: Pick<File, "name" | "type">) {
  return /\.(heic|heif)$/i.test(file.name) || /image\/(heic|heif)/i.test(file.type);
}

export function fittedImageSize(width: number, height: number, longestEdge = normalizedPhotoLongestEdge) {
  const scale = Math.min(1, longestEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function normalizeRoomPhoto(file: File) {
  if (isUnsupportedHeic(file)) throw new Error("HEIC is not supported in this browser. Capture or choose a JPEG photo instead.");
  if (!file.type.startsWith("image/")) throw new Error("Choose a browser-decodable room image.");
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be decoded. Capture or choose a JPEG photo instead."));
      element.src = sourceUrl;
    });
    const fitted = fittedImageSize(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = fitted.width; canvas.height = fitted.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo normalization is unavailable in this browser.");
    context.drawImage(image, 0, 0, fitted.width, fitted.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
    if (!blob) throw new Error("The room photo could not be normalized.");
    if (blob.size > normalizedPhotoLimitBytes) throw new Error("The normalized photo is still over 5 MB. Capture a simpler JPEG image.");
    return { file: new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "room"}.jpg`, { type: "image/jpeg" }), width: fitted.width, height: fitted.height };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
