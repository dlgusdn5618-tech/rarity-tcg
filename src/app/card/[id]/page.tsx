"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Shield, Share2, Heart, Eye, Package, Store, Users, ShieldCheck, Camera, CheckCircle2, AlertCircle, MessageSquarePlus, TrendingDown, TrendingUp, Bell, BellRing, type LucideIcon } from "lucide-react";
import { CardVisual } from "@/components/CardVisual";
import { calcRarityIndex } from "@/lib/rarity-score";
import { RarityIndex } from "@/components/RarityIndex";
import { PurchaseBottomSheet } from "@/components/PurchaseBottomSheet";
import { SignalAlertSheet, getSignalForCard } from "@/components/SignalAlertSheet";
import { getCardById, getSimilarCards, type PassportData } from "@/lib/cards";
import { MOCK_COLLECTION } from "@/lib/collection";

const PRIMARY = "#D62828";

const RARITY_KO: Record<string, string> = {
  "Common": "C",
  "Uncommon": "U",
  "Rare": "R",
  "Double Rare": "RR",
  "Ultra Rare": "SR",
  "Illustration Rare": "IR",
  "Special Illustration Rare": "SAR",
  "Hyper Rare": "UR",
};

const PHOTO_SLOT_DEFS: { key: string; label: string; required: boolean; gradedOnly?: boolean }[] = [
  { key: "front",   label: "앞면 전체",        required: true              },
  { key: "back",    label: "뒷면 전체",        required: true              },
  { key: "corner",  label: "네 모서리",        required: true              },
  { key: "glare",   label: "표면 빛 반사",     required: true              },
  { key: "slab",    label: "감정 케이스 전체",  required: true, gradedOnly: true },
  { key: "slabnum", label: "감정번호 클로즈업", required: true, gradedOnly: true },
];


const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  TROPHY: { bg: "#111111", color: "#F6C90E" },   // 검정/골드
  SAR:    { bg: "#FFFBEB", color: "#92400E" },   // 앰버 골드
  UR:     { bg: "#F3EEFF", color: "#6D28D9" },   // 딥 바이올렛
  PROMO:  { bg: "#EFF6FF", color: "#1D4ED8" },   // 로얄 블루
  SR:     { bg: "#FFF0F0", color: "#B91C1C" },   // 크림슨
  IR:     { bg: "#F0FDFA", color: "#0D9488" },   // 틸
  RR:     { bg: "#F8FAFC", color: "#475569" },   // 슬레이트
};


const TYPE_EMOJI: Record<string, string> = {
  Fire: "🔥", Water: "💧", Grass: "🌿", Lightning: "⚡",
  Psychic: "🔮", Fighting: "👊", Darkness: "🌑", Metal: "⚙️",
  Dragon: "🐉", Colorless: "⭐",
};


const CONDITION_INFO: Record<string, { color: string; bg: string; desc: string }> = {
  "S급": { color: "#D69E2E", bg: "#FFFFF0", desc: "완전 민트" },
  "A급": { color: "#3182CE", bg: "#EBF8FF", desc: "상태 양호" },
  "B급": { color: "#718096", bg: "#F7FAFC", desc: "사용감 있음" },
};

const TRADE_OPTIONS: { key: "parcel" | "half" | "direct" | "safe"; label: string; Icon: LucideIcon; desc: string }[] = [
  { key: "parcel", label: "택배",    Icon: Package,    desc: "일반 택배사" },
  { key: "half",   label: "반값택배", Icon: Store,      desc: "편의점 접수" },
  { key: "direct", label: "직거래",  Icon: Users,      desc: "직접 만남" },
  { key: "safe",   label: "안전거래", Icon: ShieldCheck, desc: "레어리티 보호" },
];


type ApiSpec = {
  hp: string; types: string[]; evolvesFrom?: string;
  attacks: { name: string; damage: string; cost: string[] }[];
  weaknesses: { type: string; value: string }[];
  retreatCost: number; number: string; setName: string;
  setTotal: number; releaseDate: string; artist: string;
  regulationMark: string; rarity: string; image: string;
} | null;

// ─── 표시 변환 헬퍼 ───────────────────────────────────────────────────────────

function formatLanguage(v: string): string {
  const m: Record<string, string> = { Japanese: "일본판", Korean: "한국판", English: "영문판" };
  return m[v] ?? v;
}

function formatDistribution(v: string): string {
  const m: Record<string, string> = {
    "Booster Set": "확장팩 수록", "Promo": "프로모",
    "Tournament Prize": "대회 상품", "Championship Prize": "챔피언십 상품",
    "Trophy Card": "트로피 카드", "Product Bundle": "상품 동봉",
  };
  return m[v] ?? v;
}

function formatGrade(v: string): string {
  return v === "Ungraded" ? "미감정" : v;
}

