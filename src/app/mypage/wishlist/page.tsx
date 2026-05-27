"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, SlidersHorizontal, Bell, BellRing, X } from "lucide-react";

const PRIMARY = "#D62828";

const WISHLIST = [
  { id: 1, name: "피카츄 ex",    grade: "SAR", price: 280000, condition: "S급", seller: "포켓마스터",    category: "포켓몬" },
  { id: 2, name: "뮤 ex",        grade: "SAR", price: 320000, condition: "S급", seller: "레어헌터",      category: "포켓몬" },
  { id: 3, name: "몽키 D. 루피", grade: "SAR", price: 95000,  condition: "S급", seller: "트레이너_루피", category: "원피스" },
  { id: 4, name: "리자몽 ex",    grade: "SR",  price: 85000,  condition: "A급", seller: "불꽃트레이너",  category: "포켓몬" },
  { id: 5, name: "에이스",       grade: "UR",  price: 130000, condition: "S급", seller: "불꽃트레이너",  category: "원피스" },
  { id: 6, name: "뮤츠 ex",      grade: "UR",  price: 210000, condition: "S급", seller: "사이코마스터",  category: "포켓몬" },
];

const ALERT_PRESETS = [
  "현재가보다 5% 낮아지면",
  "10만원 이하",
  "PSA 10 등록 시",
  "안전거래 매물 등록 시",
];

const GRADE_COLORS: Record<string, string> = {
  SAR: "#B7791F",   // 앰버 골드
  UR:  "#6D28D9",   // 딥 바이올렛
  SR:  "#B91C1C",   // 크림슨
  R:   "#1D4ED8",   // 블루
};

type Filter = "전체" | "포켓몬" | "원피스";
type Sort   = "찜한순" | "낮은가격순" | "높은가격순";

