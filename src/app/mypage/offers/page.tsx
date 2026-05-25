"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

const PRIMARY = "#E53E3E";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  "받은제안":   { bg: "#eff6ff", color: "#3b82f6",  label: "받은 제안"  },
  "보낸제안":   { bg: "#fefce8", color: "#d97706",  label: "보낸 제안"  },
  "수락됨":     { bg: "#f0fdf4", color: "#10b981",  label: "수락됨"     },
  "거절됨":     { bg: "#f9fafb", color: "#9ca3af",  label: "거절됨"     },
  "취소됨":     { bg: "#f9fafb", color: "#9ca3af",  label: "취소됨"     },
};

const OFFERS = [
  {
    id: 1,
    type: "받은제안" as const,
    card:    { name: "리자몽 ex",    grade: "SR",  emoji: "🔥", price: 85000  },
    offerer: "불꽃트레이너",
    offerPrice: 75000,
    status: "받은제안",
    date: "2026.05.22",
    message: "컨디션 고려해서 75,000원에 제안드립니다.",
  },
  {
    id: 2,
    type: "받은제안" as const,
    card:    { name: "뮤츠 ex",      grade: "UR",  emoji: "🌀", price: 120000 },
    offerer: "사이코마스터",
    offerPrice: 110000,
    status: "받은제안",
    date: "2026.05.21",
    message: "",
  },
  {
    id: 3,
    type: "보낸제안" as const,
    card:    { name: "피카츄 ex",    grade: "SAR", emoji: "⚡", price: 280000 },
    offerer: "포켓마스터",
    offerPrice: 250000,
    status: "보낸제안",
    date: "2026.05.20",
    message: "PSA 10 기준으로 제안드려요!",
  },
  {
    id: 4,
    type: "보낸제안" as const,
    card:    { name: "에이스",       grade: "UR",  emoji: "🔥", price: 130000 },
    offerer: "불꽃트레이너",
    offerPrice: 120000,
    status: "수락됨",
    date: "2026.05.15",
    message: "",
  },
  {
    id: 5,
    type: "받은제안" as const,
    card:    { name: "꼬부기 ex",    grade: "SR",  emoji: "💧", price: 55000  },
    offerer: "냉동빔",
    offerPrice: 45000,
    status: "거절됨",
    date: "2026.05.10",
    message: "급하게 필요해서요 ㅠ",
  },
];

type Tab = "전체" | "받은제안" | "보낸제안" | "완료";

export default function OffersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("전체");
  const [offers, setOffers] = useState(OFFERS);

  const visible = offers.filter((o) => {
    if (tab === "전체")   return true;
    if (tab === "받은제안") return o.status === "받은제안";
    if (tab === "보낸제안") return o.status === "보낸제안";
    if (tab === "완료")   return o.status === "수락됨" || o.status === "거절됨" || o.status === "취소됨";
    return false;
  });

  const counts = {
    "전체":   offers.length,
    "받은제안": offers.filter((o) => o.status === "받은제안").length,
    "보낸제안": offers.filter((o) => o.status === "보낸제안").length,
    "완료":   offers.filter((o) => ["수락됨", "거절됨", "취소됨"].includes(o.status)).length,
  };

  const accept = (id: number) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: "수락됨" } : o));
  };

  const reject = (id: number) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: "거절됨" } : o));
  };

  const cancel = (id: number) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: "취소됨" } : o));
  };

  const priceDiff = (original: number, offer: number) => {
    const diff = offer - original;
    const pct  = Math.round((diff / original) * 100);
    return { diff, pct };
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>가격제안</h1>
        {counts["받은제안"] > 0 && (
          <span
            className="text-[10px] text-white px-2 py-0.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 700 }}
          >
            {counts["받은제안"]}개 대기중
          </span>
        )}
      </header>

      {/* 탭 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {(["전체", "받은제안", "보낸제안", "완료"] as Tab[]).map((t) => (
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
        {visible.map((offer) => {
          const st   = STATUS_STYLE[offer.status];
          const { diff, pct } = priceDiff(offer.card.price, offer.offerPrice);
          const isPending = offer.status === "받은제안" || offer.status === "보낸제안";

          return (
            <div key={offer.id} className="px-4 py-4">

              {/* 상태 + 날짜 */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.color, fontWeight: 600 }}
                >
                  {st.label}
                </span>
                <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{offer.date}</span>
              </div>

              {/* 카드 + 가격 */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/card/${offer.id}`)}
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0 relative">
                  {offer.card.emoji}
                  <span
                    className="absolute top-0.5 left-0.5 text-[9px] bg-white/90 text-gray-600 px-1 py-0.5 rounded"
                    style={{ fontWeight: 600 }}
                  >
                    {offer.card.grade}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{offer.card.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                    판매가 {offer.card.price.toLocaleString()}원
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm" style={{ color: PRIMARY, fontWeight: 700 }}>
                      {offer.offerPrice.toLocaleString()}원
                    </p>
                    <span
                      className="text-[10px]"
                      style={{ color: diff < 0 ? PRIMARY : "#10b981", fontWeight: 600 }}
                    >
                      {diff > 0 ? "+" : ""}{pct}%
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} strokeWidth={1.5} color="#d1d5db" />
              </div>

              {/* 메시지 */}
              {offer.message && (
                <div
                  className="mt-3 px-3 py-2 rounded-xl text-xs text-gray-500"
                  style={{ background: "#f9fafb", fontWeight: 400 }}
                >
                  "{offer.message}"
                </div>
              )}

              {/* 상대방 */}
              <p className="text-xs text-gray-400 mt-2.5" style={{ fontWeight: 400 }}>
                {offer.type === "받은제안" ? "제안자" : "판매자"}{" "}
                <span className="text-gray-700" style={{ fontWeight: 500 }}>{offer.offerer}</span>
              </p>

              {/* 액션 버튼 */}
              {isPending && (
                <div className="flex gap-2 mt-3">
                  {offer.status === "받은제안" && (
                    <>
                      <button
                        className="flex-1 py-2 rounded-xl text-xs border"
                        style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                        onClick={() => reject(offer.id)}
                      >
                        거절
                      </button>
                      <button
                        className="flex-1 py-2 rounded-xl text-xs text-white"
                        style={{ background: PRIMARY, fontWeight: 600 }}
                        onClick={() => accept(offer.id)}
                      >
                        수락하기
                      </button>
                    </>
                  )}
                  {offer.status === "보낸제안" && (
                    <>
                      <button
                        className="flex-1 py-2 rounded-xl text-xs border"
                        style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                        onClick={() => cancel(offer.id)}
                      >
                        제안 취소
                      </button>
                      <button
                        className="flex-1 py-2 rounded-xl text-xs border"
                        style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 600 }}
                        onClick={() => router.push("/chat")}
                      >
                        채팅하기
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">💬</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>가격제안 내역이 없어요</p>
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
