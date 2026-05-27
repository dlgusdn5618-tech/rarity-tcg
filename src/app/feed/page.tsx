"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Search, Sparkles, MessageCircle, User,
  TrendingDown, PlusCircle, ArrowLeftRight, Store, Heart, Gem,
  ChevronRight, ShieldCheck, Camera,
  type LucideIcon,
} from "lucide-react";

const PRIMARY = "#E53E3E";

type SignalType = "price" | "newListing" | "trade" | "seller" | "wishlist" | "rare";

type Signal = {
  id: number;
  type: SignalType;
  title: string;
  description: string;
  cardName: string;
  rarity: string;
  previousPrice?: number;
  currentPrice?: number;
  changePercent?: number;
  fitPercent?: number;
  extraCash?: string;
  chips: string[];
  actionLabel: string;
  actionHref: string;
  timeAgo: string;
};

const SIGNALS: Signal[] = [
  {
    id: 1,
    type: "price",
    title: "피카츄 ex SAR이 목표가 이하로 내려갔어요",
    description: "찜한 카드의 새 매물이 설정가보다 낮게 등록됐어요.",
    cardName: "피카츄 ex",
    rarity: "SAR",
    previousPrice: 280000,
    currentPrice: 249000,
    changePercent: -11,
    chips: ["사진 인증", "안전거래"],
    actionLabel: "매물 보기",
    actionHref: "/card/1",
    timeAgo: "방금",
  },
  {
    id: 2,
    type: "newListing",
    title: "최근 본 리자몽 ex와 같은 카드가 등록됐어요",
    description: "Card Passport가 등록된 새 매물이에요.",
    cardName: "리자몽 ex",
    rarity: "SR",
    currentPrice: 85000,
    chips: ["Card Passport", "사진 인증"],
    actionLabel: "확인하기",
    actionHref: "/card/1",
    timeAgo: "3분 전",
  },
  {
    id: 3,
    type: "trade",
    title: "교환 적정도 87%인 매물이 있어요",
    description: "내 꼬부기 ex SR과 피카츄 ex SAR 교환 조건이 잘 맞아요.",
    cardName: "피카츄 ex",
    rarity: "SAR",
    fitPercent: 87,
    extraCash: "5,000원 내외",
    chips: ["교환 가능", "안전교환"],
    actionLabel: "교환 보기",
    actionHref: "/exchange/1",
    timeAgo: "12분 전",
  },
  {
    id: 4,
    type: "seller",
    title: "포켓마스터가 PSA 10 매물을 등록했어요",
    description: "팔로우한 셀러의 새 등록 카드입니다.",
    cardName: "뮤츠 ex",
    rarity: "UR",
    currentPrice: 210000,
    chips: ["PSA 10", "팔로우 셀러"],
    actionLabel: "셀러 보기",
    actionHref: "/mypage",
    timeAgo: "28분 전",
  },
  {
    id: 5,
    type: "wishlist",
    title: "찜한 카드의 안전거래 매물이 추가됐어요",
    description: "이제 안전거래로 구매 가능한 매물이 있어요.",
    cardName: "에이스",
    rarity: "UR",
    currentPrice: 130000,
    chips: ["안전거래", "원피스"],
    actionLabel: "매물 보기",
    actionHref: "/card/2",
    timeAgo: "1시간 전",
  },
  {
    id: 6,
    type: "rare",
    title: "관심 태그 'SAR' 카드가 새로 등록됐어요",
    description: "저장한 관심 태그와 일치하는 희귀 매물이에요.",
    cardName: "뮤 ex",
    rarity: "SAR",
    currentPrice: 320000,
    chips: ["SAR", "일본판", "사진 인증"],
    actionLabel: "매물 보기",
    actionHref: "/card/2",
    timeAgo: "2시간 전",
  },
];

const SIGNAL_META: Record<SignalType, { label: string; color: string; bg: string; Icon: LucideIcon }> = {
  price:      { label: "가격 알림",   color: "#dc2626", bg: "#fef2f2", Icon: TrendingDown   },
  newListing: { label: "새 매물",     color: "#2563eb", bg: "#eff6ff", Icon: PlusCircle     },
  trade:      { label: "교환 기회",   color: "#7c3aed", bg: "#f5f3ff", Icon: ArrowLeftRight },
  seller:     { label: "셀러",        color: "#0891b2", bg: "#ecfeff", Icon: Store          },
  wishlist:   { label: "찜 업데이트", color: PRIMARY,   bg: "#fff1f2", Icon: Heart          },
  rare:       { label: "희귀 조건",   color: "#d97706", bg: "#fffbeb", Icon: Gem            },
};

