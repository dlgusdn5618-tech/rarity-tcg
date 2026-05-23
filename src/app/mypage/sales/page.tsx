"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "판매중":   { bg: "#eff6ff", color: "#3b82f6" },
  "거래완료": { bg: "#f0fdf4", color: "#10b981" },
  "취소됨":   { bg: "#f9fafb", color: "#9ca3af" },
};

const SALES = [
  { id: 1, name: "리자몽 ex",     grade: "SR",  price: 85000,  emoji: "🔥", condition: "S급", status: "판매중",   date: "2026.05.20", buyer: null          },
  { id: 2, name: "뮤츠 ex",       grade: "UR",  price: 120000, emoji: "🌀", condition: "S급", status: "판매중",   date: "2026.05.18", buyer: null          },
  { id: 3, name: "꼬부기 ex",     grade: "SR",  price: 55000,  emoji: "💧", condition: "A급", status: "거래완료", date: "2026.05.10", buyer: "냉동빔"       },
  { id: 4, name: "이상해꽃",      grade: "SR",  price: 38000,  emoji: "🌿", condition: "B급", status: "거래완료", date: "2026.05.02", buyer: "초록트레이너" },
  { id: 5, name: "피카츄 ex",     grade: "SAR", price: 42000,  emoji: "⚡", condition: "A급", status: "취소됨",   date: "2026.04.25", buyer: "피카덕후"     },
];

type Tab = "전체" | "판매중" | "거래완료" | "취소됨";

export default function SalesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("전체");

  const visible = SALES.filter((s) => tab === "전체" || s.status === tab);

  const counts = {
    "전체": SALES.length,
    "판매중": SALES.filter((s) => s.status === "판매중").length,
    "거래완료": SALES.filter((s) => s.status === "거래완료").length,
    "취소됨": SALES.filter((s) => s.status === "취소됨").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>판매내역</h1>
        <button
          onClick={() => router.push("/sell")}
          className="text-xs text-white px-3 py-1.5 rounded-full"
          style={{ background: PRIMARY, fontWeight: 600 }}
        >
          + 등록
        </button>
      </header>

      {/* 탭 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {(["전체", "판매중", "거래완료", "취소됨"] as Tab[]).map((t) => (
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
      <div className="flex flex-col gap-0 mt-2 bg-white divide-y divide-gray-50">
        {visible.map((item) => {
          const st = STATUS_STYLE[item.status];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-4 active:bg-gray-50 cursor-pointer"
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
                  {item.condition} · {item.date}
                  {item.buyer && <span> · 구매자 {item.buyer}</span>}
                </p>
                <p className="text-sm mt-1" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {item.price.toLocaleString()}원
                </p>
              </div>

              {/* 액션 */}
              <div className="shrink-0">
                {item.status === "판매중" && (
                  <button
                    className="text-xs px-3 py-2 rounded-xl border"
                    style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 500 }}
                    onClick={(e) => { e.stopPropagation(); router.push("/chat"); }}
                  >
                    채팅
                  </button>
                )}
                {item.status === "거래완료" && (
                  <button
                    className="text-xs px-3 py-2 rounded-xl"
                    style={{ background: "#f9fafb", color: "#6b7280", fontWeight: 500 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    재판매
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🏷️</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>판매내역이 없어요</p>
          <button
            className="mt-4 text-sm text-white px-5 py-2.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
            onClick={() => router.push("/sell")}
          >
            첫 카드 등록하기
          </button>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
