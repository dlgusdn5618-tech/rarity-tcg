"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExchangeBalanceBoard,
  type BalanceReport,
} from "@/components/ExchangeBalanceBoard";

const PRIMARY = "#D62828";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  "진행중": { bg: "#eff6ff", color: "#3b82f6",  label: "교환 진행중" },
  "완료":   { bg: "#f0fdf4", color: "#10b981",  label: "교환 완료"   },
  "취소됨": { bg: "#f9fafb", color: "#9ca3af",  label: "취소됨"      },
  "대기중": { bg: "#fefce8", color: "#d97706",  label: "상대방 수락 대기" },
};

const TRADES = [
  {
    id: 1,
    myCard:    { name: "꼬부기 ex",   grade: "SR",  emoji: "💧", condition: "A급" },
    theirCard: { name: "피카츄 ex",   grade: "SAR", emoji: "⚡", condition: "S급" },
    partner: "피카덕후",
    status: "진행중",
    date: "2026.05.21",
    priceDiff: 0,
  },
  {
    id: 2,
    myCard:    { name: "이상해꽃",    grade: "SR",  emoji: "🌿", condition: "B급" },
    theirCard: { name: "조로",        grade: "SR",  emoji: "⚔️", condition: "A급" },
    partner: "조로팬클럽",
    status: "완료",
    date: "2026.05.12",
    priceDiff: +5000,
  },
  {
    id: 3,
    myCard:    { name: "뮤 ex",       grade: "SAR", emoji: "💜", condition: "S급" },
    theirCard: { name: "에이스",      grade: "UR",  emoji: "🔥", condition: "S급" },
    partner: "불꽃트레이너",
    status: "대기중",
    date: "2026.05.19",
    priceDiff: -10000,
  },
  {
    id: 4,
    myCard:    { name: "잠만보 ex",   grade: "SR",  emoji: "😴", condition: "A급" },
    theirCard: { name: "루피",        grade: "SAR", emoji: "👒", condition: "S급" },
    partner: "트레이너_루피",
    status: "취소됨",
    date: "2026.04.28",
    priceDiff: 0,
  },
];

// ── Mock balance report data ──────────────────────────────────────
const BALANCE_REPORTS: Record<number, BalanceReport> = {
  1: {
    myCard: {
      name: "꼬부기 ex",
      tcg: "Pokemon",
      rarity: "SR",
      condition: "A급",
      gradingCompany: "-",
      grade: "-",
      recentPrice: 55000,
      scarcity: "Medium",
    },
    theirCard: {
      name: "피카츄 ex",
      tcg: "Pokemon",
      rarity: "SAR",
      condition: "S급",
      gradingCompany: "-",
      grade: "-",
      recentPrice: 63000,
      scarcity: "High",
    },
    extraCashRange: [4000, 8000],
    extraCashPayer: "me",
    fitPercent: 87,
    analysisNote:
      "상대 카드가 SAR로 레어도가 한 단계 높고 컨디션도 우세합니다. 5,000원 내외의 추가금을 제안하면 양측 모두 수긍 가능한 조건입니다.",
  },
  3: {
    myCard: {
      name: "뮤 ex",
      tcg: "Pokemon",
      rarity: "SAR",
      condition: "S급",
      gradingCompany: "PSA",
      grade: "9",
      recentPrice: 142000,
      scarcity: "High",
    },
    theirCard: {
      name: "에이스",
      tcg: "One Piece",
      rarity: "UR",
      condition: "S급",
      gradingCompany: "-",
      grade: "-",
      recentPrice: 130000,
      scarcity: "High",
    },
    extraCashRange: [5000, 12000],
    extraCashPayer: "them",
    fitPercent: 91,
    analysisNote:
      "PSA 9 감정으로 내 카드 신뢰도가 높고 시세도 소폭 우위입니다. 추가금 5,000~12,000원을 상대방이 지급하거나 동등 교환을 제안할 수 있습니다.",
  },
};

type Tab = "전체" | "진행중" | "완료" | "취소됨";

