import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        <div
          style={{
            width: 26,
            height: 24,
            borderRadius: "50%",
            border: "2.5px solid #1A1A1A",
            background: "#F5F1E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#1A1A1A",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#1A1A1A",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
