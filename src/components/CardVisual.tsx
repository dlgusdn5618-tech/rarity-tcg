"use client";

import { useState, useEffect } from "react";

export type CardVisualProps = {
  name?: string;
  rarity?: string;
  imageUrl?: string;
  graded?: boolean;
  grade?: string;
  size?: "sm" | "md" | "lg";
  variant?: "thumbnail" | "detail" | "compact";
};

const RARITY_COLOR: Record<string, string> = {
  SAR:    "#92400E",
  UR:     "#6D28D9",
  SR:     "#B91C1C",
  PROMO:  "#1D4ED8",
  R:      "#0369A1",
  TROPHY: "#92400E",
  IR:     "#0D9488",
  RR:     "#475569",
};

const SIZE_DIM = {
  sm: { w: 40,  h: 58,  r: 6,  bar: 3, foot: 14, fs: 7,  pad: 4  },
  md: { w: 58,  h: 80,  r: 8,  bar: 3, foot: 16, fs: 8,  pad: 6  },
  lg: { w: 128, h: 176, r: 14, bar: 5, foot: 28, fs: 11, pad: 10 },
} as const;

function parseGrade(grade: string): { company: string; score: string } {
  const parts = grade.trim().split(" ");
  if (parts.length >= 2) return { company: parts[0], score: parts.slice(1).join(" ") };
  return { company: "PSA", score: grade };
}

function CardFrame({
  name,
  rarity,
  imageUrl,
  size,
  variant,
}: {
  name?: string;
  rarity?: string;
  imageUrl?: string;
  size: "sm" | "md" | "lg";
  variant: "thumbnail" | "detail" | "compact";
}) {
  const dim = SIZE_DIM[size];
  const accentColor = RARITY_COLOR[rarity ?? ""] ?? "#64748b";
  const showFooter = variant !== "compact";
  const showName = size === "lg" && !!name;

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const shouldShowImage = !!imageUrl && !imageFailed;

  return (
    <div
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: dim.r,
        border: `1px solid ${accentColor}38`,
        background: `linear-gradient(175deg, ${accentColor}10 0%, #f6f6f6 55%)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* top accent bar */}
      <div style={{ height: dim.bar, background: accentColor, flexShrink: 0 }} />

      {/* artwork area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: dim.pad,
          overflow: "hidden",
        }}
      >
        {shouldShowImage ? (
          <img
            src={imageUrl}
            alt={name ? `${name} 카드 이미지` : "카드 이미지"}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${accentColor}22`,
              background: `radial-gradient(ellipse at 50% 30%, ${accentColor}20, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* footer label */}
      {showFooter && (
        <div
          style={{
            height: dim.foot,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 4,
            paddingRight: 4,
            background: `${accentColor}15`,
            borderTop: `1px solid ${accentColor}20`,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: dim.fs,
              color: accentColor,
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {showName ? name : (rarity ?? "TCG")}
          </span>
        </div>
      )}
    </div>
  );
}

export function CardVisual({
  name,
  rarity,
  imageUrl,
  graded = false,
  grade,
  size = "md",
  variant = "thumbnail",
}: CardVisualProps) {
  if (graded && grade && grade !== "Ungraded") {
    const { company, score } = parseGrade(grade);
    const slabPad  = size === "lg" ? 8 : 3;
    const barH     = size === "lg" ? 22 : 14;
    const companyFs = size === "lg" ? 9 : 7;
    const scoreFs  = size === "lg" ? 12 : 9;

    return (
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          borderRadius: size === "lg" ? 8 : 4,
          border: "1.5px solid #374151",
          background: "#f8fafc",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          flexShrink: 0,
        }}
      >
        {/* slab header */}
        <div
          style={{
            height: barH,
            background: "#1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <span
            style={{
              fontSize: companyFs,
              color: "#9ca3af",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {company}
          </span>
          <span
            style={{
              fontSize: scoreFs,
              color: "#ffffff",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            {score}
          </span>
        </div>

        {/* card inside slab */}
        <div style={{ padding: slabPad }}>
          <CardFrame
            name={name}
            rarity={rarity}
            imageUrl={imageUrl}
            size={size}
            variant={variant}
          />
        </div>
      </div>
    );
  }

  return (
    <CardFrame
      name={name}
      rarity={rarity}
      imageUrl={imageUrl}
      size={size}
      variant={variant}
    />
  );
}
