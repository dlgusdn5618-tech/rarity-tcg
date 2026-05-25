"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, SlidersHorizontal } from "lucide-react";

const PRIMARY = "#E53E3E";

const WISHLIST = [
  { id: 1,  name: "피카츄 ex",       grade: "SAR", price: 280000, emoji: "⚡", condition: "S급", seller: "포켓마스터",    liked: true,  category: "포켓몬" },
  { id: 2,  name: "뮤 ex",           grade: "SAR", price: 320000, emoji: "💜", condition: "S급", seller: "레어헌터",      liked: true,  category: "포켓몬" },
  { id: 3,  name: "몽키 D. 루피",    grade: "SAR", price: 95000,  emoji: "👒", condition: "S급", seller: "트레이너_루피", liked: true,  category: "원피스" },
  { id: 4,  name: "리자몽 ex",       grade: "SR",  price: 85000,  emoji: "🔥", condition: "A급", seller: "불꽃트레이너",  liked: true,  category: "포켓몬" },
  { id: 5,  name: "에이스",          grade: "UR",  price: 130000, emoji: "🔥", condition: "S급", seller: "불꽃트레이너",  liked: true,  category: "원피스" },
  { id: 6,  name: "뮤츠 ex",         grade: "UR",  price: 210000, emoji: "🌀", condition: "S급", seller: "사이코마스터",  liked: true,  category: "포켓몬" },
];

type Filter = "전체" | "포켓몬" | "원피스";
type Sort   = "찜한순" | "낮은가격순" | "높은가격순";

export default function WishlistPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("전체");
  const [sort, setSort]     = useState<Sort>("찜한순");
  const [liked, setLiked]   = useState<Set<number>>(new Set(WISHLIST.map((c) => c.id)));
  const [showSort, setShowSort] = useState(false);

  const visible = WISHLIST
    .filter((c) => liked.has(c.id))
    .filter((c) => filter === "전체" || c.category === filter)
    .sort((a, b) => {
      if (sort === "낮은가격순") return a.price - b.price;
      if (sort === "높은가격순") return b.price - a.price;
      return 0;
    });

  const toggle = (id: number, e: React.MouseEvent) => {
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
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>찜한 카드</h1>
        <span className="text-sm text-gray-400" style={{ fontWeight: 400 }}>{liked.size}개</span>
      </header>

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <div className="flex gap-2">
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

        {/* 정렬 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500"
            style={{ fontWeight: 500 }}
          >
            <SlidersHorizontal size={13} strokeWidth={1.8} />
            {sort}
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
              style={{ minWidth: 110 }}
            >
              {(["찜한순", "낮은가격순", "높은가격순"] as Sort[]).map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50"
                  style={{ fontWeight: sort === s ? 600 : 400 }}
                  onClick={() => { setSort(s); setShowSort(false); }}
                >
                  {sort === s && <span style={{ color: PRIMARY }}>✓ </span>}{s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 카드 그리드 */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {visible.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              onClick={() => router.push(`/card/${card.id}`)}
            >
              {/* 카드 이미지 영역 */}
              <div className="relative bg-gray-50 h-36 flex items-center justify-center">
                <span className="text-5xl">{card.emoji}</span>
                <span
                  className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-white/90"
                  style={{ color: "#374151", fontWeight: 600 }}
                >
                  {card.grade}
                </span>
                <button
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                  onClick={(e) => toggle(card.id, e)}
                >
                  <Heart
                    size={14}
                    strokeWidth={2}
                    fill={liked.has(card.id) ? PRIMARY : "none"}
                    color={liked.has(card.id) ? PRIMARY : "#9ca3af"}
                  />
                </button>
              </div>

              {/* 카드 정보 */}
              <div className="p-3">
                <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{card.condition} · {card.seller}</p>
                <p className="text-sm mt-1.5" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {card.price.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart size={48} strokeWidth={1.2} color="#e5e7eb" />
          <p className="text-gray-400 text-sm mt-4" style={{ fontWeight: 400 }}>찜한 카드가 없어요</p>
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