const GRADE_COLORS: Record<string, string> = {
  SAR: "#7c3aed",
  UR:  "#dc2626",
  SR:  "#d97706",
  R:   "#2563eb",
};

const CHIP_META: Record<string, { color: string; Icon?: LucideIcon }> = {
  "사진 인증":   { color: "#6b7280", Icon: Camera       },
  "안전거래":    { color: "#0891b2", Icon: ShieldCheck  },
  "안전교환":    { color: "#0891b2", Icon: ShieldCheck  },
  "Card Passport": { color: "#6b7280"                  },
  "교환 가능":   { color: "#7c3aed"                     },
  "PSA 10":      { color: "#d97706"                     },
  "팔로우 셀러": { color: "#0891b2"                     },
  "원피스":      { color: "#6b7280"                     },
  "SAR":         { color: "#7c3aed"                     },
  "일본판":      { color: "#6b7280"                     },
};

type TabFilter = "전체" | "가격" | "새 매물" | "교환" | "셀러";

const TYPE_TO_FILTER: Record<SignalType, TabFilter> = {
  price:      "가격",
  wishlist:   "가격",
  newListing: "새 매물",
  rare:       "새 매물",
  trade:      "교환",
  seller:     "셀러",
};

export default function FeedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("피드");
  const [tabFilter, setTabFilter] = useState<TabFilter>("전체");

  const filtered = SIGNALS.filter(
    (s) => tabFilter === "전체" || TYPE_TO_FILTER[s.type] === tabFilter,
  );

  const priceCnt    = SIGNALS.filter((s) => s.type === "price" || s.type === "wishlist").length;
  const newCnt      = SIGNALS.filter((s) => s.type === "newListing" || s.type === "rare").length;
  const tradeCnt    = SIGNALS.filter((s) => s.type === "trade").length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-20">

      {/* 헤더 */}
      <header className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <p className="text-[11px] text-gray-400 mb-0.5" style={{ fontWeight: 500, letterSpacing: "0.06em" }}>
          RARITY SIGNAL
        </p>
        <h1 className="text-xl text-gray-900" style={{ fontWeight: 800 }}>내 시그널</h1>
        <p className="text-[12px] text-gray-400 mt-1">관심 카드와 거래 기회를 모아봤어요</p>
      </header>

      {/* 요약 카드 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 px-4 py-3.5"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>오늘의 시그널</p>
          <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{SIGNALS.length}개</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "가격 하락", count: priceCnt,  color: "#dc2626", Icon: TrendingDown   },
            { label: "새 매물",   count: newCnt,    color: "#2563eb", Icon: PlusCircle     },
            { label: "교환 기회", count: tradeCnt,  color: "#7c3aed", Icon: ArrowLeftRight },
          ].map(({ label, count, color, Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-gray-50">
              <Icon size={16} strokeWidth={2} color={color} />
              <span className="text-base" style={{ fontWeight: 800, color }}>{count}</span>
              <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {(["전체", "가격", "새 매물", "교환", "셀러"] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTabFilter(t)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: tabFilter === t ? "#111111" : "#f3f4f6",
              color:      tabFilter === t ? "#ffffff" : "#6b7280",
              fontWeight: tabFilter === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 시그널 리스트 */}
      <div className="px-4 mt-3 flex flex-col gap-2.5">
        {filtered.length > 0 ? (
          filtered.map((signal) => (
            <SignalCard key={signal.id} signal={signal} onAction={(href) => router.push(href)} />
          ))
        ) : (
          <EmptyState onExplore={() => router.push("/explore")} onWishlist={() => router.push("/mypage/wishlist")} />
        )}
      </div>

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 z-30">
        <div className="grid grid-cols-5 h-14">
          {(
            [
              { Icon: Home,          label: "홈",   href: "/"       },
              { Icon: Search,        label: "탐색", href: "/explore"},
              { Icon: Sparkles,      label: "피드", href: "/feed"   },
              { Icon: MessageCircle, label: "채팅", href: "/chat"   },
              { Icon: User,          label: "마이", href: "/mypage" },
            ] as { Icon: LucideIcon; label: string; href: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => { setActiveTab(tab.label); router.push(tab.href); }}
                className="flex flex-col items-center justify-center gap-0.5 transition-colors"
                style={{ color: isActive ? "#111111" : "#9ca3af" }}
              >
                <tab.Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className="text-[10px]" style={{ fontWeight: isActive ? 700 : 400 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ---------- 시그널 카드 ---------- */
function SignalCard({ signal, onAction }: { signal: Signal; onAction: (href: string) => void }) {
  const meta       = SIGNAL_META[signal.type];
  const gradeColor = GRADE_COLORS[signal.rarity] ?? "#6b7280";
  const SIcon      = meta.Icon;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex gap-3 p-3.5">

        {/* 미니 TCG 프레임 */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden rounded-lg border border-gray-200 w-12 h-16">
          <div className="h-1 w-full" style={{ background: gradeColor }} />
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <span className="text-[8px]" style={{ color: gradeColor, fontWeight: 700, letterSpacing: "0.04em" }}>
              TCG
            </span>
          </div>
          <div
            className="px-0.5 py-0.5 text-center text-[7px] text-white"
            style={{ background: gradeColor, fontWeight: 700 }}
          >
            {signal.rarity}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">

          {/* 상단 행: 시그널 타입 + 시간 */}
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color, fontWeight: 600 }}
            >
              <SIcon size={9} strokeWidth={2.5} />
              {meta.label}
            </span>
            <span className="text-[10px] text-gray-300" style={{ fontWeight: 400 }}>{signal.timeAgo}</span>
          </div>

          {/* 제목 */}
          <p className="text-[13px] text-gray-900 leading-snug" style={{ fontWeight: 700 }}>
            {signal.title}
          </p>

          {/* 설명 */}
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
            {signal.description}
          </p>

          {/* 가격 정보 */}
          <PriceRow signal={signal} />

          {/* 칩 + 액션 */}
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <div className="flex flex-wrap gap-1 flex-1">
              {signal.chips.map((chip) => {
                const cm = CHIP_META[chip];
                const CIcon = cm?.Icon;
                return (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100"
                    style={{ color: cm?.color ?? "#6b7280", fontWeight: 500 }}
                  >
                    {CIcon && <CIcon size={8} strokeWidth={2.5} />}
                    {chip}
                  </span>
                );
              })}
            </div>
            <button
              className="flex-shrink-0 flex items-center gap-0.5 text-[11px] px-3 py-1.5 rounded-lg"
              style={{ background: "#f3f4f6", color: "#374151", fontWeight: 600 }}
              onClick={() => onAction(signal.actionHref)}
            >
              {signal.actionLabel}
              <ChevronRight size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 가격 행 ---------- */
function PriceRow({ signal }: { signal: Signal }) {
  if (signal.type === "price" && signal.previousPrice && signal.currentPrice && signal.changePercent) {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[11px] text-gray-300 line-through">
          {signal.previousPrice.toLocaleString()}원
        </span>
        <span className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>
          {signal.currentPrice.toLocaleString()}원
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}
        >
          {signal.changePercent}%
        </span>
      </div>
    );
  }

  if (signal.type === "trade" && signal.fitPercent) {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: "#f5f3ff", color: "#7c3aed", fontWeight: 600 }}
        >
          적정도 {signal.fitPercent}%
        </span>
        {signal.extraCash && (
          <span className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>
            추가금 {signal.extraCash}
          </span>
        )}
      </div>
    );
  }

  if (signal.currentPrice) {
    return (
      <p className="text-[13px] mt-1.5" style={{ color: PRIMARY, fontWeight: 700 }}>
        {signal.currentPrice.toLocaleString()}원
      </p>
    );
  }

  return null;
}

/* ---------- 빈 상태 ---------- */
function EmptyState({ onExplore, onWishlist }: { onExplore: () => void; onWishlist: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
        <Sparkles size={22} strokeWidth={1.5} color="#d1d5db" />
      </div>
      <p className="text-[15px] text-gray-700 leading-snug" style={{ fontWeight: 700 }}>
        아직 도착한 시그널이 없어요
      </p>
      <p className="text-[12px] text-gray-400 mt-1.5 leading-relaxed">
        찜한 카드나 가격 알림을 설정하면<br />여기에서 알려드릴게요.
      </p>
      <div className="flex gap-2 mt-5">
        <button
          className="px-4 py-2 rounded-xl text-[12px] bg-gray-100 text-gray-700"
          style={{ fontWeight: 600 }}
          onClick={onExplore}
        >
          카드 탐색하기
        </button>
        <button
          className="px-4 py-2 rounded-xl text-[12px] text-white"
          style={{ background: PRIMARY, fontWeight: 600 }}
          onClick={onWishlist}
        >
          가격 알림 설정하기
        </button>
      </div>
    </div>
  );
}
