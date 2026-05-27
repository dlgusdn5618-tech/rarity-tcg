"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#D62828";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "진행중":   { bg: "#eff6ff", color: "#3b82f6" },
  "거래완료": { bg: "#f0fdf4", color: "#10b981" },
  "취소됨":   { bg: "#f9fafb", color: "#9ca3af" },
};

const PURCHASES = [
  { id: 5, name: "에이스",          grade: "UR",  price: 130000, emoji: "🔥", condition: "S급", status: "거래완료", date: "2026.05.15", seller: "불꽃트레이너", reviewed: true  },
  { id: 3, name: "롤로노아 조로",   grade: "SR",  price: 67000,  emoji: "⚔️", condition: "A급", status: "거래완료", date: "2026.05.08", seller: "조로팬클럽",   reviewed: false },
  { id: 1, name: "몽키 D. 루피",    grade: "SAR", price: 95000,  emoji: "👒", condition: "S급", status: "진행중",   date: "2026.05.21", seller: "트레이너_루피", reviewed: false },
  { id: 4, name: "나미",            grade: "SR",  price: 45000,  emoji: "🍊", condition: "A급", status: "취소됨",   date: "2026.04.30", seller: "항해사나미",   reviewed: false },
];

type Tab = "전체" | "진행중" | "거래완료" | "취소됨";

export default function PurchasesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("전체");
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set([5]));

  const visible = PURCHASES.filter((p) => tab === "전체" || p.status === tab);

  const counts = {
    "전체": PURCHASES.length,
    "진행중": PURCHASES.filter((p) => p.status === "진행중").length,
    "거래완료": PURCHASES.filter((p) => p.status === "거래완료").length,
    "취소됨": PURCHASES.filter((p) => p.status === "취소됨").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>구매내역</h1>
      </header>

      {/* 탭 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {(["전체", "진행중", "거래완료", "취소됨"] as Tab[]).map((t) => (
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
        {visible.map((item) => {
          const st = STATUS_STYLE[item.status];
          const canReview = item.status === "거래완료" && !reviewedIds.has(item.id);

          return (
            <div key={item.id} className="px-4 py-4">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/card/${item.id}`)}
              >
                {/* 카드 이미지 */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl shrink-0 relative">
                  {item.emoji}
                  <span className="absolute top-1 left-1 text-[9px] bg-white/90 text-gray-600 px-1 py-0.5 rounded" style={{ fontWeight: 600 }}>
                    {item.grade}
                  </span>
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color, fontWeight: 600 }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                    {item.condition} · {item.date} · 판매자 {item.seller}
                  </p>
                  <p className="text-sm mt-1" style={{ color: PRIMARY, fontWeight: 700 }}>
                    {item.price.toLocaleString()}원
                  </p>
                </div>

                {/* 채팅 버튼 (진행중) */}
                {item.status === "진행중" && (
                  <button
                    className="text-xs px-3 py-2 rounded-xl border shrink-0"
                    style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                    onClick={(e) => { e.stopPropagation(); router.push("/chat"); }}
                  >
                    채팅
                  </button>
                )}
              </div>

              {/* 거래완료 — 리뷰 + 재구매 버튼 */}
              {item.status === "거래완료" && (
                <div className="flex gap-2 mt-3">
                  {canReview ? (
                    <button
                      className="flex-1 py-2 rounded-xl text-xs text-white"
                      style={{ background: PRIMARY, fontWeight: 600 }}
                      onClick={() => setReviewedIds((prev) => new Set([...prev, item.id]))}
                    >
                      ⭐ 리뷰 쓰기
                    </button>
                  ) : (
                    <button
                      className="flex-1 py-2 rounded-xl text-xs"
                      style={{ background: "#f9fafb", color: "#9ca3af", fontWeight: 500 }}
                      disabled
                    >
                      리뷰 작성 완료
                    </button>
                  )}
                  <button
                    className="flex-1 py-2 rounded-xl text-xs border"
                    style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                    onClick={() => router.push(`/card/${item.id}`)}
                  >
                    재구매
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🛍️</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>구매내역이 없어요</p>
          <button
            className="mt-4 text-sm text-white px-5 py-2.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
            onClick={() => router.push("/explore")}
          >
            카드 둘러보기
          </button>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
