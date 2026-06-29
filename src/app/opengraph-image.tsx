import { siteDescription } from "@/shared/config/site";
import { ImageResponse } from "next/og";

export const alt = siteDescription;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #070b1f 0%, #111a3a 50%, #f59e0b 140%)",
        color: "white",
        padding: "72px",
        fontFamily: "Arial, sans-serif",
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          fontSize: "34px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "24px",
            background: "rgba(245, 158, 11, 0.18)",
            border: "2px solid rgba(245, 158, 11, 0.55)",
            color: "#fbbf24",
          }}>
          B
        </div>
        BlogAi
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            maxWidth: "920px",
            fontSize: "76px",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.06em",
          }}>
          AI로 더 스마트한 기술 블로그 작성
        </div>
        <div
          style={{
            maxWidth: "840px",
            color: "#cbd5e1",
            fontSize: "30px",
            lineHeight: 1.35,
          }}>
          개발자를 위한 글 구조화, 초안 생성, Markdown 편집을 한 곳에서
          시작하세요.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#fbbf24",
          fontSize: "26px",
          fontWeight: 700,
        }}>
        <span>www.blogai.store</span>
        <span>Developer Blog Writing Assistant</span>
      </div>
    </div>,
    size,
  );
}