export default function WishlistPage() {
  const router = useRouter();
  const [filter, setFilter]       = useState<Filter>("전체");
  const [sort, setSort]           = useState<Sort>("찜한순");
  const [liked, setLiked]         = useState<Set<number>>(new Set(WISHLIST.map((c) => c.id)));
  const [showSort, setShowSort]   = useState(false);
  const [alertCards, setAlertCards]   = useState<Set<number>>(new Set());
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [alertPresets, setAlertPresets]   = useState<Record<number, Set<string>>>({});

  const visible = WISHLIST
    .filter((c) => liked.has(c.id))
    .filter((c) => filter === "전체" || c.category === filter)
    .sort((a, b) => {
      if (sort === "낮은가격순") return a.price - b.price;
      if (sort === "높은가격순") return b.price - a.price;
      return 0;
    });

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAlertPanel = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (alertCards.has(id)) {
      setAlertCards((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setAlertPresets((prev) => { const n = { ...prev }; delete n[id]; return n; });
      return;
    }
    setExpandedAlert(id);
  };

  const togglePreset = (id: number, preset: string) => {
    setAlertPresets((prev) => {
      const cur = new Set(prev[id] ?? []);
      if (cur.has(preset)) { cur.delete(preset); } else { cur.add(preset); }
      return { ...prev, [id]: cur };
    });
  };

  const confirmAlert = (id: number) => {
    const presets = alertPresets[id];
    if (presets && presets.size > 0) {
      setAlertCards((prev) => new Set([...prev, id]));
    }
    setExpandedAlert(null);
  };

  const sheetCard = expandedAlert !== null ? WISHLIST.find((c) => c.id === expandedAlert) : null;

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
          {visible.map((card) => {
            const isAlertOn  = alertCards.has(card.id);
            const gradeColor = GRADE_COLORS[card.grade] ?? "#6b7280";
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
                onClick={() => router.push(`/card/${card.id}`)}
              >
                {/* TCG 카드 프레임 이미지 영역 */}
                <div className="relative h-36 flex flex-col overflow-hidden">
                  <div className="h-1.5 w-full" style={{ background: gradeColor }} />
                  <div className="flex-1 bg-gray-100 flex items-center justify-center">
                    <div
                      className="w-10 h-14 rounded border-2 flex items-center justify-center text-[9px]"
                      style={{ borderColor: gradeColor, color: gradeColor, fontWeight: 700, letterSpacing: "0.05em" }}
                    >
                      TCG
                    </div>
                  </div>

                  {/* 등급 칩 */}
                  <span
                    className="absolute top-3 left-2 text-[10px] px-1.5 py-0.5 rounded text-white"
                    style={{ background: gradeColor, fontWeight: 600 }}
                  >
                    {card.grade}
                  </span>

                  {/* 알림 ON 칩 */}
                  {isAlertOn && (
                    <span
                      className="absolute bottom-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full text-white flex items-center gap-0.5"
                      style={{ background: "#f59e0b", fontWeight: 600 }}
                    >
                      <BellRing size={8} strokeWidth={2.5} />
                      알림 ON
                    </span>
                  )}

                  {/* 찜 + 알림 버튼 */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button
                      className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                      onClick={(e) => toggleLike(card.id, e)}
                    >
                      <Heart
                        size={13}
                        strokeWidth={2}
                        fill={liked.has(card.id) ? PRIMARY : "none"}
                        color={liked.has(card.id) ? PRIMARY : "#9ca3af"}
                      />
                    </button>
                    <button
                      className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                      onClick={(e) => toggleAlertPanel(card.id, e)}
                    >
                      {isAlertOn
                        ? <BellRing size={13} strokeWidth={2} color="#f59e0b" />
                        : <Bell    size={13} strokeWidth={2} color="#9ca3af" />
                      }
                    </button>
                  </div>
                </div>

                {/* 카드 정보 */}
                <div className="p-3">
                  <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{card.condition} · {card.seller}</p>
                  <p className="text-sm mt-1.5" style={{ color: PRIMARY, fontWeight: 700 }}>
                    {card.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart size={48} strokeWidth={1.2} color="#e5e7eb" />
          <p className="text-gray-400 text-sm mt-4">찜한 카드가 없어요</p>
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

      {/* 가격 알림 바텀 시트 */}
      {expandedAlert !== null && sheetCard && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setExpandedAlert(null)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white rounded-t-2xl z-50 px-5 pt-5 pb-8"
            style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
          >
            {/* 시트 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>가격 알림 설정</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{sheetCard.name} · {sheetCard.price.toLocaleString()}원</p>
              </div>
              <button
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                onClick={() => setExpandedAlert(null)}
              >
                <X size={14} strokeWidth={2} color="#6b7280" />
              </button>
            </div>

            {/* 조건 선택 안내 */}
            <p className="text-[11px] text-gray-400 mb-2.5">알림 조건을 선택하세요 (중복 가능)</p>

            {/* 프리셋 칩 */}
            <div className="flex flex-wrap gap-2 mb-5">
              {ALERT_PRESETS.map((preset) => {
                const active = alertPresets[expandedAlert]?.has(preset) ?? false;
                return (
                  <button
                    key={preset}
                    className="px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: active ? "#fef3c7" : "#f3f4f6",
                      color:      active ? "#d97706" : "#6b7280",
                      border:     active ? "1px solid #f59e0b" : "1px solid transparent",
                      fontWeight: active ? 600 : 400,
                    }}
                    onClick={() => togglePreset(expandedAlert, preset)}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* 확인 버튼 */}
            {(() => {
              const count = alertPresets[expandedAlert]?.size ?? 0;
              return (
                <button
                  className="w-full py-3 rounded-xl text-sm"
                  style={{
                    background: count > 0 ? PRIMARY : "#e5e7eb",
                    color:      count > 0 ? "#fff"   : "#9ca3af",
                    fontWeight: 600,
                  }}
                  disabled={count === 0}
                  onClick={() => confirmAlert(expandedAlert)}
                >
                  {count > 0 ? `알림 설정 완료 (${count}개 조건)` : "조건을 선택해 주세요"}
                </button>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
