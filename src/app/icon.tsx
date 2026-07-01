import { BrandIconImage } from "@/shared/lib/brandIconImage";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <BrandIconImage size={32} iconSize={18} borderRadius={8} />,
    size,
  );
}
