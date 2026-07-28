import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F1E8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "6px solid #1A1A1A",
              background: "#F5F1E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#1A1A1A",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#1A1A1A",
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "#1A1A1A",
                fontFamily: "serif",
                display: "flex",
              }}
            >
              Paper Finder
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#1A1A1A",
                opacity: 0.7,
                fontFamily: "sans-serif",
                display: "flex",
                maxWidth: 700,
              }}
            >
              Search arXiv, Semantic Scholar &amp; Crossref at once. No login,
              ever.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
