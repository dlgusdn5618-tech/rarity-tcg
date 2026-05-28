"use client";

import { PackageSearch } from "lucide-react";

export type EmptyStateProps = {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "primary" | "secondary";
};

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "secondary",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-14 gap-3">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "#f4f4f5" }}
      >
        {icon ?? <PackageSearch size={22} strokeWidth={1.5} color="#a1a1aa" />}
      </div>
      {eyebrow && (
        <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.06em" }}>
          {eyebrow}
        </p>
      )}
      <p className="rr-state-title">{title}</p>
      {description && (
        <p className="rr-state-description max-w-[220px]">{description}</p>
      )}
      {actionLabel && onAction && (
        <div style={{ width: "100%", maxWidth: 200 }}>
          <button
            onClick={onAction}
            className={actionVariant === "primary" ? "rr-button-primary mt-1" : "rr-button-secondary mt-1"}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
