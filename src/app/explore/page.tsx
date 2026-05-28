"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getExploreCards, type CardEntry } from "@/lib/cards";
import {
  Home, Search, Sparkles, MessageCircle, User,
  SlidersHorizontal, ShieldCheck, TrendingUp, TrendingDown,
  X, type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { CardVisual } from "@/components/CardVisual";

const RECENT_SEARCHES = ["리자몽 ex SAR", "피카츄 SAR", "루피 SAR", "뮤츠 UR"];

const POPULAR_SEARCHES = [
  { rank: 1, keyword: "리자몽 ex",     hot: true  },
  { rank: 2, keyword: "피카츄 ex SAR", hot: true  },
  { rank: 3, keyword: "루피 SAR",      hot: false },
  { rank: 4, keyword: "뮤츠 ex UR",    hot: false },
  { rank: 5, keyword: "에이스 UR",     hot: false },
  { rank: 6, keyword: "이상해꽃 SR",   hot: false },
];

const SERIES = ["전체", "151", "스칼렛·바이올렛", "페어리킹덤", "OP-01", "OP-02", "OP-07"];
const GRADES = ["전체", "SAR", "UR", "SR", "R"];
const GRADE_FILTERS = ["전체", "PSA 10", "PSA 9+", "BGS 9.5+", "감정 없음"] as const;
type GradeFilter = (typeof GRADE_FILTERS)[number];

const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  SAR: { bg: "#FFFBEB", color: "#92400E" },
  UR:  { bg: "#F3EEFF", color: "#6D28D9" },
  SR:  { bg: "#FFF0F0", color: "#B91C1C" },
  R:   { bg: "#F0F9FF", color: "#0369A1" },
};


type SortType = "인기순" | "낮은 가격순" | "높은 가격순" | "최신순";

/* ── Mini Spark SVG ────────────────────────────────────── */
function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const W = 44; const H = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) =>
    `${i * step},${H - 2 - ((v - min) / range) * (H - 6)}`
  ).join(" ");
  const isUp = data[data.length - 1] >= data[0];
  const c = isUp ? "#16a34a" : "#dc2626";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

