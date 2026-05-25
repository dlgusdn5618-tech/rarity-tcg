"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Heart, Trash2 } from "lucide-react";

const PRIMARY = "#E53E3E";

const RECENT = [
  { id: 1,  name: "피카츄 ex",       grade: "SAR", price: 280000, emoji: "⚡", condition: "S급", seller: "포켓마스터",    viewedAt: "방금 전",    category: "포켓몬" },
  { id: 2,  name: "에이스",          grade: "UR",  price: 130000, emoji: "🔥", condition: "S급", seller: "불꽃트레이너",  viewedAt: "1시간 전",  category: "원피스" },
  { id: 3,  name: "리자몽 ex",       grade: "SR",  price: 85000,  emoji: "🔥", condition: "A급", seller: "불꽃트레이너",  viewedAt: "2시간 전",  category: "포켓몬" },
  { id: 4,  name: "몽키 D. 루피",    grade: "SAR", price: 95000,  emoji: "👒", condition: "S급", seller: "트레이너_루피", viewedAt: "어제",      category: "원피스" },
  { id: 5,  name: "뮤츠 ex",         grade: "UR",  price: 210000, emoji: "🌀", condition: "S급", seller: "사이코마스터",  viewedAt: "어제",      category: "포켓몬" },
  { id: 6,  name: "나미",            grade: "SR",  price: 45000,  emoji: "🍊", condition: "A급", seller: "항해사나미",    viewedAt: "2일 전",    category: "원피스" },
  { id: 7,  name: "꼬부기 ex",       grade: "SR",  price: 55000,  emoji: "💧", condition: "A급", seller: "냉동빔",        viewedAt: "3일 전",    category: "포켓몬" },
];

type Filter = "전체" | "포켓몬" | "원피스";

export default function RecentPage() {
  const router  = useRouter();
  const [filter, setFilter]   = useState<Filter>("전체");
  const [items, setItems]     = useState(RECENT);
  const [liked, setLiked]     = useState<Set<number>>(new Set([1, 3]));
  const [showClear, setShowClear] = useState(false);

  const visible = items.filter((c) => filter === "전체" || c.category === filter);

  const removeItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setShowClear(false);
  };

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>최근 본 카드</h1>
        {items.length > 0 && (
          <button
            onClick={() => setShowClear(true)}
            className="text-xs text-gray-400"
            style={{ fontWeight: 400 }}
          >
            전체 삭제
          </button>
        )}
      </header>

      {/* 필터 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {(["전체", "포켓몬", "원피스"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: filter === f ? PRIMARY : "#f3f4f6",
              color: filter === f ? "#fff" : "#6b7280",
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {visible.length > 0 ? (
        <div className="mt-2 bg-white divide-y divide-gray-50">
          {visible.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-gray-50"
              onClick={() => router.push(`/card/${card.id}`)}
            >
              {/* 카드 이미지 */}
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0 relative">
                {card.emoji}
                <span
                  className="absolute top-0.5 left-0.5 text-[9px] bg-white/90 text-gray-600 px-1 py-0.5 rounded"
                  style={{ fontWeight: 600 }}
                >
                  {card.grade}
                </span>
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                  {card.condition} · {card.seller}
                </p>
                <p className="text-sm mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {card.price.toLocaleString()}원
                </p>
              </div>

              {/* 우측 액션 */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-gray-300">
                  <Clock size={10} strokeWidth={1.8} />
                  <span style={{ fontWeight: 400 }}>{card.viewedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => toggleLike(card.id, e)}>
                    <Heart
                      size={16}
                      strokeWidth={1.8}
                      fill={liked.has(card.id) ? PRIMARY : "none"}
                      color={liked.has(card.id) ? PRIMARY : "#d1d5db"}
                    />
                  </button>
                  <button onClick={(e) => removeItem(card.id, e)}>
                    <Trash2 size={15} strokeWidth={1.8} color="#d1d5db" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Clock size={48} strokeWidth={1.2} color="#e5e7eb" />
          <p className="text-gray-400 text-sm mt-4" style={{ fontWeight: 400 }}>최근 본 카드가 없어요</p>
          <button
            className="mt-4 text-sm text-white px-5 py-2.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
            onClick={() => router.push("/explore")}
          >
            카드 둘러보기
          </button>
        </div>
      )}

      {/* 전체 삭제 확인 다이얼로그 */}
      {showClear && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowClear(false)}>
          <div
            className="w-full max-w-sm bg-white rounded-t-2xl px-5 pt-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base text-gray-900 text-center" style={{ fontWeight: 700 }}>전체 삭제</p>
            <p className="text-sm text-gray-400 text-center mt-1" style={{ fontWeight: 400 }}>
              최근 본 카드 내역을 모두 삭제할까요?
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="flex-1 py-3 rounded-xl text-sm text-gray-600 border"
                style={{ borderColor: "#e5e7eb", fontWeight: 500 }}
                onClick={() => setShowClear(false)}
              >
                취소
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-sm text-white"
                style={{ background: PRIMARY, fontWeight: 600 }}
                onClick={clearAll}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
