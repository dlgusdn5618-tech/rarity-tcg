"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RECENT_SEARCHES = ["리자몽 ex SR", "피카츄 SAR", "루피 SAR", "뮤츠 UR"];

const POPULAR_SEARCHES = [
  { rank: 1, keyword: "리자몽 ex" },
  { rank: 2, keyword: "피카츄 ex SAR" },
  { rank: 3, keyword: "루피 SAR" },
  { rank: 4, keyword: "뮤츠 ex UR" },
  { rank: 5, keyword: "에이스 UR" },
  { rank: 6, keyword: "이상해꽃 SR" },
];

const SERIES = ["전체", "151", "스칼렛·바이올렛", "페어리킹덤", "OP-01", "OP-02", "OP-07"];

const GRADES = ["전체", "S급", "A급", "B급"];

const ALL_CARDS = [
  { id: 1,  name: "리자몽 ex",      series: "151",            grade: "SR",  price: 85000,  emoji: "🔥", condition: "S급", category: "포켓몬", views: 1240, likes: 320 },
  { id: 2,  name: "피카츄 ex",      series: "151",            grade: "SAR", price: 42000,  emoji: "⚡", condition: "A급", category: "포켓몬", views: 980,  likes: 210 },
  { id: 3,  name: "뮤츠 ex",        series: "151",            grade: "UR",  price: 120000, emoji: "🌀", condition: "S급", category: "포켓몬", views: 870,  likes: 180 },
  { id: 4,  name: "이상해꽃 ex",    series: "151",            grade: "SR",  price: 38000,  emoji: "🌿", condition: "B급", category: "포켓몬", views: 430,  likes: 90  },
  { id: 5,  name: "꼬부기 ex",      series: "151",            grade: "SR",  price: 55000,  emoji: "💧", condition: "A급", category: "포켓몬", views: 560,  likes: 130 },
  { id: 6,  name: "잠만보 ex",      series: "스칼렛·바이올렛", grade: "SAR", price: 67000,  emoji: "💤", condition: "S급", category: "포켓몬", views: 720,  likes: 160 },
  { id: 7,  name: "몽키 D. 루피",   series: "OP-01",          grade: "SAR", price: 95000,  emoji: "👒", condition: "S급", category: "원피스", views: 1100, likes: 290 },
  { id: 8,  name: "롤로노아 조로",  series: "OP-01",          grade: "SR",  price: 67000,  emoji: "⚔️", condition: "A급", category: "원피스", views: 640,  likes: 150 },
  { id: 9,  name: "나미",           series: "OP-02",          grade: "SR",  price: 45000,  emoji: "🍊", condition: "A급", category: "원피스", views: 380,  likes: 80  },
  { id: 10, name: "에이스",         series: "OP-02",          grade: "UR",  price: 130000, emoji: "🔥", condition: "S급", category: "원피스", views: 930,  likes: 240 },
  { id: 11, name: "상디",           series: "OP-07",          grade: "R",   price: 22000,  emoji: "🍳", condition: "B급", category: "원피스", views: 210,  likes: 45  },
  { id: 12, name: "뮤 ex",          series: "페어리킹덤",      grade: "SAR", price: 88000,  emoji: "✨", condition: "S급", category: "포켓몬", views: 810,  likes: 200 },
];

type SortType = "최신순" | "인기순" | "조회순";

const CONDITION_COLORS: Record<string, string> = {
  "S급": "text-yellow-600",
  "A급": "text-blue-600",
  "B급": "text-gray-500",
};

export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedSeries, setSelectedSeries] = useState("전체");
  const [selectedGrade, setSelectedGrade] = useState("전체");
  const [showFilter, setShowFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortType, setSortType] = useState<SortType>("최신순");
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

  const filteredCards = ALL_CARDS
    .filter((card) => {
      const matchQuery = query === "" || card.name.includes(query) || card.grade.includes(query);
      const matchCategory = selectedCategory === "전체" || card.category === selectedCategory;
      const matchSeries = selectedSeries === "전체" || card.series === selectedSeries;
      const matchGrade = selectedGrade === "전체" || card.condition === selectedGrade;
      return matchQuery && matchCategory && matchSeries && matchGrade;
    })
    .sort((a, b) => {
      if (sortType === "최신순") return b.id - a.id;
      if (sortType === "인기순") return b.likes - a.likes;
      if (sortType === "조회순") return b.views - a.views;
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
            <span className="text-gray-400 text-sm">🔍</span>
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
            <button onClick={() => setShowFilter(!showFilter)}>
              <span className="text-xl">⚙️</span>
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
            <span className="text-xs text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>상태</span>
            <div className="flex gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedGrade === g
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                  style={{ fontWeight: selectedGrade === g ? 600 : 400 }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카드 그리드 */}
      {!isFocused && (
        <div className="px-4 pt-4 pb-24">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
              총 <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredCards.length}개</span>
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

              {/* 드롭다운 메뉴 */}
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden w-28">
                    {(["최신순", "인기순", "조회순"] as SortType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSortType(type); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortType === type
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-50"
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

          <div className="grid grid-cols-2 gap-3">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(`/card/${card.id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 h-36 flex items-center justify-center relative">
                  <span className="text-5xl">{card.emoji}</span>
                  <span
                    className="absolute top-2 left-2 text-[10px] bg-white px-1.5 py-0.5 rounded-md text-gray-600 border border-gray-100"
                    style={{ fontWeight: 500 }}
                  >
                    {card.grade}
                  </span>
                  <span className="absolute top-2 right-2 text-[10px] bg-black/10 text-gray-600 px-1.5 py-0.5 rounded-md" style={{ fontWeight: 400 }}>
                    {card.category}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>{card.series}</p>
                  <p className="text-sm text-gray-900 leading-snug mb-1 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${CONDITION_COLORS[card.condition]}`} style={{ fontWeight: 500 }}>
                      {card.condition}
                    </span>
                    <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                      {card.price.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>검색 결과가 없어요</p>
              <p className="text-gray-400 text-xs mt-1" style={{ fontWeight: 400 }}>다른 키워드로 검색해보세요</p>
            </div>
          )}
        </div>
      )}

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
        <div className="grid grid-cols-5 h-14">
          {[
            { icon: "🏠", label: "홈", href: "/" },
            { icon: "🔍", label: "탐색", href: "/explore" },
            { icon: "✨", label: "내 피드", href: "/" },
            { icon: "💬", label: "채팅", href: "/chat"   },
            { icon: "👤", label: "마이", href: "/mypage" },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                tab.label === "탐색" ? "text-gray-900" : "text-gray-400"
              }`}
              style={{ fontWeight: tab.label === "탐색" ? 600 : 400 }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
