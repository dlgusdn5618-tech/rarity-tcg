"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, TrendingUp, TrendingDown, Tag, ArrowLeftRight,
  Copy, ChevronRight, Minus,
} from "lucide-react";
import {
  MOCK_COLLECTION,
  getCollectionStats,
  getSellRecommendations,
  getTradeMatches,
  getDuplicates,
  gainPct,
  type CollectionCard,
  type SellRecommendation,
  type TradeMatch,
} from "@/lib/collection";
import { RARITY_CHIP, PRIMARY, SHADOW, SEMANTIC } from "@/lib/tokens";
import { EmptyState } from "@/components/EmptyState";
import { CardVisual } from "@/components/CardVisual";

// ── 탭 정의 ───────────────────────────────────────────────────────────────────

type Tab = "전체" | "팔아볼 카드" | "교환 후보" | "중복 카드";
const TABS: Tab[] = ["전체", "팔아볼 카드", "교환 후보", "중복 카드"];

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function pctColor(pct: number) {
  if (pct > 0) return "#16a34a";
  if (pct < 0) return "#dc2626";
  return "#9ca3af";
}

// ── 레어도 칩 ─────────────────────────────────────────────────────────────────

function RarityChip({ rarity }: { rarity: string }) {
  const chip = RARITY_CHIP[rarity] ?? { bg: "#f4f4f5", color: "#71717a" };
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded"
      style={{ background: chip.bg, color: chip.color, fontWeight: 700 }}
    >
      {rarity}
    </span>
  );
}

// ── "지금 볼 것" 인사이트 카드 ─────────────────────────────────────────────────

type Insight = {
  text: string;
  actionLabel: string;
  actionHref: string;
  color: string;
  bg: string;
  Icon: React.ElementType;
};

function buildInsights(
  sellRecs: SellRecommendation[],
  tradeMatches: TradeMatch[],
  duplicates: CollectionCard[],
): Insight[] {
  const insights: Insight[] = [];

  if (sellRecs.length > 0) {
    const top = sellRecs[0];
    const pct = gainPct(top.card);
    insights.push({
      text: `${top.card.nameKo}가 현재 +${pct}% 올랐어요. 팔아볼 카드로 등록할 수 있어요.`,
      actionLabel: "판매 보기",
      actionHref: "/sell",
      color: SEMANTIC.success,
      bg: SEMANTIC.successBg,
      Icon: TrendingUp,
    });
  }

  if (tradeMatches.length > 0) {
    const top = tradeMatches[0];
    insights.push({
      text: `${top.myCard.nameKo}는 교환 조건이 잘 맞는 상대가 있어요.`,
      actionLabel: "교환 보기",
      actionHref: "/exchange/propose",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      Icon: ArrowLeftRight,
    });
  }

  if (duplicates.length > 0) {
    insights.push({
      text: `중복 카드 ${duplicates.length}장이 있어요. 판매 후보로 볼 수 있어요.`,
      actionLabel: "중복 보기",
      actionHref: "",
      color: "#B45309",
      bg: "#FFFBEB",
      Icon: Copy,
    });
  }

  // 가격이 내려간 카드가 있으면 마지막에 추가 (최대 3개)
  const losingCards = MOCK_COLLECTION.filter((c) => gainPct(c) < 0);
  if (losingCards.length > 0 && insights.length < 3) {
    const worst = losingCards.reduce((a, b) => (gainPct(a) < gainPct(b) ? a : b));
    insights.push({
      text: `${worst.nameKo}는 현재 가격이 내려간 상태예요. 잠시 기다려보는 게 좋을 수 있어요.`,
      actionLabel: "",
      actionHref: "",
      color: "#9ca3af",
      bg: "#f9fafb",
      Icon: Minus,
    });
  }

  return insights.slice(0, 3);
}

