"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import {
  MOCK_COLLECTION,
  getCollectionStats,
  getSellRecommendations,
  getTradeMatches,
} from "@/lib/collection";

export function HomeCollectionSummary() {
  const router     = useRouter();
  const stats      = getCollectionStats(MOCK_COLLECTION);
  const sellCount  = getSellRecommendations(MOCK_COLLECTION).length;
  const tradeCount = getTradeMatches(MOCK_COLLECTION).length;

  const gainPositive = stats.unrealizedGain >= 0;
  const gainColor    = gainPositive ? "#16a34a" : "#dc2626";
  const GainIcon     = gainPositive ? TrendingUp : TrendingDown;

  return (
    <div className="px-4">
      <div className="rr-card px-4 py-3.5">

        {/* 섹션 라벨 */}
        <p className="text-[10px] text-gray-400 mb-2" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
          내 컬렉션 현황
        </p>

        {/* 컬렉션 가치 */}
        <p className="rr-price text-[24px] text-gray-900 leading-none mb-1">
          {stats.totalValue.toLocaleString("ko-KR")}원
        </p>

        {/* 가치 변동 */}
        <div className="flex items-center gap-1 mb-3">
          <GainIcon size={11} strokeWidth={2.5} color={gainColor} />
          <span className="text-[11px]" style={{ color: gainColor, fontWeight: 600 }}>
            {gainPositive ? "+" : ""}{stats.unrealizedGain.toLocaleString("ko-KR")}원
          </span>
          <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>현재 가치 변동</span>
        </div>

        {/* 요약 칩 + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {sellCount > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}
              >
                팔아볼 카드 {sellCount}장
              </span>
            )}
            {tradeCount > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600 }}
              >
                교환 후보 {tradeCount}건
              </span>
            )}
          </div>
          <button
            className="rr-button-ghost flex items-center gap-0.5 shrink-0"
            onClick={() => router.push("/mypage/collection")}
          >
            <span className="text-[11px]">컬렉션 보기</span>
            <ChevronRight size={11} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}
