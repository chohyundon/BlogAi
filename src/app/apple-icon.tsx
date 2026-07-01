import { BrandIconImage } from "@/shared/lib/brandIconImage";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <BrandIconImage size={180} iconSize={96} borderRadius={40} />,
    size,
  );
}
