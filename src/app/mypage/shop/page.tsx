"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft, ShieldCheck, Clock, Share2, Pencil,
  Camera, CheckCircle2, Star,
} from "lucide-react";
import { RARITY_CHIP, PRIMARY, SHADOW } from "@/lib/tokens";
import { getSellerById, getSellerListings, getSellerSoldItems } from "@/lib/sellers";

// ── Mock 데이터 ────────────────────────────────────────────────────────────────


function fmt(n: number) { return n.toLocaleString("ko-KR"); }

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

// ── 카드 썸네일 플레이스홀더 ───────────────────────────────────────────────────

function CardThumb({ rarity }: { rarity: string }) {
  const chip = RARITY_CHIP[rarity] ?? { bg: "#f4f4f5", color: "#71717a" };
  return (
    <div
      className="shrink-0 rounded-xl overflow-hidden flex flex-col"
      style={{ width: 52, height: 70, background: "#fafafa", border: `1.5px solid ${chip.bg}` }}
    >
      <div style={{ height: 7, background: chip.color, opacity: 0.45 }} />
      <div className="flex-1 flex items-center justify-center">
        <span style={{ fontSize: 9, color: chip.color, fontWeight: 800 }}>{rarity}</span>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("seller") ?? "rarity_user";
  const SELLER = getSellerById(sellerId);
  const isOwner = sellerId === "rarity_user";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FAFAFA" }}>
      <div className="w-full max-w-[430px] mx-auto">

        {/* ── 헤더 ── */}
        <div
          className="sticky top-0 z-10 bg-white px-4 pt-12 pb-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid #f4f4f5" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-lg active:bg-gray-100"
            >
              <ChevronLeft size={22} strokeWidth={2} color="#111827" />
            </button>
            <div>
              <h1 className="text-base text-gray-900 leading-tight" style={{ fontWeight: 800 }}>내 샵</h1>
              <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{isOwner ? "공개 프로필 미리보기" : "판매자 샵"}</p>
            </div>
          </div>
          <button
            onClick={() => console.log("share shop")}
            className="p-2 rounded-xl active:bg-gray-100"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <Share2 size={16} strokeWidth={1.8} color="#374151" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-10 flex flex-col gap-4">

          {/* ── 프로필 카드 ── */}
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: SHADOW.card }}>

            {/* 아바타 + 이름 + 평점 */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #E53E3E, #F6C90E)" }}
              >
                <span className="text-white text-2xl" style={{ fontWeight: 800 }}>R</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-gray-900 leading-tight" style={{ fontWeight: 700 }}>
                  {SELLER.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{SELLER.handle}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span style={{ color: "#F6C90E", fontSize: 13, lineHeight: 1 }}>★</span>
                  <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{SELLER.rating}</span>
                  <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>({SELLER.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}
                  >
                    인증완료
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "#eff6ff", color: "#1D4ED8", fontWeight: 600 }}
                  >
                    안전결제 사용중
                  </span>
                </div>
              </div>
            </div>

            {/* 거래 신뢰 지표 4칸 */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[
                { label: "거래완료",  value: `${SELLER.tradeCount}건` },
                { label: "응답시간",  value: SELLER.responseTime     },
                { label: "안전결제",  value: "사용중"                  },
                { label: "최근접속",  value: "오늘"                    },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl"
                  style={{ background: "#f9fafb" }}
                >
                  <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{s.value}</span>
                  <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {["PSA 10", "일본판 위주", "PROMO 수집", "SAR 관심", "감정 카드 경험"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ border: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 500 }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── 샵 신뢰 요약 ── */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { Icon: Camera,     label: "사진 인증률",   value: "100%",  color: "#16a34a", bg: "#f0fdf4" },
              { Icon: ShieldCheck, label: "안전거래 매물", value: "4장",   color: "#1D4ED8", bg: "#eff6ff" },
              { Icon: Clock,      label: "평균 응답",     value: "~30분", color: "#D97706", bg: "#fffbeb" },
              { Icon: Star,       label: "거래 만족도",   value: "98%",   color: "#B45309", bg: "#fffbeb" },
            ].map(({ Icon, label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: bg }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.70)" }}
                >
                  <Icon size={15} strokeWidth={2} color={color} />
                </div>
                <div>
                  <p className="text-[16px] text-gray-900 leading-tight" style={{ fontWeight: 800 }}>{value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 판매 중인 카드 ── */}
          <div>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>판매 중</p>
              <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{getSellerListings(sellerId).length}장</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {getSellerListings(sellerId).map((item) => (
                <button
                  key={item.id}
                  onClick={() => console.log("card detail", item.id)}
                  className="bg-white rounded-2xl px-4 py-3 flex items-start gap-3 text-left active:opacity-80 transition-opacity w-full"
                  style={{ boxShadow: SHADOW.card }}
                >
                  <CardThumb rarity={item.rarity} />
                  <div className="flex-1 min-w-0">
                    {/* 카드명 + 가격 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{item.nameKo}</span>
                        <RarityChip rarity={item.rarity} />
                        {item.gradingInfo && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }}
                          >
                            {item.gradingInfo}
                          </span>
                        )}
                      </div>
                      <span className="text-[15px] text-gray-900 shrink-0" style={{ fontWeight: 800 }}>
                        {fmt(item.price)}원
                      </span>
                    </div>
                    {/* 상태 · 시리즈 */}
                    <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                      {item.condition} · {item.series}
                    </p>
                    {/* 인증 배지 */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {item.hasPhotoCert && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#16a34a", fontWeight: 600 }}>
                          <Camera size={10} strokeWidth={2} />
                          사진 인증
                        </span>
                      )}
                      {item.hasSafeTrade && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#1D4ED8", fontWeight: 600 }}>
                          <ShieldCheck size={10} strokeWidth={2} />
                          안전거래
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 최근 판매 완료 ── */}
          <div>
            <p className="text-[13px] text-gray-900 mb-2 px-0.5" style={{ fontWeight: 700 }}>최근 판매 완료</p>
            <div className="flex flex-col gap-2">
              {getSellerSoldItems(sellerId).map((item) => (
                <div
                  key={item.nameKo}
                  className="bg-white rounded-2xl px-4 py-3"
                  style={{ boxShadow: SHADOW.card }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>{item.nameKo}</span>
                      <RarityChip rarity={item.rarity} />
                    </div>
                    <span className="text-[13px] text-gray-500 shrink-0" style={{ fontWeight: 600 }}>
                      {fmt(item.price)}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1" style={{ fontWeight: 400 }}>
                      <CheckCircle2 size={11} strokeWidth={2} color="#16a34a" />
                      거래 완료 · {item.ago}
                    </span>
                    <span className="text-[11px] text-gray-400 italic" style={{ fontWeight: 400 }}>
                      &ldquo;{item.review}&rdquo;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 하단 액션 버튼 ── */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => console.log("share shop")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm active:opacity-75 transition-opacity"
              style={{ border: "1.5px solid #e5e7eb", color: "#374151", fontWeight: 600 }}
            >
              <Share2 size={15} strokeWidth={2} />
              샵 공유하기
            </button>
            {isOwner && (
              <button
                onClick={() => console.log("edit profile")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-white active:opacity-75 transition-opacity"
                style={{ background: "#111827", fontWeight: 700 }}
              >
                <Pencil size={15} strokeWidth={2} />
                프로필 편집
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}