export default function TradesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("전체");
  const [expandedBalance, setExpandedBalance] = useState<number | null>(null);

  const visible = TRADES.filter((t) => {
    if (tab === "전체") return true;
    if (tab === "진행중") return t.status === "진행중" || t.status === "대기중";
    return t.status === tab;
  });

  const counts = {
    "전체":   TRADES.length,
    "진행중":  TRADES.filter((t) => t.status === "진행중" || t.status === "대기중").length,
    "완료":   TRADES.filter((t) => t.status === "완료").length,
    "취소됨": TRADES.filter((t) => t.status === "취소됨").length,
  };

  const isActive = (status: string) => status === "진행중" || status === "대기중";

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>교환내역</h1>
      </header>

      {/* 탭 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {(["전체", "진행중", "완료", "취소됨"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
            style={{
              background: tab === t ? PRIMARY : "#f3f4f6",
              color: tab === t ? "#fff" : "#6b7280",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t} {counts[t] > 0 && <span style={{ opacity: 0.8 }}>({counts[t]})</span>}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="mt-2 bg-white divide-y divide-gray-50">
        {visible.map((trade) => {
          const st = STATUS_STYLE[trade.status];
          const hasBalance = isActive(trade.status) && !!BALANCE_REPORTS[trade.id];
          const isOpen = expandedBalance === trade.id;

          return (
            <div key={trade.id} className="px-4 py-4">

              {/* 상태 + 날짜 */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.color, fontWeight: 600 }}
                >
                  {st.label}
                </span>
                <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{trade.date}</span>
              </div>

              {/* 카드 교환 시각화 */}
              <div className="flex items-center gap-2">
                {/* 내 카드 */}
                <div className="flex-1 bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex flex-col overflow-hidden shrink-0 border border-gray-200">
                    <div className="h-1 w-full" style={{ background: "#E53E3E" }} />
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[10px] text-gray-600 leading-none" style={{ fontWeight: 700 }}>{trade.myCard.grade}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>내 카드</p>
                    <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{trade.myCard.name}</p>
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>
                      {trade.myCard.grade} · {trade.myCard.condition}
                    </p>
                  </div>
                </div>

                {/* 화살표 */}
                <div className="shrink-0 flex flex-col items-center">
                  <span className="text-gray-400 text-sm">⇄</span>
                  {trade.priceDiff !== 0 && (
                    <span
                      className="text-[9px] mt-0.5"
                      style={{ color: trade.priceDiff > 0 ? "#10b981" : PRIMARY, fontWeight: 600 }}
                    >
                      {trade.priceDiff > 0 ? "+" : ""}{trade.priceDiff.toLocaleString()}원
                    </span>
                  )}
                </div>

                {/* 상대방 카드 */}
                <div className="flex-1 bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex flex-col overflow-hidden shrink-0 border border-gray-200">
                    <div className="h-1 w-full" style={{ background: "#E53E3E" }} />
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[10px] text-gray-600 leading-none" style={{ fontWeight: 700 }}>{trade.theirCard.grade}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>상대 카드</p>
                    <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{trade.theirCard.name}</p>
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>
                      {trade.theirCard.grade} · {trade.theirCard.condition}
                    </p>
                  </div>
                </div>
              </div>

              {/* 파트너 + 액션 */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>
                  상대방 <span className="text-gray-700" style={{ fontWeight: 500 }}>{trade.partner}</span>
                </p>
                <div className="flex gap-2">
                  {/* 밸런스 분석 버튼 (진행중/대기중) */}
                  {hasBalance && (
                    <button
                      onClick={() => setExpandedBalance(isOpen ? null : trade.id)}
                      className="text-xs px-3 py-1.5 rounded-xl transition-colors"
                      style={{
                        background: isOpen ? "#111" : "#f3f4f6",
                        color: isOpen ? "white" : "#374151",
                        fontWeight: 600,
                      }}
                    >
                      {isOpen ? "접기" : "밸런스 분석"}
                    </button>
                  )}
                  {(trade.status === "진행중" || trade.status === "대기중") && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-xl border"
                      style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                      onClick={() => router.push("/chat")}
                    >
                      채팅
                    </button>
                  )}
                  {trade.status === "대기중" && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-xl text-white"
                      style={{ background: PRIMARY, fontWeight: 600 }}
                    >
                      취소하기
                    </button>
                  )}
                  {trade.status === "완료" && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-xl"
                      style={{ background: "#f9fafb", color: "#6b7280", fontWeight: 500 }}
                    >
                      ⭐ 리뷰 쓰기
                    </button>
                  )}
                </div>
              </div>

              {/* 교환 밸런스 보드 (expand) */}
              {isOpen && BALANCE_REPORTS[trade.id] && (
                <div className="mt-4">
                  <ExchangeBalanceBoard
                    report={BALANCE_REPORTS[trade.id]}
                    onChat={() => router.push("/chat")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🔄</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>교환내역이 없어요</p>
          <button
            className="mt-4 text-sm text-white px-5 py-2.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
            onClick={() => router.push("/explore")}
          >
            교환할 카드 찾기
          </button>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
