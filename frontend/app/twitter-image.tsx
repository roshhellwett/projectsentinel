import { ImageResponse } from "next/og";

export const alt = "India Verified";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        position: "relative",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(26,26,26,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 6,
            backgroundColor: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #dcdcdc",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              color: "#1a1a1a",
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: "4px",
              marginLeft: "4px",
            }}
          >
            IV
          </span>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.015em",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          India Verified
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#5c5c5c",
            letterSpacing: "0.2px",
          }}
        >
          AI-Verified Indian News · No Ads · No Bias
        </div>

        <div
          style={{
            width: 80,
            height: 1,
            backgroundColor: "#dcdcdc",
            marginTop: 40,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
