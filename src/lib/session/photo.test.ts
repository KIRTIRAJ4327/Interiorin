import { describe, expect, it } from "vitest";
import { fittedImageSize, isSupportedRoomImage, isUnsupportedHeic } from "./photo";

describe("mobile photo normalization", () => {
  it("caps the longest edge without upscaling", () => {
    expect(fittedImageSize(4032, 3024)).toEqual({ width: 2048, height: 1536 });
    expect(fittedImageSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
  it("rejects HEIC before attempting browser decode", () => {
    expect(isUnsupportedHeic({ name: "room.HEIC", type: "image/heic" } as File)).toBe(true);
  });
  it("accepts only the browser-decodable deadline formats", () => {
    expect(isSupportedRoomImage({ name: "room.jpg", type: "image/jpeg" } as File)).toBe(true);
    expect(isSupportedRoomImage({ name: "room.webp", type: "image/webp" } as File)).toBe(true);
    expect(isSupportedRoomImage({ name: "room.svg", type: "image/svg+xml" } as File)).toBe(false);
  });
});
