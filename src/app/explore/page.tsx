"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Search, Sparkles, MessageCircle, User, SlidersHorizontal, ShieldCheck, type LucideIcon } from "lucide-react";

const RECENT_SEARCHES = ["리자몽 ex SAR", "피카츄 SAR", "루피 SAR", "뮤츠 UR"];

const POPULAR_SEARCHES = [
  { rank: 1, keyword: "리자몽 ex" },
  { rank: 2, keyword: "피카츄 ex SAR" },
  { rank: 3, keyword: "루피 SAR" },
  { rank: 4, keyword: "뮤츠 ex UR" },
  { rank: 5, keyword: "에이스 UR" },
  { rank: 6, keyword: "이상해꽃 SR" },
];

const SERIES = ["전체", "151", "스칼렛·바이올렛", "페어리킹덤", "OP-01", "OP-02", "OP-07"];

const GRADES = ["전체", "SAR", "UR", "SR", "R"];

const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  SAR: { bg: "#FFFBEB", color: "#92400E" },   // 앰버 골드
  UR:  { bg: "#F3EEFF", color: "#6D28D9" },   // 딥 바이올렛
  SR:  { bg: "#FFF0F0", color: "#B91C1C" },   // 크림슨
  R:   { bg: "#F0F9FF", color: "#0369A1" },   // 스카이 블루
};

type CardEntry = {
  id: number; name: string; series: string; rarity: string;
  category: "포켓몬" | "원피스"; listings: number;
  minPrice: number; avgPrice: number; gradedCount: number;
  langDist: { lang: string; count: number }[]; safeTrade: boolean;
};

const CARD_ENTRIES: CardEntry[] = [
  { id: 1,  name: "리자몽 ex",    series: "151",            rarity: "SAR", category: "포켓몬", listings: 12, minPrice: 85000,  avgPrice: 90500,  gradedCount: 2, langDist: [{ lang: "일본판", count: 8 },  { lang: "한글판", count: 4 }], safeTrade: true  },
  { id: 2,  name: "피카츄 ex",    series: "151",            rarity: "SAR", category: "포켓몬", listings: 7,  minPrice: 42000,  avgPrice: 45000,  gradedCount: 0, langDist: [{ lang: "영어판", count: 5 },  { lang: "일본판", count: 2 }], safeTrade: false },
  { id: 3,  name: "뮤츠 ex",      series: "151",            rarity: "UR",  category: "포켓몬", listings: 5,  minPrice: 120000, avgPrice: 115000, gradedCount: 1, langDist: [{ lang: "일본판", count: 5 }],                            safeTrade: true  },
  { id: 4,  name: "이상해꽃 ex",  series: "151",            rarity: "SR",  category: "포켓몬", listings: 9,  minPrice: 38000,  avgPrice: 41000,  gradedCount: 0, langDist: [{ lang: "한글판", count: 6 },  { lang: "일본판", count: 3 }], safeTrade: false },
  { id: 5,  name: "꼬부기 ex",    series: "151",            rarity: "SR",  category: "포켓몬", listings: 6,  minPrice: 55000,  avgPrice: 58000,  gradedCount: 0, langDist: [{ lang: "일본판", count: 4 },  { lang: "한글판", count: 2 }], safeTrade: true  },
  { id: 6,  name: "잠만보 ex",    series: "스칼렛·바이올렛", rarity: "SAR", category: "포켓몬", listings: 4,  minPrice: 67000,  avgPrice: 70000,  gradedCount: 1, langDist: [{ lang: "일본판", count: 4 }],                            safeTrade: true  },
  { id: 12, name: "뮤 ex",        series: "페어리킹덤",      rarity: "SAR", category: "포켓몬", listings: 8,  minPrice: 88000,  avgPrice: 92000,  gradedCount: 2, langDist: [{ lang: "일본판", count: 6 },  { lang: "한글판", count: 2 }], safeTrade: true  },
  { id: 7,  name: "몽키 D. 루피", series: "OP-01",          rarity: "SAR", category: "원피스", listings: 15, minPrice: 95000,  avgPrice: 102000, gradedCount: 3, langDist: [{ lang: "일본판", count: 10 }, { lang: "한글판", count: 5 }], safeTrade: true  },
  { id: 8,  name: "롤로노아 조로", series: "OP-01",         rarity: "SR",  category: "원피스", listings: 8,  minPrice: 67000,  avgPrice: 71000,  gradedCount: 1, langDist: [{ lang: "일본판", count: 6 },  { lang: "한글판", count: 2 }], safeTrade: false },
  { id: 9,  name: "나미",          series: "OP-02",         rarity: "SR",  category: "원피스", listings: 5,  minPrice: 45000,  avgPrice: 47000,  gradedCount: 0, langDist: [{ lang: "일본판", count: 3 },  { lang: "한글판", count: 2 }], safeTrade: false },
  { id: 10, name: "에이스",        series: "OP-02",         rarity: "UR",  category: "원피스", listings: 6,  minPrice: 130000, avgPrice: 128000, gradedCount: 2, langDist: [{ lang: "일본판", count: 5 },  { lang: "한글판", count: 1 }], safeTrade: true  },
  { id: 11, name: "상디",          series: "OP-07",         rarity: "R",   category: "원피스", listings: 3,  minPrice: 22000,  avgPrice: 24000,  gradedCount: 0, langDist: [{ lang: "한글판", count: 3 }],                            safeTrade: false },
];

