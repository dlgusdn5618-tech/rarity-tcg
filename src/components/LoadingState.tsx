"use client";

import { Sparkles } from "lucide-react";

export type LoadingStateProps = {
  variant?: "list" | "card" | "scanner";
  rows?: number;
  label?: string;
};

function SkeletonBlock({ w, h }: { w?: string | number; h: number }) {
  return (
    <div className="rr-skeleton" style={{ width: w ?? "100%", height: h }} />
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rr-card p-3">
          <div className="flex items-start gap-3">
            <div
              className="rr-skeleton shrink-0"
              style={{ width: 40, height: 58, borderRadius: 8 }}
            />
            <div className="flex-1 flex flex-col gap-2 pt-1">
              <SkeletonBlock w="65%" h={13} />
              <SkeletonBlock w="45%" h={10} />
              <SkeletonBlock w="80%" h={11} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rr-card p-4 flex flex-col gap-3">
      <SkeletonBlock w="55%" h={16} />
      <SkeletonBlock w="70%" h={11} />
      <SkeletonBlock w="40%" h={11} />
    </div>
  );
}

function ScannerLoading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#111827" }}
      >
        <Sparkles size={28} strokeWidth={1.5} color="#F6C90E" className="animate-pulse" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="rr-state-title">{label ?? "AI가 카드 패스포트를 읽는 중"}</p>
        <p className="rr-state-description">카드명, 세트, 상태 정보를 추정하고 있어요.</p>
      </div>
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
        <div className="rr-skeleton h-full rounded-full" style={{ width: "100%" }} />
      </div>
    </div>
  );
}

export function LoadingState({ variant = "list", rows = 3, label }: LoadingStateProps) {
  if (variant === "scanner") return <ScannerLoading label={label} />;
  if (variant === "card") return <CardSkeleton />;
  return <ListSkeleton rows={rows} />;
}
