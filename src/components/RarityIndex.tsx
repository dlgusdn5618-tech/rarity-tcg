"use client";

/**
 * RarityIndex — 카드 희귀도 인덱스 UI 컴포넌트
 *
 * rarity-score.ts의 RarityIndexData를 받아 표시한다.
 * 현재는 어떤 페이지에도 연결되지 않은 독립 컴포넌트.
 * Phase 2에서 card/[id]/page.tsx에 import해서 사용한다.
 */

import { TrendingDown, TrendingUp, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react";
import type { RarityIndexData } from "@/lib/rarity-score";
import { PRIMARY, SHADOW } from "@/lib/tokens";

// ── 점수 구간별 색상 ──────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#92400E";   // 앰버 골드 — 최상위 희귀
  if (score >= 65) return "#1D4ED8";   // 블루 — 높음
  if (score >= 50) return "#D97706";   // 앰버 — 보통
  return "#9CA3AF";                    // 그레이 — 낮음
}

function scoreLabel(score: number): string {
  if (score >= 80) return "최상위";
  if (score >= 65) return "높음";
  if (score >= 50) return "보통";
  return "낮음";
}

// ── SVG 링 게이지 (라이브러리 없음) ──────────────────────────────────────────

function RingGauge({ score }: { score: number }) {
  const R             = 36;
  const cx            = 48;
  const cy            = 48;
  const circumference = 2 * Math.PI * R;
  const filled        = (score / 100) * circumference;
  const color         = scoreColor(score);

  return (
    <svg width={96} height={96} viewBox="0 0 96 96" aria-label={`레어리티 점수 ${score}`}>
      {/* 배경 트랙 */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={7}
      />
      {/* 진행 아크 */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - filled}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* 점수 */}
      <text
        x={cx} y={cy - 3}
        textAnchor="middle"
        fontSize={22}
        fontWeight={800}
        fill={color}
        fontFamily="inherit"
      >
        {score}
      </text>
      {/* 레이블 */}
      <text
        x={cx} y={cy + 12}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={color}
        opacity={0.75}
        fontFamily="inherit"
      >
        {scoreLabel(score)}
      </text>
    </svg>
  );
}

// ── 가격 신뢰도 바 ────────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 85 ? "#16a34a" :
    value >= 65 ? "#1D4ED8" :
    value >= 45 ? "#D97706" : "#9CA3AF";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span
        className="text-xs shrink-0"
        style={{ color, fontWeight: 700, minWidth: 30, textAlign: "right" }}
      >
        {value}%
      </span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RarityIndexProps {
  data: RarityIndexData;
  /** 헤더에 표시할 카드명 (선택) */
  cardName?: string;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function RarityIndex({ data, cardName }: RarityIndexProps) {
  const {
    rarityScore,
    priceConfidence,
    recentVolume,
    avgDiffPct,
    pricePositionLabel,
    breakdown,
  } = data;

  const isBelow  = avgDiffPct < 0;
  const diffColor = isBelow ? "#16a34a" : avgDiffPct > 5 ? "#dc2626" : "#9CA3AF";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: SHADOW.card }}
    >
      {/* ── 헤더 ── */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid #f4f4f5" }}
      >
        <div className="flex items-center gap-1.5">
          <BarChart2 size={14} strokeWidth={2} color={PRIMARY} />
          <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
            레어리티 인덱스
          </span>
        </div>
        {cardName && (
          <span className="text-[11px] text-gray-400 truncate ml-2" style={{ fontWeight: 400 }}>
            {cardName}
          </span>
        )}
      </div>

      {/* ── 스코어 + 메트릭 ── */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-start gap-3">
          {/* 링 게이지 */}
          <div className="shrink-0">
            <RingGauge score={rarityScore} />
          </div>

          {/* 우측 메트릭 */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 py-0.5">
            {/* 가격 신뢰도 */}
            <div>
              <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>
                가격 신뢰도
              </p>
              <ConfidenceBar value={priceConfidence} />
            </div>

            {/* 거래량 · 평균 대비 */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-xl px-2.5 py-2 text-center"
                style={{ background: "#f9fafb" }}
              >
                <p className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>
                  {recentVolume}건
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                  30일 거래량
                </p>
              </div>

              <div
                className="rounded-xl px-2.5 py-2 text-center"
                style={{ background: isBelow ? "#f0fdf4" : avgDiffPct > 5 ? "#fef2f2" : "#f9fafb" }}
              >
                <p
                  className="text-[15px] flex items-center justify-center gap-0.5"
                  style={{ fontWeight: 800, color: diffColor }}
                >
                  {isBelow
                    ? <TrendingDown size={13} strokeWidth={2.5} />
                    : <TrendingUp   size={13} strokeWidth={2.5} />
                  }
                  {avgDiffPct > 0 ? "+" : ""}{avgDiffPct}%
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                  {pricePositionLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 점수 근거 ── */}
      <div className="px-4 pb-4">
        <div style={{ borderTop: "1px solid #f4f4f5", paddingTop: 12 }}>
          <p
            className="text-[10px] text-gray-400 mb-2"
            style={{ fontWeight: 700, letterSpacing: "0.06em" }}
          >
            점수 산출 근거
          </p>
          <div className="flex flex-col gap-2">
            {breakdown.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                {item.positive
                  ? <CheckCircle2 size={12} strokeWidth={2} color="#16a34a" className="shrink-0 mt-px" />
                  : <AlertCircle  size={12} strokeWidth={2} color="#D97706" className="shrink-0 mt-px" />
                }
                <span className="flex-1 text-[11px] text-gray-600 leading-snug" style={{ fontWeight: 400 }}>
                  {item.reason}
                </span>
                <span
                  className="shrink-0 text-[10px]"
                  style={{
                    fontWeight: 700,
                    color:
                      item.score > 0 ? "#16a34a" :
                      item.score < 0 ? "#dc2626" : "#9ca3af",
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {item.score > 0 ? `+${item.score}` : item.score}pt
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