function formatCondition(v: string): { value: string; sub?: string } {
  const m: Record<string, { value: string; sub: string }> = {
    "Near Mint":    { value: "NM", sub: "거의 새 상품" },
    "Excellent":    { value: "EX", sub: "상태 좋음"   },
    "Light Played": { value: "LP", sub: "사용감 적음"  },
    "Played":       { value: "PL", sub: "사용감 있음"  },
    "Poor":         { value: "PO", sub: "손상 있음"   },
    "Ungraded":     { value: "미감정", sub: ""        },
  };
  const r = m[v];
  if (!r) return { value: v };
  return { value: r.value, sub: r.sub || undefined };
}

function formatScarcity(v: string): { value: string; sub?: string; accent?: string } {
  const m: Record<string, { value: string; sub?: string; accent: string }> = {
    Grail:  { value: "Grail", sub: "최상급 희귀", accent: "#92400E" },
    High:   { value: "높음",                     accent: "#1D4ED8" },
    Rare:   { value: "희귀",                      accent: "#0D9488" },
    Common: { value: "일반",                      accent: "#9CA3AF" },
  };
  return m[v] ?? { value: v };
}

function formatPricePosition(v: string): { value: string; sub?: string } {
  const match = v.match(/^30D Top (\d+)%$/);
  if (match) return { value: `상위 ${match[1]}%`, sub: "최근 30일" };
  const m: Record<string, string> = {
    "Fair Price":   "시세 적정",
    "Below Market": "평균가 이하",
    "Above Market": "평균가 이상",
  };
  return { value: m[v] ?? v };
}

// ─────────────────────────────────────────────────────────────────────────────

function PhotoCertSection({
  photoSlots, isGraded,
}: {
  photoSlots: Record<string, boolean>;
  isGraded: boolean;
}) {
  const [requested, setRequested] = useState(false);
  const activeSlots = PHOTO_SLOT_DEFS.filter((s) => !s.gradedOnly || isGraded);
  const filledCount = activeSlots.filter((s) => photoSlots[s.key]).length;
  const totalCount = activeSlots.length;
  const pct = Math.round((filledCount / totalCount) * 100);

  const chipColor = pct === 100 ? "#10b981" : pct >= 75 ? "#d97706" : PRIMARY;
  const chipBg   = pct === 100 ? "#f0fdf4" : pct >= 75 ? "#fffbeb" : "#fff5f5";
  const missingSlots = activeSlots.filter((s) => !photoSlots[s.key]);

  return (
    <div className="bg-white rounded-2xl p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera size={14} strokeWidth={1.5} color="#374151" />
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>사진 인증</p>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: chipBg, color: chipColor, fontWeight: 700 }}
        >
          {pct}% 충족
        </span>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: chipColor }}
        />
      </div>

      {/* 슬롯 체크리스트 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
        {activeSlots.map((slot) => {
          const filled = !!photoSlots[slot.key];
          return (
            <div key={slot.key} className="flex items-center gap-1.5 min-w-0">
              {filled
                ? <CheckCircle2 size={13} color="#10b981" strokeWidth={2.5} className="shrink-0" />
                : <AlertCircle  size={13} color="#fca5a5" strokeWidth={2}   className="shrink-0" />
              }
              <span
                className="text-xs truncate"
                style={{ color: filled ? "#374151" : "#9ca3af", fontWeight: filled ? 600 : 400 }}
              >
                {slot.label}
              </span>
              {slot.required && !filled && (
                <span
                  className="text-[8px] px-1 rounded shrink-0"
                  style={{ background: "#fff5f5", color: PRIMARY, fontWeight: 700 }}
                >
                  필수
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 추가 사진 요청 버튼 */}
      {missingSlots.length > 0 && (
        <button
          onClick={() => setRequested(true)}
          disabled={requested}
          className="w-full py-2.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 mb-3 transition-all"
          style={{
            borderColor: requested ? "#d1d5db" : PRIMARY,
            color:       requested ? "#9ca3af" : PRIMARY,
            background:  requested ? "#f9fafb" : "white",
            fontWeight: 600,
          }}
        >
          {requested
            ? <><CheckCircle2 size={12} color="#9ca3af" strokeWidth={2.5} />요청 완료</>
            : <><MessageSquarePlus size={13} strokeWidth={1.5} />추가 사진 요청</>
          }
        </button>
      )}

      {/* 분쟁 안내 */}
      <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "#f9fafb" }}>
        <Shield size={11} color="#9ca3af" strokeWidth={1.5} className="shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-400" style={{ fontWeight: 400, lineHeight: 1.6 }}>
          등록된 사진은 <span style={{ fontWeight: 600 }}>거래 확정 후 상태 분쟁 시 기준 자료</span>로 활용됩니다.
          {missingSlots.length > 0 && <> 누락된 필수 사진이 있으면 분쟁 처리 시 불리할 수 있어요.</>}
        </p>
      </div>
    </div>
  );
}