type SortType = "매물 많은 순" | "최저가 순" | "최신등록";

export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedSeries, setSelectedSeries] = useState("전체");
  const [selectedGrade, setSelectedGrade] = useState("전체");
  const [showFilter, setShowFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortType, setSortType] = useState<SortType>("매물 많은 순");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const isSearching = query.length > 0 || isFocused;

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    setIsFocused(false);
    if (!recentSearches.includes(keyword)) {
      setRecentSearches([keyword, ...recentSearches.slice(0, 3)]);
    }
  };

  const removeRecent = (keyword: string) => {
    setRecentSearches(recentSearches.filter((k) => k !== keyword));
  };

  const filteredCards = CARD_ENTRIES
    .filter((entry) => {
      const matchQuery    = query === "" || entry.name.includes(query) || entry.rarity.includes(query);
      const matchCategory = selectedCategory === "전체" || entry.category === selectedCategory;
      const matchSeries   = selectedSeries === "전체" || entry.series === selectedSeries;
      const matchGrade    = selectedGrade === "전체"  || entry.rarity === selectedGrade;
      return matchQuery && matchCategory && matchSeries && matchGrade;
    })
    .sort((a, b) => {
      if (sortType === "매물 많은 순") return b.listings - a.listings;
      if (sortType === "최저가 순")   return a.minPrice - b.minPrice;
      if (sortType === "최신등록")    return b.id - a.id;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto">

      {/* 검색바 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {isSearching && (
            <button onClick={() => { setQuery(""); setIsFocused(false); }} className="shrink-0">
              <span className="text-xl text-gray-600">←</span>
            </button>
          )}
          <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
            <Search size={14} color="#9ca3af" strokeWidth={1.5} className="shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="카드 이름, 시리즈 검색"
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
              style={{ fontWeight: 400 }}
            />
            {query.length > 0 && (
              <button onClick={() => setQuery("")}>
                <span className="text-gray-400 text-xs bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center">✕</span>
              </button>
            )}
          </div>
          {!isSearching && (
            <button onClick={() => setShowFilter(!showFilter)} className="p-1">
              <SlidersHorizontal size={20} color={showFilter ? "#111" : "#6b7280"} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        {!isSearching && (
          <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-none pb-1">
            {["전체", "포켓몬", "원피스"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-sm px-4 py-1.5 rounded-full transition-all ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
                style={{ fontWeight: selectedCategory === cat ? 600 : 400 }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 검색 전 - 추천/인기 검색어 */}
      {isFocused && query.length === 0 && (
        <div className="px-4 pt-4">
          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>최근 검색어</span>
                <button onClick={() => setRecentSearches([])} className="text-xs text-gray-400" style={{ fontWeight: 400 }}>전체삭제</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((keyword) => (
                  <div key={keyword} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5">
                    <button onClick={() => handleSearch(keyword)} className="text-xs text-gray-700" style={{ fontWeight: 400 }}>
                      {keyword}
                    </button>
                    <button onClick={() => removeRecent(keyword)} className="text-gray-400 text-[10px]">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 검색어 */}
          <div>
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>인기 검색어</span>
            <div className="mt-2 flex flex-col gap-0">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item.rank}
                  onClick={() => handleSearch(item.keyword)}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 text-left"
                >
                  <span
                    className="text-sm w-5 text-center"
                    style={{ fontWeight: 700, color: item.rank <= 3 ? "#ef4444" : "#9ca3af" }}
                  >
                    {item.rank}
                  </span>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 400 }}>{item.keyword}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 필터 패널 */}
      {showFilter && !isSearching && (
        <div className="px-4 pt-3 pb-1 bg-gray-50 border-b border-gray-100">
          <div className="mb-3">
            <span className="text-xs text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>시리즈</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {SERIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeries(s)}
                  className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedSeries === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                  style={{ fontWeight: selectedSeries === s ? 600 : 400 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <span className="text-xs text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>레어도</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {GRADES.map((g) => {
                const chip = RARITY_CHIP[g];
                const active = selectedGrade === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className="shrink-0 text-xs px-3 py-1 rounded-full border transition-all"
                    style={{
                      background: active ? (chip?.bg ?? "#111") : "white",
                      color:      active ? (chip?.color ?? "white") : "#6b7280",
                      borderColor: active ? (chip?.color ?? "#111") : "#e5e7eb",
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 카드 그리드 */}
      {!isFocused && (
        <div className="px-4 pt-4 pb-24">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
              카드 <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredCards.length}종</span>
            </span>

            {/* 정렬 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl bg-white"
                style={{ fontWeight: 500 }}
              >
                {sortType}
                <span className="text-[10px] text-gray-400" style={{ transform: showSortMenu ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
              </button>

              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden w-32">
                    {(["매물 많은 순", "최저가 순", "최신등록"] as SortType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSortType(type); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortType === type ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        style={{ fontWeight: sortType === type ? 700 : 400 }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 카드 도감 엔트리 리스트 */}
          <div className="flex flex-col gap-2.5">
            {filteredCards.map((entry) => {
              const chip = RARITY_CHIP[entry.rarity] ?? { bg: "#f8fafc", color: "#475569" };
              const langLabel = entry.langDist.map((l) => `${l.lang} ${l.count}개`).join(" · ");
              return (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/card/${entry.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-3 cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* TCG 카드 프레임 */}
                    <div
                      className="w-10 h-[58px] rounded-lg flex flex-col overflow-hidden shrink-0"
                      style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb" }}
                    >
                      <div className="h-1.5 w-full shrink-0" style={{ background: "#E53E3E" }} />
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-[7px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
                      </div>
                    </div>

                    {/* 카드 정보 */}
                    <div className="flex-1 min-w-0">
                      {/* 카드명 + 레어도 */}
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
                      <p className="text-[11px] text-gray-400 mb-2" style={{ fontWeight: 400 }}>
                        {entry.series} · {entry.category}
                      </p>

                      {/* 구분선 */}
                      <div className="h-px bg-gray-50 mb-2" />

                      {/* 매물 수 + 최저가/평균가 */}
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500" style={{ fontWeight: 400 }}>
                          매물 <span className="text-gray-900" style={{ fontWeight: 700 }}>{entry.listings}</span>개
                        </span>
                        <div className="text-right">
                          <span className="text-sm text-gray-900" style={{ fontWeight: 800 }}>
                            최저 {entry.minPrice.toLocaleString()}원
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1" style={{ fontWeight: 400 }}>
                            평균 {entry.avgPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* 태그 행: 감정 · 언어 분포 · 안전거래 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.gradedCount > 0 && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: "#f9fafb", color: "#374151", fontWeight: 600, border: "1px solid #e5e7eb" }}
                          >
                            PSA {entry.gradedCount}개
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{langLabel}</span>
                        {entry.safeTrade && (
                          <span
                            className="flex items-center gap-0.5 text-[10px]"
                            style={{ color: "#10b981", fontWeight: 600 }}
                          >
                            <ShieldCheck size={10} strokeWidth={2} />안전거래
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={36} color="#d1d5db" strokeWidth={1.2} className="mb-3" />
              <p className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>검색 결과가 없어요</p>
              <p className="text-gray-400 text-xs mt-1" style={{ fontWeight: 400 }}>다른 키워드로 검색해보세요</p>
            </div>
          )}
        </div>
      )}

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
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