function InsightCard({ insight, onActionClick }: { insight: Insight; onActionClick: (href: string) => void }) {
  const { Icon } = insight;
  return (
    <div
      className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
      style={{ background: insight.bg }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Icon size={13} strokeWidth={2.5} color={insight.color} />
      </div>
      <p className="flex-1 text-[12px] leading-snug text-gray-700" style={{ fontWeight: 500 }}>
        {insight.text}
      </p>
      {insight.actionLabel && (
        <button
          onClick={() => onActionClick(insight.actionHref)}
          className="rr-button-ghost shrink-0 gap-0.5"
          style={{ color: insight.color, fontWeight: 700 }}
        >
          <span className="text-[11px]">{insight.actionLabel}</span>
          <ChevronRight size={11} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ── 카드 행 (전체 · 중복 탭) ───────────────────────────────────────────────────

function CardRow({
  card,
  hasSellRec,
  hasTrade,
}: {
  card: CollectionCard;
  hasSellRec: boolean;
  hasTrade: boolean;
}) {
  const router = useRouter();
  const pct = gainPct(card);
  const color = pctColor(pct);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;

  return (
    <div className="rr-card p-3">
      <div className="flex items-start gap-3">
        <CardVisual size="sm" rarity={card.rarity} graded={card.isGraded} grade={card.gradingInfo} />

        <div className="flex-1 min-w-0">
          {/* 상단: 이름 · 칩 / 현재가 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{card.nameKo}</span>
              <RarityChip rarity={card.rarity} />
              {card.isGraded && card.gradingInfo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }}>
                  {card.gradingInfo}
                </span>
              )}
              {card.quantity > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#FFFBEB", color: "#B45309", fontWeight: 700 }}>
                  x{card.quantity}
                </span>
              )}
            </div>
            <span className="rr-metric text-[15px] text-gray-900 shrink-0">
              {fmt(card.currentPrice)}원
            </span>
          </div>

          {/* 하단: 내 기준가 / 변동% */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>
              내 기준가 {fmt(card.acquiredPrice)}원
            </span>
            <div className="flex items-center gap-0.5">
              <Icon size={11} strokeWidth={2.5} color={color} />
              <span className="text-[12px]" style={{ color, fontWeight: 700 }}>
                {pct > 0 ? "+" : ""}{pct}%
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          {(hasSellRec || hasTrade) && (
            <div className="flex gap-2">
              {hasSellRec && (
                <button
                  onClick={() => router.push("/sell")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs"
                  style={{ background: PRIMARY, fontWeight: 700 }}
                >
                  <Tag size={12} strokeWidth={2.5} />
                  판매 등록하기
                </button>
              )}
              {hasTrade && (
                <button
                  onClick={() => router.push("/exchange/propose")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
                  style={{ background: "#f4f4f5", color: "#374151", fontWeight: 700 }}
                >
                  <ArrowLeftRight size={12} strokeWidth={2.5} />
                  교환 찾기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 팔아볼 카드 탭 행 ─────────────────────────────────────────────────────────

function SellRecRow({ rec }: { rec: SellRecommendation }) {
  const router = useRouter();
  const { card, reason, suggestedPrice } = rec;
  const pct = gainPct(card);
  const color = pctColor(pct);
  const Icon = pct > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="rr-card px-4 py-3.5">
      {/* 상단 */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{card.nameKo}</span>
          <RarityChip rarity={card.rarity} />
        </div>
        <span className="rr-metric text-[15px] text-gray-900 shrink-0">
          {fmt(card.currentPrice)}원
        </span>
      </div>

      {/* 내 기준가 / 변동% */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>
          내 기준가 {fmt(card.acquiredPrice)}원
        </span>
        <div className="flex items-center gap-0.5">
          <Icon size={11} strokeWidth={2.5} color={color} />
          <span className="text-[12px]" style={{ color, fontWeight: 700 }}>
            {pct > 0 ? "+" : ""}{pct}%
          </span>
        </div>
      </div>

      {/* 추천 이유 */}
      <div className="rounded-xl px-3 py-2 mb-2.5 flex items-start gap-2" style={{ background: SEMANTIC.successBg }}>
        <TrendingUp size={12} strokeWidth={2} color={SEMANTIC.success} className="shrink-0 mt-px" />
        <p className="text-[11px] leading-snug" style={{ color: "#166534", fontWeight: 500 }}>
          {reason}
        </p>
      </div>

      {/* 추천 판매가 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>추천 판매가</span>
        <span className="text-[14px]" style={{ color: PRIMARY, fontWeight: 800 }}>
          {fmt(suggestedPrice)}원
        </span>
      </div>

      <button
        onClick={() => router.push("/sell")}
        className="rr-button-primary gap-1.5"
      >
        <Tag size={13} strokeWidth={2.5} />
        판매 등록하기
      </button>
    </div>
  );
}

// ── 교환 후보 탭 행 ───────────────────────────────────────────────────────────

function TradeMatchRow({ match }: { match: TradeMatch }) {
  const router = useRouter();
  const { myCard, targetCardName, targetRarity, matchScore, priceDiff, matchedUserHandle } = match;

  const scoreColor =
    matchScore >= 90 ? "#16a34a" :
    matchScore >= 75 ? "#1D4ED8" : "#D97706";

  const diffSign  = priceDiff > 0 ? "+" : "";
  const diffColor = priceDiff > 0 ? "#16a34a" : priceDiff < 0 ? "#dc2626" : "#9ca3af";

  return (
    <div className="rr-card px-4 py-3.5">
      {/* 내 카드 → 상대 카드 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>내 카드</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{myCard.nameKo}</span>
            <RarityChip rarity={myCard.rarity} />
          </div>
        </div>
        <ArrowLeftRight size={15} strokeWidth={2} color="#d1d5db" className="shrink-0" />
        <div className="flex-1 min-w-0 text-right">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>상대 카드</p>
          <div className="flex items-center gap-1.5 justify-end">
            <RarityChip rarity={targetRarity} />
            <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{targetCardName}</span>
          </div>
        </div>
      </div>

      {/* 핵심 수치 3개 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl py-2 text-center" style={{ background: "#f9fafb" }}>
          <p className="rr-metric text-[14px]" style={{ color: scoreColor }}>{matchScore}%</p>
          <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>교환 적정도</p>
        </div>
        <div className="rounded-xl py-2 text-center" style={{ background: "#f9fafb" }}>
          <p className="rr-metric text-[12px]" style={{ color: diffColor }}>{diffSign}{fmt(priceDiff)}원</p>
          <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
            {priceDiff > 0 ? "상대 추가금 가능" : priceDiff < 0 ? "내 추가금 가능" : "균형"}
          </p>
        </div>
        <div className="rounded-xl py-2 text-center" style={{ background: "#f9fafb" }}>
          <p className="text-[11px] text-gray-700" style={{ fontWeight: 700 }}>{matchedUserHandle}</p>
          <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>매칭 상대</p>
        </div>
      </div>

      <button
        onClick={() => router.push("/exchange/propose")}
        className="rr-button-secondary gap-1.5"
        style={{ background: "#f4f4f5", color: "#111827" }}
      >
        <ArrowLeftRight size={13} strokeWidth={2.5} />
        교환하기 좋은 카드 보기
      </button>
    </div>
  );
}


// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("전체");

  const stats        = getCollectionStats(MOCK_COLLECTION);
  const sellRecs     = getSellRecommendations(MOCK_COLLECTION);
  const tradeMatches = getTradeMatches(MOCK_COLLECTION);
  const duplicates   = getDuplicates(MOCK_COLLECTION);
  const insights     = buildInsights(sellRecs, tradeMatches, duplicates);

  const sellRecIds = new Set(sellRecs.map((r) => r.card.id));
  const tradeIds   = new Set(tradeMatches.map((m) => m.myCard.id));

  const gainPositive = stats.unrealizedGain >= 0;
  const gainColor    = gainPositive ? SEMANTIC.success : SEMANTIC.error;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAFA" }}>
      <div className="w-full max-w-[430px] mx-auto">

        {/* ── 헤더 ── */}
        <div
          className="sticky top-0 z-10 bg-white px-4 pt-12 pb-3"
          style={{ borderBottom: "1px solid #f4f4f5" }}
        >
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg active:bg-gray-100">
              <ChevronLeft size={22} strokeWidth={2} color="#111827" />
            </button>
            <h1 className="text-lg text-gray-900" style={{ fontWeight: 800 }}>컬렉션 금고</h1>
          </div>
        </div>

        <div className="px-4 pt-5 flex flex-col gap-4">

          {/* ── 자산 요약 ── */}
          <div className="rr-card px-5 py-4">
            <p className="text-[11px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>내 컬렉션 가치</p>
            <p className="rr-price text-[32px] text-gray-900 leading-none mb-1">
              {fmt(stats.totalValue)}<span className="text-base ml-1 text-gray-500" style={{ fontWeight: 400 }}>원</span>
            </p>
            <div className="flex items-center gap-1 mb-3">
              {gainPositive
                ? <TrendingUp size={12} strokeWidth={2.5} color={gainColor} />
                : <TrendingDown size={12} strokeWidth={2.5} color={gainColor} />
              }
              <span className="rr-metric text-[13px]" style={{ color: gainColor }}>
                {gainPositive ? "+" : ""}{fmt(stats.unrealizedGain)}원
              </span>
              <span className="text-[11px] text-gray-400 ml-0.5" style={{ fontWeight: 400 }}>현재 가치 변동</span>
            </div>
            <p className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>
              보유 {stats.cardCount}장 · 팔아볼 카드 {sellRecs.length}장 · 교환 후보 {tradeMatches.length}장
            </p>
          </div>

          {/* ── 지금 볼 것 ── */}
          {insights.length > 0 && (
            <div>
              <p className="text-[12px] text-gray-500 mb-2 px-1" style={{ fontWeight: 700 }}>지금 볼 것</p>
              <div className="flex flex-col gap-2">
                {insights.map((insight, i) => (
                  <InsightCard
                    key={i}
                    insight={insight}
                    onActionClick={(href) => {
                      if (href) router.push(href);
                      else setActiveTab("중복 카드");
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── 탭 바 ── */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "#f4f4f5" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 rounded-xl text-[11px] transition-all"
                  style={{
                    background: active ? "#ffffff" : "transparent",
                    color:      active ? "#111827" : "#9ca3af",
                    fontWeight: active ? 700 : 500,
                    boxShadow:  active ? SHADOW.subtle : "none",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* ── 탭 콘텐츠 ── */}
          <div className="flex flex-col gap-3 pb-4">

            {activeTab === "전체" && (
              MOCK_COLLECTION.length === 0
                ? <EmptyState
                    title="아직 등록한 카드가 없어요"
                    description="내 카드를 등록하면 자산 가치와 교환 기회를 볼 수 있어요."
                  />
                : MOCK_COLLECTION.map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    hasSellRec={sellRecIds.has(card.id)}
                    hasTrade={tradeIds.has(card.id)}
                  />
                ))
            )}

            {activeTab === "팔아볼 카드" && (
              sellRecs.length === 0
                ? <EmptyState
                    title="지금은 판매 추천 카드가 없어요"
                    description="가격 변동이 생기면 다시 알려드릴게요."
                  />
                : sellRecs.map((rec) => (
                  <SellRecRow key={rec.card.id} rec={rec} />
                ))
            )}

            {activeTab === "교환 후보" && (
              tradeMatches.length === 0
                ? <EmptyState
                    title="맞는 교환 후보가 아직 없어요"
                    description="컬렉션이 쌓일수록 더 정확한 매칭을 받을 수 있어요."
                  />
                : tradeMatches.map((match) => (
                  <TradeMatchRow key={match.myCard.id} match={match} />
                ))
            )}

            {activeTab === "중복 카드" && (
              duplicates.length === 0
                ? <EmptyState
                    title="중복 보유 카드가 없어요"
                    description="같은 카드를 2장 이상 보유하면 여기에서 모아볼 수 있어요."
                  />
                : duplicates.map((card) => (
                  <div key={card.id}>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <Copy size={11} strokeWidth={2} color="#B45309" />
                      <p className="text-[11px]" style={{ color: "#B45309", fontWeight: 700 }}>
                        {card.quantity}장 보유 중
                      </p>
                    </div>
                    <CardRow
                      card={card}
                      hasSellRec={sellRecIds.has(card.id)}
                      hasTrade={tradeIds.has(card.id)}
                    />
                  </div>
                ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
