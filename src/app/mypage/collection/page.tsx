"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, TrendingUp, TrendingDown, Tag, ArrowLeftRight,
  Copy, Layers, BarChart2, ShoppingBag, Minus,
} from "lucide-react";
import {
  MOCK_COLLECTION,
  getCollectionStats,
  getSellRecommendations,
  getTradeMatches,
  getDuplicates,
  gainPct,
  gainAbs,
  type CollectionCard,
  type SellRecommendation,
  type TradeMatch,
} from "@/lib/collection";
import { RARITY_CHIP, PRIMARY, SHADOW, SEMANTIC } from "@/lib/tokens";

// ── 탭 정의 ───────────────────────────────────────────────────────────────────

type Tab = "전체" | "판매 추천" | "교환 추천" | "중복 보유";
const TABS: Tab[] = ["전체", "판매 추천", "교환 추천", "중복 보유"];

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function gainColor(pct: number) {
  if (pct > 0)  return "#16a34a";
  if (pct < 0)  return "#dc2626";
  return "#9ca3af";
}

// ── 서브 컴포넌트: 레어도 칩 ──────────────────────────────────────────────────

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

// ── 서브 컴포넌트: 손익 뱃지 ──────────────────────────────────────────────────

function GainBadge({ card }: { card: CollectionCard }) {
  const pct = gainPct(card);
  const abs = gainAbs(card);
  const color = gainColor(pct);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-0.5">
      <Icon size={11} strokeWidth={2.5} color={color} />
      <span className="text-[11px]" style={{ color, fontWeight: 700 }}>
        {pct > 0 ? "+" : ""}{pct}%
      </span>
      <span className="text-[10px] text-gray-400 ml-0.5" style={{ fontWeight: 400 }}>
        ({abs >= 0 ? "+" : ""}{fmt(abs)}원)
      </span>
    </div>
  );
}

// ── 서브 컴포넌트: 카드 행 (전체·중복 탭) ─────────────────────────────────────

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
  const gainBg =
    pct > 0 ? SEMANTIC.successBg :
    pct < 0 ? SEMANTIC.errorBg   : "#f9fafb";

  return (
    <div
      className="bg-white rounded-2xl px-4 py-3"
      style={{ boxShadow: SHADOW.card }}
    >
      {/* 상단: 이름 + 뱃지 행 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>
            {card.nameKo}
          </span>
          <RarityChip rarity={card.rarity} />
          {card.isGraded && card.gradingInfo && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }}
            >
              {card.gradingInfo}
            </span>
          )}
          {card.quantity > 1 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "#FFF8E1", color: "#B45309", fontWeight: 700 }}
            >
              x{card.quantity}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 shrink-0" style={{ fontWeight: 400 }}>
          {card.condition} · {card.series}
        </span>
      </div>

      {/* 가격 행 */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2 mb-2.5"
        style={{ background: gainBg }}
      >
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>취득가</p>
          <p className="text-[13px] text-gray-600" style={{ fontWeight: 600 }}>
            {fmt(card.acquiredPrice)}원
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>현재 추정가</p>
          <p className="text-[14px] text-gray-900" style={{ fontWeight: 800 }}>
            {fmt(card.currentPrice)}원
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>변동</p>
          <GainBadge card={card} />
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
  );
}

// ── 서브 컴포넌트: 판매 추천 행 ───────────────────────────────────────────────