/* ── Language Pill ─────────────────────────────────────── */
function LangPill({ lang, count }: { lang: string; count: number }) {
  const map: Record<string, string> = { 일본: "JP", 한글: "KR", 영어: "EN" };
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded"
      style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}
    >
      {map[lang] ?? lang} {count}
    </span>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery]                     = useState("");
  const [isFocused, setIsFocused]             = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedSeries, setSelectedSeries]   = useState("전체");
  const [selectedGrade, setSelectedGrade]         = useState("전체");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<GradeFilter>("전체");
  const [showFilter, setShowFilter]           = useState(false);
  const [showSortMenu, setShowSortMenu]       = useState(false);
  const [sortType, setSortType]               = useState<SortType>("인기순");
  const [recentSearches, setRecentSearches]   = useState(RECENT_SEARCHES);

  const isSearching = query.length > 0 || isFocused;

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    setIsFocused(false);
    if (!recentSearches.includes(keyword)) {
      setRecentSearches([keyword, ...recentSearches.slice(0, 3)]);
    }
  };

  const removeRecent = (keyword: string) =>
    setRecentSearches(recentSearches.filter((k) => k !== keyword));

  const filteredCards = getExploreCards()
    .filter((entry) => {
      const matchQuery    = query === "" || entry.name.includes(query) || entry.rarity.includes(query);
      const matchCategory = selectedCategory === "전체" || entry.category === selectedCategory;
      const matchSeries   = selectedSeries === "전체" || entry.series === selectedSeries;
      const matchGrade    = selectedGrade === "전체" || entry.rarity === selectedGrade;
      const matchGradeFilter =
        selectedGradeFilter === "전체"     ? true :
        selectedGradeFilter === "PSA 10"   ? entry.grades.includes("PSA 10") :
        selectedGradeFilter === "PSA 9+"   ? entry.grades.some((g) => g.startsWith("PSA") && parseFloat(g.split(" ")[1]) >= 9) :
        selectedGradeFilter === "BGS 9.5+" ? entry.grades.some((g) => g.startsWith("BGS") && parseFloat(g.split(" ")[1]) >= 9.5) :
        selectedGradeFilter === "감정 없음" ? entry.grades.length === 0 :
        true;
      return matchQuery && matchCategory && matchSeries && matchGrade && matchGradeFilter;
    })
    .sort((a, b) => {
      if (sortType === "인기순")     return b.wishCount - a.wishCount;
      if (sortType === "낮은 가격순") return a.minPrice - b.minPrice;
      if (sortType === "높은 가격순") return b.minPrice - a.minPrice;
      if (sortType === "최신순")     return a.createdAt - b.createdAt;
      return 0;
    });

  const hasActiveFilter = selectedSeries !== "전체" || selectedGrade !== "전체" || selectedGradeFilter !== "전체";

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-sm mx-auto overflow-x-hidden">

      {/* ── 검색바 헤더 ── */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            {isSearching && (
              <button
                onClick={() => { setQuery(""); setIsFocused(false); }}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              >
                <span className="text-gray-600 text-sm">←</span>
              </button>
            )}
            <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
              <Search size={14} color="#9ca3af" strokeWidth={1.5} className="shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="카드명, 시리즈, 레어도 검색"
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
                style={{ fontWeight: 400 }}
              />
              {query.length > 0 && (
                <button onClick={() => setQuery("")} className="shrink-0">
                  <X size={13} color="#9ca3af" strokeWidth={2} />
                </button>
              )}
            </div>
            {!isSearching && (
              <button
                onClick={() => { setShowFilter(!showFilter); setShowSortMenu(false); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{
                  background: (showFilter || hasActiveFilter) ? "#111" : "#f3f4f6",
                  color:      (showFilter || hasActiveFilter) ? "#fff" : "#6b7280",
                }}
              >
                <SlidersHorizontal size={16} strokeWidth={1.8} />
              </button>
            )}
          </div>

          {/* 카테고리 탭 */}
          {!isSearching && (
            <div className="flex gap-2 mt-3">
              {["전체", "포켓몬", "원피스"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="text-sm px-4 py-1.5 rounded-full transition-all"
                  style={{
                    background: selectedCategory === cat ? "#111" : "#f3f4f6",
                    color:      selectedCategory === cat ? "#fff" : "#6b7280",
                    fontWeight: selectedCategory === cat ? 700 : 400,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 검색 포커스 — 최근/인기 검색어 ── */}
      {isFocused && query.length === 0 && (
        <div className="px-4 pt-5 bg-white min-h-screen">
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>최근 검색어</span>
                <button onClick={() => setRecentSearches([])} className="text-xs text-gray-400">전체삭제</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((keyword) => (
                  <div
                    key={keyword}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5"
                    style={{ background: "#f3f4f6" }}
                  >
                    <button
                      onClick={() => handleSearch(keyword)}
                      className="text-xs text-gray-700"
                      style={{ fontWeight: 500 }}
                    >
                      {keyword}
                    </button>
                    <button onClick={() => removeRecent(keyword)}>
                      <X size={10} color="#9ca3af" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>인기 검색어</span>
            <div className="mt-2">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item.rank}
                  onClick={() => handleSearch(item.keyword)}
                  className="flex items-center gap-3 w-full py-2.5 border-b border-gray-50 text-left"
                >
                  <span
                    className="text-sm w-5 text-center shrink-0"
                    style={{ fontWeight: 800, color: item.rank <= 3 ? "#D62828" : "#9ca3af" }}
                  >
                    {item.rank}
                  </span>
                  <span className="text-sm text-gray-800 flex-1" style={{ fontWeight: 400 }}>{item.keyword}</span>
                  {item.hot && (
                    <span className="rr-badge" style={{ background: "#fff7ed", color: "#ea580c" }}>
                      HOT
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 필터 패널 ── */}
      {showFilter && !isSearching && (
        <div className="px-4 pt-3 pb-3 bg-white border-b border-gray-100">
          <div className="mb-3">
            <span className="text-[11px] text-gray-400 mb-2 block" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
              시리즈
            </span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {SERIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeries(s)}
                  className="shrink-0 text-xs px-3 py-1 rounded-full transition-all"
                  style={{
                    background:  selectedSeries === s ? "#111" : "#f3f4f6",
                    color:       selectedSeries === s ? "#fff" : "#6b7280",
                    fontWeight:  selectedSeries === s ? 700 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <span className="text-[11px] text-gray-400 mb-2 block" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
              레어도
            </span>
            <div className="flex gap-1.5">
              {GRADES.map((g) => {
                const chip   = RARITY_CHIP[g];
                const active = selectedGrade === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className="text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      background:  active ? (chip?.bg ?? "#111") : "#f3f4f6",
                      color:       active ? (chip?.color ?? "#fff") : "#6b7280",
                      border:      active ? `1.5px solid ${chip?.color ?? "#111"}` : "1.5px solid transparent",
                      fontWeight:  active ? 700 : 400,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 감정 등급 */}
          <div>
            <span className="text-[11px] text-gray-400 mb-2 block" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
              감정 등급
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {GRADE_FILTERS.map((gf) => {
                const active = selectedGradeFilter === gf;
                const isPsa10  = gf === "PSA 10";
                const isBgs    = gf === "BGS 9.5+";
                const isNone   = gf === "감정 없음";
                const activeBg    = isPsa10 ? "#1D4ED8" : isBgs ? "#7C3AED" : isNone ? "#f3f4f6" : "#111";
                const activeColor = isNone && active ? "#374151" : active ? "#fff" : "#6b7280";
                return (
                  <button
                    key={gf}
                    onClick={() => setSelectedGradeFilter(gf)}
                    className="text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      background: active ? activeBg : "#f3f4f6",
                      color:      activeColor,
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {gf}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 카드 리스트 ── */}
      {!isFocused && (
        <div className="px-4 pt-4 pb-24">
          {/* 카운트 + 정렬 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
              카드 <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredCards.length}종</span>
            </span>

            <div className="relative">
              <button
                onClick={() => { setShowSortMenu(!showSortMenu); setShowFilter(false); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  fontWeight: 600,
                }}
              >
                {sortType}
                <span
                  className="text-[9px] text-gray-400 transition-transform"
                  style={{ display: "inline-block", transform: showSortMenu ? "rotate(180deg)" : "none" }}
                >
                  ▾
                </span>
              </button>

              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden w-32">
                    {(["인기순", "최신순", "낮은 가격순", "높은 가격순"] as SortType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSortType(type); setShowSortMenu(false); }}
                        className="w-full text-left px-4 py-3 text-xs transition-colors"
                        style={{
                          background: sortType === type ? "#111" : "white",
                          color:      sortType === type ? "#fff" : "#374151",
                          fontWeight: sortType === type ? 700 : 400,
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 카드 엔트리 리스트 */}
          <div className="flex flex-col gap-2">
            {filteredCards.map((entry) => {
              const chip    = RARITY_CHIP[entry.rarity] ?? { bg: "#f8fafc", color: "#475569" };
              const diffPct = Math.round(((entry.minPrice - entry.avgPrice) / entry.avgPrice) * 100);
              const isBelow = diffPct < 0;
              const isUp    = entry.trend[entry.trend.length - 1] >= entry.trend[0];

              return (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/card/${entry.id}`)}
                  className="rr-card p-3 cursor-pointer active:bg-gray-50 transition-colors rr-pressable"
                >
                  <div className="flex items-start gap-3">
                    {/* 카드 프레임 */}
                    <CardVisual size="sm" rarity={entry.rarity} />

                    {/* 카드 정보 */}
                    <div className="flex-1 min-w-0">
                      {/* 카드명 + 레어도 칩 */}
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{entry.name}</p>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: chip.bg, color: chip.color, fontWeight: 700, border: `1px solid ${chip.color}33` }}
                        >
                          {entry.rarity}
                        </span>
                      </div>

                      {/* 시리즈 · 카테고리 */}
                      <p className="text-[10px] text-gray-400 mb-1.5" style={{ fontWeight: 400 }}>
                        {entry.series} · {entry.category}
                      </p>

                      {/* 가격 + 스파크 */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className="rr-price text-sm text-gray-900">
                            {entry.minPrice.toLocaleString()}원
                          </span>
                          <span
                            className="text-[10px] flex items-center gap-0.5"
                            style={{ color: isBelow ? "#16a34a" : "#9ca3af", fontWeight: 600 }}
                          >
                            {isBelow
                              ? <TrendingDown size={10} strokeWidth={2.5} />
                              : <TrendingUp   size={10} strokeWidth={2.5} />
                            }
                            평균 대비 {diffPct > 0 ? "+" : ""}{diffPct}%
                          </span>
                        </div>
                        <MiniSpark data={entry.trend} color={chip.color} />
                      </div>

                      {/* 태그 행 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
                          매물 <span className="rr-metric text-gray-700">{entry.listings}</span>개
                        </span>
                        {entry.grades.length > 0 && (
                          <span
                            className="rr-badge-rarity"
                            style={{
                              background: entry.grades[0].startsWith("BGS") ? "#F3EEFF" : "#eff6ff",
                              color:      entry.grades[0].startsWith("BGS") ? "#6D28D9" : "#1d4ed8",
                            }}
                          >
                            {entry.grades[0]}{entry.grades.length > 1 ? ` +${entry.grades.length - 1}` : ""}
                          </span>
                        )}
                        {entry.langDist.map((l) => (
                          <LangPill key={l.lang} lang={l.lang} count={l.count} />
                        ))}
                        {entry.safeTrade && (
                          <span
                            className="rr-badge flex items-center gap-0.5"
                            style={{ background: "#f0fdf4", color: "#16a34a" }}
                          >
                            <ShieldCheck size={9} strokeWidth={2.5} />안전
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <EmptyState
              icon={<Search size={22} strokeWidth={1.5} color="#a1a1aa" />}
              title="조건에 맞는 카드가 없어요"
              description="카테고리나 정렬 조건을 바꿔 다시 찾아보세요."
              actionLabel="전체 카드 보기"
              onAction={() => {
                setSelectedCategory("전체");
                setSelectedSeries("전체");
                setSelectedGrade("전체");
                setSelectedGradeFilter("전체");
                setQuery("");
              }}
            />
          )}
        </div>
      )}

      {/* ── 하단 탭 ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 rr-pb-safe">
        <div className="grid grid-cols-5 h-14">
          {(
            [
              { Icon: Home,          label: "홈",   href: "/"        },
              { Icon: Search,        label: "탐색", href: "/explore" },
              { Icon: Sparkles,      label: "피드", href: "/feed"    },
              { Icon: MessageCircle, label: "채팅", href: "/chat"    },
              { Icon: User,          label: "마이", href: "/mypage"  },
            ] as { Icon: LucideIcon; label: string; href: string }[]
          ).map((tab) => {
            const isActive = tab.label === "탐색";
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
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