function TrustStackSection({
  price, avgPrice30d,
  rarity, language, distribution, grade,
  safeTrade, sellerTrades, sellerResponseTime,
  photoSlots, isGraded,
}: {
  price: number; avgPrice30d: number;
  rarity: string; language: string; distribution: string; grade: string;
  safeTrade: boolean; sellerTrades: number; sellerResponseTime: string;
  photoSlots: Record<string, boolean>; isGraded: boolean;
}) {
  const priceDiffPct = Math.round(((price - avgPrice30d) / avgPrice30d) * 100);
  const priceBelow   = priceDiffPct < 0;
  const absDiff      = Math.abs(priceDiffPct);

  const activeSlots  = PHOTO_SLOT_DEFS.filter((s) => !s.gradedOnly || isGraded);
  const filledCount  = activeSlots.filter((s) => photoSlots[s.key]).length;
  const totalCount   = activeSlots.length;
  const photoPct     = Math.round((filledCount / totalCount) * 100);

  const identityItems = [
    { ok: true, text: "카드 정보 검증됨" },
    { ok: true, text: `${rarity} · ${formatLanguage(language)} · ${formatDistribution(distribution)}` },
    ...(grade !== "Ungraded" ? [{ ok: true, text: `감정 등급이 확인된 카드 (${grade})` }] : []),
  ];

  const sellerItems = [
    { ok: photoPct === 100, text: `사진 인증 (${filledCount}/${totalCount})` },
    { ok: safeTrade,        text: "안전거래 가능" },
    { ok: sellerTrades >= 50, text: `거래 완료 ${sellerTrades.toLocaleString()}회` },
    {
      ok: !sellerResponseTime.includes("2시간") && !sellerResponseTime.includes("3시간"),
      text: `${sellerResponseTime} 응답`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #f3f4f6" }}>

      {/* 헤더 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
        <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>구매 전 확인</p>
      </div>

      {/* 섹션 1: 카드 정체성 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
        <p className="text-[9px] text-gray-400 mb-2.5"
          style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          카드 정체성
        </p>
        <div className="flex flex-col gap-2">
          {identityItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={13} color="#10b981" strokeWidth={2.5} className="shrink-0" />
              <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 섹션 2: 가격 판단 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
        <p className="text-[9px] text-gray-400 mb-2.5"
          style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          가격
        </p>
        <div className="flex items-start gap-2">
          {priceBelow
            ? <TrendingDown size={15} color="#10b981" strokeWidth={2} className="shrink-0 mt-0.5" />
            : <TrendingUp   size={15} color="#ef4444" strokeWidth={2} className="shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-xs" style={{ color: priceBelow ? "#10b981" : "#ef4444", fontWeight: 700 }}>
              {priceBelow
                ? `최근 30일 평균보다 ${absDiff}% 낮음`
                : `최근 30일 평균보다 ${absDiff}% 높음`}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
              30일 평균 {avgPrice30d.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* 섹션 3: 판매자 신뢰 */}
      <div className="px-4 py-3">
        <p className="text-[9px] text-gray-400 mb-2.5"
          style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          판매자 신뢰
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {sellerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              {item.ok
                ? <CheckCircle2 size={13} color="#10b981" strokeWidth={2.5} className="shrink-0" />
                : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                  </span>
              }
              <span
                className="text-xs truncate"
                style={{ color: item.ok ? "#374151" : "#9ca3af", fontWeight: item.ok ? 500 : 400 }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardDecisionSummary({
  priceDiffPct, photoCertPct, safeTrade, priceHistoryLen,
}: {
  priceDiffPct: number; photoCertPct: number; safeTrade: boolean; priceHistoryLen: number;
}) {
  const absDiff = Math.abs(priceDiffPct);
  const trustOk = photoCertPct === 100 || safeTrade;

  return (
    <div className="rr-card px-4 py-3.5">
      <p className="text-[10px] text-gray-400 mb-2.5" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
        구매 판단 요약
      </p>
      <div className="flex flex-col gap-2.5">

        {/* 가격 */}
        <div className="flex items-start gap-2.5">
          {priceDiffPct < 0
            ? <TrendingDown size={13} strokeWidth={2} color="#16a34a" className="shrink-0 mt-0.5" />
            : <TrendingUp   size={13} strokeWidth={2} color={priceDiffPct > 5 ? "#ea580c" : "#9ca3af"} className="shrink-0 mt-0.5" />
          }
          <div className="min-w-0">
            <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>가격</span>
            <span className="text-xs" style={{ color: priceDiffPct < 0 ? "#16a34a" : priceDiffPct > 5 ? "#ea580c" : "#6b7280", fontWeight: 500 }}>
              {priceDiffPct < 0
                ? `최근 30일 평균보다 ${absDiff}% 낮은 편이에요`
                : priceDiffPct === 0
                ? "최근 30일 평균과 비슷한 수준이에요"
                : `최근 30일 평균보다 ${absDiff}% 높은 편이에요`}
            </span>
          </div>
        </div>

        {/* 신뢰 */}
        <div className="flex items-start gap-2.5">
          {trustOk
            ? <CheckCircle2 size={13} strokeWidth={2.5} color="#16a34a" className="shrink-0 mt-0.5" />
            : <AlertCircle  size={13} strokeWidth={2}   color="#d97706" className="shrink-0 mt-0.5" />
          }
          <div className="min-w-0">
            <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>신뢰</span>
            <span className="text-xs" style={{ color: trustOk ? "#374151" : "#92400E", fontWeight: 500 }}>
              {photoCertPct === 100 && safeTrade
                ? "사진 인증 완료 · 안전거래가 모두 가능해요"
                : photoCertPct === 100
                ? "사진 인증이 완료되어 있어요"
                : safeTrade
                ? "안전거래가 가능해요"
                : "사진 인증이 일부 누락되어 있어요"}
            </span>
          </div>
        </div>

        {/* 비교 */}
        <div className="flex items-start gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[7px]"
            style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 800 }}
          >비</span>
          <div className="min-w-0">
            <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>비교</span>
            <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
              최근 {priceHistoryLen}개월 시세 데이터로 가격 흐름을 확인할 수 있어요
            </span>
          </div>
        </div>

      </div>
      <p className="text-[10px] text-gray-400 mt-3" style={{ fontWeight: 400, lineHeight: 1.6 }}>
        위 정보는 거래 참고용이에요. 실제 판단은 직접 확인 후 결정해 주세요.
      </p>
    </div>
  );
}

function CardCollectionContext({
  nameKo, rarity, category, onOpenSignal,
}: {
  nameKo: string; rarity: string; category: string; onOpenSignal: () => void;
}) {
  const owned = MOCK_COLLECTION.find((c) => c.nameKo === nameKo) ?? null;

  const ownershipText = owned
    ? `보유 중 (${owned.quantity}장)${owned.isForSale ? " · 판매 의사 있음" : owned.isForTrade ? " · 교환 의사 있음" : ""}`
    : "아직 보유하지 않은 카드예요";

  const collectionImpact = owned
    ? "이미 컬렉션에 있는 카드예요"
    : (rarity === "SAR" || rarity === "UR")
    ? `${category} ${rarity} 라인업을 채울 수 있어요`
    : `${category} 컬렉션에 추가할 수 있어요`;

  const nextAction = owned
    ? "시그널로 가격 변동을 모니터링해두면 좋아요"
    : "목표가 시그널을 설정해두면 좋아요";

  return (
    <div className="rr-card px-4 py-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
          내 컬렉션 기준
        </p>
        {owned && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}
          >
            보유 중
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-3">
        {([
          { label: "보유 상태",   value: ownershipText    },
          { label: "컬렉션 영향", value: collectionImpact },
          { label: "다음 행동",   value: nextAction       },
        ] as { label: string; value: string }[]).map((item) => (
          <div key={item.label} className="flex items-start gap-2 min-w-0">
            <span
              className="text-[10px] shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
              style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {item.label}
            </span>
            <span className="text-xs text-gray-700" style={{ fontWeight: 500, lineHeight: 1.5 }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onOpenSignal}
        className="rr-button-ghost flex items-center gap-1"
        style={{ fontSize: "11px", color: "#6b7280" }}
      >
        <Bell size={11} strokeWidth={1.8} />
        시그널 설정하기
      </button>
    </div>
  );
}

function CardPassport({ name, nameKo, data }: { name: string; nameKo: string; data: PassportData }) {
  const chip        = RARITY_CHIP[data.rarity] ?? { bg: "#f9fafb", color: "#6b7280" };
  const displayName = data.language === "Korean" ? nameKo : name;
  const showKoSub   = data.language !== "Korean";

  const condFmt  = formatCondition(data.condition);
  const scarcFmt = formatScarcity(data.scarcity);
  const mktFmt   = formatPricePosition(data.pricePosition);

  const row1: { label: string; value: string }[] = [
    { label: "언어",     value: formatLanguage(data.language)     },
    { label: "배포 방식", value: formatDistribution(data.distribution) },
    { label: "감정 등급", value: formatGrade(data.grade)          },
  ];
  const row2: { label: string; value: string; sub?: string; accent?: string }[] = [
    { label: "상태",     value: condFmt.value,  sub: condFmt.sub,   accent: undefined         },
    { label: "시세 위치", value: mktFmt.value,   sub: mktFmt.sub,    accent: undefined         },
    { label: "희소성",   value: scarcFmt.value, sub: scarcFmt.sub,  accent: scarcFmt.accent   },
  ];

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>

      {/* 헤더 */}
      <div
        className="flex items-start justify-between px-4 py-3"
        style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
      >
        <div>
          <p className="text-[13px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>
            카드 패스포트
          </p>
          <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
            이 카드의 공식 스펙과 거래 기준 정보
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400" style={{ fontWeight: 500 }}>카드 ID</p>
          <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontWeight: 500, fontFamily: "monospace" }}>
            #{data.cardId}
          </p>
        </div>
      </div>

      {/* 카드명 + 레어도 */}
      <div
        className="flex items-start justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #f3f4f6" }}
      >
        <div className="min-w-0 mr-3">
          <p className="text-[9px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>카드명</p>
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{displayName}</p>
          {showKoSub && (
            <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{nameKo}</p>
          )}
        </div>
        <span
          className="text-[11px] px-2.5 py-1 rounded shrink-0"
          style={{ background: chip.bg, color: chip.color, fontWeight: 700, border: `1px solid ${chip.color}33` }}
        >
          {data.rarity}
        </span>
      </div>

      {/* Row 1: 언어 / 배포 방식 / 감정 등급 */}
      <div className="grid grid-cols-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
        {row1.map((f, i) => (
          <div
            key={f.label}
            className="px-3 py-3"
            style={{ borderRight: i < 2 ? "1px solid #f3f4f6" : "none" }}
          >
            <p className="text-[9px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>
              {f.label}
            </p>
            <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{f.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2: 상태 / 시세 위치 / 희소성 */}
      <div className="grid grid-cols-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
        {row2.map((f, i) => (
          <div
            key={f.label}
            className="px-3 py-3"
            style={{ borderRight: i < 2 ? "1px solid #f3f4f6" : "none" }}
          >
            <p className="text-[9px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>
              {f.label}
            </p>
            <p className="text-xs" style={{ fontWeight: 600, color: f.accent ?? "#111111" }}>
              {f.value}
            </p>
            {f.sub && (
              <p className="text-[9px] text-gray-400 mt-0.5 leading-tight" style={{ fontWeight: 400 }}>
                {f.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 태그 */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
        {data.photoVerified && (
          <span
            className="text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600, border: "1px solid #bbf7d0" }}
          >
            <CheckCircle2 size={9} strokeWidth={2.5} />
            사진 인증 완료
          </span>
        )}
        {data.safeTrade && (
          <span
            className="text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ background: "#fff5f5", color: "#dc2626", fontWeight: 600, border: "1px solid #fecaca" }}
          >
            <Shield size={9} strokeWidth={2.5} />
            안전거래 가능
          </span>
        )}
        {data.grade !== "Ungraded" && (
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: "#f9fafb", color: "#374151", fontWeight: 600, border: "1px solid #e5e7eb" }}
          >
            {data.grade}
          </span>
        )}
        <span
          className="text-[10px] px-2 py-0.5 rounded"
          style={{ background: chip.bg, color: chip.color, fontWeight: 600, border: `1px solid ${chip.color}33` }}
        >
          {data.rarity}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded"
          style={{ background: "#f9fafb", color: "#9ca3af", fontWeight: 400, border: "1px solid #e5e7eb", fontFamily: "monospace" }}
        >
          #{data.cardId}
        </span>
      </div>
    </div>
  );
}

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const card = getCardById(id);
  const condition = CONDITION_INFO[card.condition];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(card.likes);
  const [tradeType, setTradeType] = useState(card.tradeType);
  const [spec, setSpec] = useState<ApiSpec>(null);
  const [specLoading, setSpecLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
  const [signalSet, setSignalSet] = useState(false);

  useEffect(() => {
    setSignalSet(getSignalForCard(id) !== null);
  }, [id]);

  useEffect(() => {
    fetch(`https://api.pokemontcg.io/v2/cards/${card.apiId}`)
      .then((r) => r.json())
      .then((d) => {
        const c = d.data;
        setSpec({
          hp: c.hp,
          types: c.types ?? [],
          evolvesFrom: c.evolvesFrom,
          attacks: (c.attacks ?? []).map((a: { name: string; damage?: string; cost: string[] }) => ({
            name: a.name, damage: a.damage ?? "-", cost: a.cost,
          })),
          weaknesses: c.weaknesses ?? [],
          retreatCost: c.convertedRetreatCost ?? 0,
          number: c.number,
          setName: c.set.name,
          setTotal: c.set.total,
          releaseDate: c.set.releaseDate.replace(/\//g, "."),
          artist: c.artist ?? "-",
          regulationMark: c.regulationMark ?? "-",
          rarity: RARITY_KO[c.rarity] ?? c.rarity,
          image: c.images?.large ?? "",
        });
      })
      .catch(() => setSpec(null))
      .finally(() => setSpecLoading(false));
  }, [card.apiId]);

  const maxPrice = Math.max(...card.priceHistory);
  const minPrice = Math.min(...card.priceHistory);

  const isGradedCard   = card.passport.grade !== "Ungraded";
  const activeSlots    = PHOTO_SLOT_DEFS.filter((s) => !s.gradedOnly || isGradedCard);
  const photoCertPct   = Math.round(activeSlots.filter((s) => card.passport.photoSlots[s.key]).length / activeSlots.length * 100);
  const priceDiffPct   = Math.round(((card.price - card.avgPrice30d) / card.avgPrice30d) * 100);
  const trustTags: string[] = [
    ...(photoCertPct === 100 ? ["사진 인증됨"] : []),
    ...(card.passport.safeTrade ? ["안전거래 가능"] : []),
    `평균가 대비 ${priceDiffPct > 0 ? "+" : ""}${priceDiffPct}%`,
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-sm mx-auto pb-44 overflow-x-hidden">

      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100 w-full">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <span className="text-xl text-gray-700">←</span>
        </button>
        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>카드 상세</span>
        <button className="w-8 h-8 flex items-center justify-center" aria-label="공유">
          <Share2 size={18} color="#374151" strokeWidth={1.5} />
        </button>
      </header>

      {/* 카드 이미지 */}
      <div className="bg-white px-4 pt-5 pb-4">
        <div className="rounded-2xl h-60 flex items-center justify-center relative mb-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FFF5F5, #FED7D7)" }}>
          {spec?.image
            ? <img src={spec.image} alt={card.nameKo} className="h-52 object-contain drop-shadow-xl" />
            : (
              <CardVisual
                size="lg"
                name={card.nameKo}
                rarity={card.passport.rarity}
                graded={isGradedCard}
                grade={card.passport.grade}
              />
            )
          }
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-xs px-2 py-1 rounded-lg"
              style={{ background: condition.bg, color: condition.color, fontWeight: 700 }}>
              {spec ? spec.rarity : "..."}
            </span>
            <span className="text-xs bg-black/10 text-gray-700 px-2 py-1 rounded-lg" style={{ fontWeight: 500 }}>
              {card.category}
            </span>
          </div>
          <button onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
            <Heart
              size={18}
              strokeWidth={1.5}
              fill={liked ? PRIMARY : "none"}
              color={liked ? PRIMARY : "#374151"}
            />
          </button>
          <div className="absolute bottom-3 right-3 bg-black/20 rounded-full px-2 py-0.5">
            <div className="flex items-center gap-1 text-white text-[10px]">
              <Eye size={10} strokeWidth={2} color="white" />
              {card.views.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 이름 + 가격 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>
              {spec ? `${spec.setName} · ${spec.number}/${spec.setTotal}` : "불러오는 중..."}
            </p>
            <h1 className="text-xl text-gray-900 mb-1 break-words" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              {card.nameKo}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: condition.bg, color: condition.color, fontWeight: 600 }}>
              {card.condition} · {condition.desc}
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>
              {card.price.toLocaleString()}<span className="text-sm" style={{ fontWeight: 400 }}>원</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
              <Heart size={10} strokeWidth={1.5} color="#9ca3af" />
              {likeCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 시그널 받기 버튼 */}
        <button
          onClick={() => setShowSignal(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
          style={signalSet
            ? { background: "#fff1f1", color: PRIMARY, border: `1px solid ${PRIMARY}33`, fontWeight: 600 }
            : { background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb", fontWeight: 500 }
          }
        >
          {signalSet
            ? <><BellRing size={13} strokeWidth={2} color={PRIMARY} /> 시그널 설정됨</>
            : <><Bell size={13} strokeWidth={1.8} color="#9ca3af" /> 목표가·새 매물 시그널 받기</>
          }
        </button>
      </div>

      {/* ── 구매 판단 요약 ── */}
      <div className="mx-4 mt-3">
        <CardDecisionSummary
          priceDiffPct={priceDiffPct}
          photoCertPct={photoCertPct}
          safeTrade={card.passport.safeTrade}
          priceHistoryLen={card.priceHistory.length}
        />
      </div>

      {/* Card Passport */}
      <div className="mx-4 mt-3">
        <CardPassport name={card.name} nameKo={card.nameKo} data={card.passport} />
      </div>

      {/* 레어리티 인덱스 */}
      <div className="mx-4 mt-3">
        <RarityIndex
          data={calcRarityIndex({
            price: card.price,
            avgPrice30d: card.avgPrice30d,
            priceHistory: card.priceHistory,
            passport: {
              rarity: card.passport.rarity,
              scarcity: card.passport.scarcity,
              grade: card.passport.grade,
              photoVerified: card.passport.photoVerified,
            },
          })}
          cardName={card.nameKo}
        />
      </div>

      {/* ── 내 컬렉션 기준 ── */}
      <div className="mx-4 mt-3">
        <CardCollectionContext
          nameKo={card.nameKo}
          rarity={card.passport.rarity}
          category={card.category}
          onOpenSignal={() => setShowSignal(true)}
        />
      </div>

      {/* 사진 인증 */}
      <div className="mx-4 mt-3">
        <PhotoCertSection
          photoSlots={card.passport.photoSlots}
          isGraded={card.passport.grade !== "Ungraded"}
        />
      </div>

      {/* ① 거래 방식 선택 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>거래 방식</p>
        <div className="grid grid-cols-2 gap-2">
          {TRADE_OPTIONS.map((opt) => {
            const active = tradeType === opt.key;
            return (
              <button key={opt.key} onClick={() => setTradeType(opt.key)}
                className="flex flex-col items-center py-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: active ? PRIMARY : "#E5E7EB",
                  background: active ? "#FFF5F5" : "white",
                }}>
                <div className="mb-1">
                  <opt.Icon size={22} strokeWidth={1.5} color={active ? PRIMARY : "#6b7280"} />
                </div>
                <span className="text-xs" style={{ fontWeight: active ? 700 : 500, color: active ? PRIMARY : "#374151" }}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 text-center leading-tight" style={{ fontWeight: 400 }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ② 거래 방식 안내 배너 */}
      {tradeType === "parcel" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-blue-50">
          <Package size={22} strokeWidth={1.5} color="#2563eb" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>택배 거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              판매자가 하드케이스·뽁뽁이로 안전하게 포장 후 발송해요.
              발송 후 운송장 번호를 채팅으로 공유해드립니다.
            </p>
          </div>
        </div>
      )}
      {tradeType === "half" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-indigo-50">
          <Store size={22} strokeWidth={1.5} color="#4f46e5" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>반값택배 거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              CU·GS25 편의점에서 접수, 일반 택배보다 약 50% 저렴해요 (약 2,500~3,500원).
              CJ대한통운·로젠 반값택배 이용 가능합니다.
            </p>
          </div>
        </div>
      )}
      {tradeType === "direct" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-green-50">
          <Users size={22} strokeWidth={1.5} color="#16a34a" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>직거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              카페·편의점 등 공공장소에서 실물을 직접 확인 후 결제해요.
              채팅으로 장소와 시간을 조율해보세요.
            </p>
          </div>
        </div>
      )}
      {tradeType === "safe" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "linear-gradient(135deg, #FFF5F5, #FED7D7)" }}>
          <ShieldCheck size={22} strokeWidth={1.5} color={PRIMARY} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>레어리티 안전거래 적용 중</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              구매자가 카드를 받고 확인한 후 판매자에게 대금이 지급돼요.
              가품으로 확인 시 <span style={{ fontWeight: 700 }}>환불 절차</span>가 진행돼요.
            </p>
          </div>
        </div>
      )}

      {/* ③ 카드 공식 스펙 (Pokemon TCG API) */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>카드 공식 스펙</p>
          <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md" style={{ fontWeight: 600 }}>
            Pokemon TCG 공식 데이터
          </span>
        </div>

        {specLoading ? (
          <div className="flex justify-center py-4">
            <span className="text-gray-400 text-sm animate-pulse">스펙 불러오는 중...</span>
          </div>
        ) : spec ? (
          <div className="space-y-0">
            {/* 기본 스펙 테이블 */}
            {[
              { label: "세트",     value: spec.setName },
              { label: "카드 번호", value: `${spec.number} / ${spec.setTotal}` },
              { label: "레어도",   value: spec.rarity },
              { label: "발매일",   value: spec.releaseDate },
              { label: "HP",      value: spec.hp },
              { label: "타입",     value: spec.types.map(t => `${TYPE_EMOJI[t] ?? ""} ${t}`).join(", ") },
              { label: "진화 전",  value: spec.evolvesFrom ?? "-" },
              { label: "약점",     value: spec.weaknesses.map(w => `${TYPE_EMOJI[w.type] ?? ""} ${w.type} ${w.value}`).join(", ") || "-" },
              { label: "후퇴 비용", value: `${spec.retreatCost}개` },
              { label: "레귤레이션", value: spec.regulationMark },
              { label: "일러스트", value: spec.artist },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 w-24 shrink-0" style={{ fontWeight: 500 }}>{label}</span>
                <span className="text-xs text-gray-800 text-right" style={{ fontWeight: 400 }}>{value}</span>
              </div>
            ))}

            {/* 기술 */}
            {spec.attacks.length > 0 && (
              <div className="pt-3">
                <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>기술</p>
                {spec.attacks.map((atk, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {atk.cost.slice(0, 4).map((c, j) => (
                          <span key={j} className="text-xs">{TYPE_EMOJI[c] ?? "⭐"}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{atk.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: PRIMARY, fontWeight: 700 }}>{atk.damage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-3">스펙 정보를 불러올 수 없어요</p>
        )}
      </div>

      {/* 시세 차트 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>최근 시세 흐름</p>
        <div className="flex items-end gap-1.5 h-14 mb-2">
          {card.priceHistory.map((price, i) => {
            const pct = ((price - minPrice) / (maxPrice - minPrice || 1)) * 100;
            const isLast = i === card.priceHistory.length - 1;
            return (
              <div key={i} className="flex-1 rounded-t-md transition-all"
                style={{ height: `${Math.max(pct, 15)}%`, minHeight: 8, background: isLast ? PRIMARY : "#FED7D7" }} />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>1개월 전</span><span>현재</span>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>최저 {minPrice.toLocaleString()}원</span>
          <span className="text-xs" style={{ color: PRIMARY, fontWeight: 600 }}>현재 {card.price.toLocaleString()}원</span>
        </div>
      </div>

      {/* 판매자 설명 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 700 }}>판매자 설명</p>
        <p className="text-sm text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{card.desc}</p>
      </div>

      {/* 판매자 정보 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
            style={{ background: PRIMARY, fontWeight: 700 }}>
            {card.seller[0]}
          </div>
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{card.seller}</p>
            <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>
              {card.sellerGrade} · 거래 {card.sellerTrades}회
            </p>
          </div>
        </div>
        <button
          className="text-xs px-3 py-1.5 rounded-xl border"
          style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 600 }}
          onClick={() => router.push(`/mypage/shop?seller=${card.sellerId ?? "rarity_user"}`)}
        >
          판매자 보기
        </button>
      </div>

      {/* 구매 전 확인 */}
      <div className="mx-4 mt-3">
        <TrustStackSection
          price={card.price}
          avgPrice30d={card.avgPrice30d}
          rarity={card.passport.rarity}
          language={card.passport.language}
          distribution={card.passport.distribution}
          grade={card.passport.grade}
          safeTrade={card.passport.safeTrade}
          sellerTrades={card.sellerTrades}
          sellerResponseTime={card.sellerResponseTime}
          photoSlots={card.passport.photoSlots}
          isGraded={isGradedCard}
        />
      </div>

      {/* 비슷한 카드 */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>비슷한 카드</p>
          <button className="text-gray-400 text-sm">›</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2">
          {getSimilarCards(id).map((c) => {
            return (
            <button key={c.id} onClick={() => router.push(`/card/${c.id}`)} className="shrink-0 w-24 text-left">
              <div className="bg-white rounded-xl h-24 flex items-center justify-center mb-1.5 border border-gray-100">
                <CardVisual size="md" rarity={c.grade} />
              </div>
              <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{c.name}</p>
              <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{c.grade}</p>
              <p className="text-xs mt-0.5" style={{ fontWeight: 700 }}>{c.price.toLocaleString()}원</p>
            </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm min-w-0 bg-white border-t border-gray-100 px-4 pt-2.5" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        {/* 한 줄 신뢰 요약 */}
        <div className="flex items-center justify-center gap-1.5 mb-2.5 flex-wrap">
          {trustTags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-200 text-[10px] select-none">·</span>}
              <span className="text-[10px] text-gray-500" style={{ fontWeight: 500 }}>{tag}</span>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => router.push(`/exchange/propose?cardId=${id}&cardName=${encodeURIComponent(card.nameKo)}`)}
            className="flex-1 py-3 rounded-2xl border text-sm"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
          >
            ⇄ 교환 제안
          </button>
          <button
            className="flex-1 py-3 rounded-2xl border text-sm"
            style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 700 }}
            onClick={() => router.push(`/chat?fromCard=${id}`)}
          >
            채팅하기
          </button>
        </div>
        <button
          className="w-full py-3.5 rounded-2xl text-white text-sm"
          style={{ background: PRIMARY, fontWeight: 700 }}
          onClick={() => setShowPurchase(true)}
        >
          바로 구매
        </button>
      </div>

      <PurchaseBottomSheet
        isOpen={showPurchase}
        onClose={() => setShowPurchase(false)}
        cardName={card.nameKo}
        rarity={card.passport.rarity}
        condition={card.condition}
        price={card.price}
        seller={card.seller}
        photoVerified={card.passport.photoVerified}
        safeTrade={card.passport.safeTrade}
        onChat={() => { setShowPurchase(false); router.push(`/chat?fromCard=${id}`); }}
      />

      <SignalAlertSheet
        isOpen={showSignal}
        onClose={() => setShowSignal(false)}
        cardId={id}
        cardName={card.nameKo}
        currentPrice={card.price}
        avgPrice30d={card.avgPrice30d}
        onSaved={() => setSignalSet(true)}
        onNavigateFeed={() => { setShowSignal(false); router.push("/feed"); }}
      />
    </div>
  );
}