function SellRecRow({ rec }: { rec: SellRecommendation }) {
  const router = useRouter();
  const { card, reason, suggestedPrice } = rec;
  const pct = gainPct(card);

  return (
    <div
      className="bg-white rounded-2xl px-4 py-3"
      style={{ boxShadow: SHADOW.card }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>
            {card.nameKo}
          </span>
          <RarityChip rarity={card.rarity} />
        </div>
        <GainBadge card={card} />
      </div>

      {/* 추천 이유 */}
      <div
        className="rounded-xl px-3 py-2 mb-2.5 flex items-start gap-2"
        style={{ background: SEMANTIC.successBg }}
      >
        <TrendingUp size={13} strokeWidth={2} color={SEMANTIC.success} className="shrink-0 mt-px" />
        <p className="text-[11px] leading-snug" style={{ color: "#166534", fontWeight: 500 }}>
          {reason}
        </p>
      </div>

      {/* 가격 요약 */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>취득가</p>
          <p className="text-[13px] text-gray-500" style={{ fontWeight: 600 }}>
            {fmt(card.acquiredPrice)}원
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>현재 추정가</p>
          <p className="text-[14px] text-gray-900" style={{ fontWeight: 800 }}>
            {fmt(card.currentPrice)}원
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>추천 판매가</p>
          <p
            className="text-[14px]"
            style={{ color: PRIMARY, fontWeight: 800 }}
          >
            {fmt(suggestedPrice)}원
          </p>
        </div>
      </div>

      <button
        onClick={() => router.push("/sell")}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm"
        style={{ background: PRIMARY, fontWeight: 700 }}
      >
        <Tag size={13} strokeWidth={2.5} />
        판매 등록하기
      </button>
    </div>
  );
}

// ── 서브 컴포넌트: 교환 추천 행 ───────────────────────────────────────────────

function TradeMatchRow({ match }: { match: TradeMatch }) {
  const router = useRouter();
  const { myCard, targetCardName, targetRarity, matchScore, priceDiff, matchedUserHandle } = match;

  const scoreColor =
    matchScore >= 90 ? "#16a34a" :
    matchScore >= 75 ? "#1D4ED8" : "#D97706";

  const diffSign  = priceDiff > 0 ? "+" : "";
  const diffColor = priceDiff > 0 ? "#16a34a" : priceDiff < 0 ? "#dc2626" : "#9ca3af";

  return (
    <div
      className="bg-white rounded-2xl px-4 py-3"
      style={{ boxShadow: SHADOW.card }}
    >
      {/* 내 카드 → 상대 카드 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>내 카드</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>
              {myCard.nameKo}
            </span>
            <RarityChip rarity={myCard.rarity} />
          </div>
        </div>

        <ArrowLeftRight size={16} strokeWidth={2} color="#9ca3af" className="shrink-0" />

        <div className="flex-1 min-w-0 text-right">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>상대 카드</p>
          <div className="flex items-center gap-1.5 justify-end">
            <RarityChip rarity={targetRarity} />
            <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>
              {targetCardName}
            </span>
          </div>
        </div>
      </div>

      {/* 교환 메트릭 */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2 mb-2.5"
        style={{ background: "#f9fafb" }}
      >
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>교환 적정도</p>
          <p className="text-[15px]" style={{ color: scoreColor, fontWeight: 800 }}>
            {matchScore}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>예상 가격차</p>
          <p className="text-[13px]" style={{ color: diffColor, fontWeight: 700 }}>
            {diffSign}{fmt(priceDiff)}원
          </p>
          <p className="text-[9px] text-gray-400" style={{ fontWeight: 400 }}>
            {priceDiff > 0 ? "상대방이 추가금 낼 수도" : priceDiff < 0 ? "내가 추가금 낼 수도" : "균형"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>매칭 상대</p>
          <p className="text-[11px] text-gray-700" style={{ fontWeight: 700 }}>
            {matchedUserHandle}
          </p>
        </div>
      </div>

      {/* 추천 메시지 */}
      <div
        className="rounded-xl px-3 py-2 mb-2.5 flex items-start gap-2"
        style={{ background: "#EFF6FF" }}
      >
        <ArrowLeftRight size={12} strokeWidth={2} color="#1D4ED8" className="shrink-0 mt-px" />
        <p className="text-[11px] leading-snug" style={{ color: "#1e40af", fontWeight: 500 }}>
          교환 조건이 잘 맞아요. 세부 조건은 상대방과 직접 협의해보세요.
        </p>
      </div>

      <button
        onClick={() => router.push("/exchange/propose")}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm"
        style={{ background: "#f4f4f5", color: "#111827", fontWeight: 700 }}
      >
        <ArrowLeftRight size={13} strokeWidth={2.5} />
        교환 찾기
      </button>
    </div>
  );
}

// ── 빈 상태 ────────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "#f4f4f5" }}
      >
        <Layers size={24} strokeWidth={1.5} color="#a1a1aa" />
      </div>
      <p className="text-sm text-gray-400 text-center" style={{ fontWeight: 400 }}>
        {message}
      </p>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("전체");

  const stats       = getCollectionStats(MOCK_COLLECTION);
  const sellRecs    = getSellRecommendations(MOCK_COLLECTION);
  const tradeMatches = getTradeMatches(MOCK_COLLECTION);
  const duplicates  = getDuplicates(MOCK_COLLECTION);

  const sellRecIds  = new Set(sellRecs.map((r) => r.card.id));
  const tradeIds    = new Set(tradeMatches.map((m) => m.myCard.id));

  const gainPositive = stats.unrealizedGain >= 0;
  const gainColor    = gainPositive ? SEMANTIC.success : SEMANTIC.error;
  const gainBg       = gainPositive ? SEMANTIC.successBg : SEMANTIC.errorBg;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAFA" }}>

      {/* ── 헤더 ── */}
      <div
        className="sticky top-0 z-10 bg-white px-4 pt-12 pb-3"
        style={{ borderBottom: "1px solid #f4f4f5" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-gray-100"
          >
            <ChevronLeft size={22} strokeWidth={2} color="#111827" />
          </button>
          <h1 className="text-lg text-gray-900" style={{ fontWeight: 800 }}>
            컬렉션 금고
          </h1>
        </div>
        <p className="text-xs text-gray-400 pl-9" style={{ fontWeight: 400 }}>
          내 카드의 가치와 거래 기회를 한눈에 확인
        </p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* ── Vault Summary 카드 ── */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: SHADOW.card }}
        >
          {/* 총 추정 자산가치 */}
          <div className="mb-3">
            <p className="text-[11px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>
              총 추정 자산가치
            </p>
            <p className="text-3xl text-gray-900" style={{ fontWeight: 800 }}>
              {fmt(stats.totalValue)}<span className="text-base ml-1" style={{ fontWeight: 400 }}>원</span>
            </p>
          </div>

          {/* 손익 행 */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
            style={{ background: gainBg }}
          >
            <div>
              <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>총 구매가</p>
              <p className="text-[13px] text-gray-600" style={{ fontWeight: 600 }}>
                {fmt(stats.totalCost)}원
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>미실현 손익</p>
              <p className="text-[15px]" style={{ color: gainColor, fontWeight: 800 }}>
                {gainPositive ? "+" : ""}{fmt(stats.unrealizedGain)}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>손익률</p>
              <div className="flex items-center justify-end gap-0.5">
                {gainPositive
                  ? <TrendingUp size={12} strokeWidth={2.5} color={SEMANTIC.success} />
                  : <TrendingDown size={12} strokeWidth={2.5} color={SEMANTIC.error} />
                }
                <p className="text-[15px]" style={{ color: gainColor, fontWeight: 800 }}>
                  {gainPositive ? "+" : ""}{stats.unrealizedGainPct}%
                </p>
              </div>
            </div>
          </div>

          {/* 통계 4칸 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { Icon: ShoppingBag, label: "보유",     value: `${stats.cardCount}장`,       color: "#374151" },
              { Icon: BarChart2,   label: "고유",      value: `${stats.uniqueCardCount}종`, color: "#374151" },
              { Icon: Tag,         label: "판매 추천", value: `${sellRecs.length}개`,       color: PRIMARY   },
              { Icon: ArrowLeftRight, label: "교환 추천", value: `${tradeMatches.length}개`, color: "#1D4ED8" },
            ].map(({ Icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center py-2 rounded-xl gap-1"
                style={{ background: "#f9fafb" }}
              >
                <Icon size={14} strokeWidth={2} color={color} />
                <p className="text-[13px]" style={{ color, fontWeight: 800 }}>{value}</p>
                <p className="text-[9px] text-gray-400" style={{ fontWeight: 400 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 탑 게이너 / 루저 ── */}
        {(stats.topGainer || stats.topLoser) && (
          <div className="grid grid-cols-2 gap-2">
            {stats.topGainer && (
              <div
                className="rounded-2xl px-3 py-2.5"
                style={{ background: SEMANTIC.successBg, boxShadow: SHADOW.subtle }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={11} strokeWidth={2.5} color={SEMANTIC.success} />
                  <p className="text-[10px]" style={{ color: SEMANTIC.success, fontWeight: 700 }}>수익 1위</p>
                </div>
                <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                  {stats.topGainer.nameKo}
                </p>
                <p className="text-[13px]" style={{ color: SEMANTIC.success, fontWeight: 800 }}>
                  +{gainPct(stats.topGainer)}%
                </p>
              </div>
            )}
            {stats.topLoser && (
              <div
                className="rounded-2xl px-3 py-2.5"
                style={{ background: SEMANTIC.errorBg, boxShadow: SHADOW.subtle }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown size={11} strokeWidth={2.5} color={SEMANTIC.error} />
                  <p className="text-[10px]" style={{ color: SEMANTIC.error, fontWeight: 700 }}>손실 1위</p>
                </div>
                <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                  {stats.topLoser.nameKo}
                </p>
                <p className="text-[13px]" style={{ color: SEMANTIC.error, fontWeight: 800 }}>
                  {gainPct(stats.topLoser)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 탭 바 ── */}
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background: "#f4f4f5" }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl text-xs transition-all"
                style={{
                  background:  active ? "#ffffff" : "transparent",
                  color:       active ? "#111827" : "#9ca3af",
                  fontWeight:  active ? 700 : 500,
                  boxShadow:   active ? SHADOW.subtle : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <div className="flex flex-col gap-3 pb-4">

          {/* 전체 탭 */}
          {activeTab === "전체" && (
            MOCK_COLLECTION.length === 0
              ? <EmptyState message="보유 카드가 없어요" />
              : MOCK_COLLECTION.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  hasSellRec={sellRecIds.has(card.id)}
                  hasTrade={tradeIds.has(card.id)}
                />
              ))
          )}

          {/* 판매 추천 탭 */}
          {activeTab === "판매 추천" && (
            sellRecs.length === 0
              ? <EmptyState message="아직 판매를 추천할 카드가 없어요" />
              : sellRecs.map((rec) => (
                <SellRecRow key={rec.card.id} rec={rec} />
              ))
          )}

          {/* 교환 추천 탭 */}
          {activeTab === "교환 추천" && (
            tradeMatches.length === 0
              ? <EmptyState message="아직 교환 추천 매칭이 없어요" />
              : tradeMatches.map((match) => (
                <TradeMatchRow key={match.myCard.id} match={match} />
              ))
          )}

          {/* 중복 보유 탭 */}
          {activeTab === "중복 보유" && (
            duplicates.length === 0
              ? <EmptyState message="중복 보유 카드가 없어요" />
              : duplicates.map((card) => (
                <div key={card.id}>
                  <div
                    className="flex items-center gap-1.5 mb-2 px-1"
                  >
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
  );
}
