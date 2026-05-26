"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home as HomeIcon, Search, Sparkles, MessageCircle, User, Bell, MapPin, Package, Star, RefreshCw, type LucideIcon } from "lucide-react";

const PRIMARY = "#E53E3E";
const PRIMARY_DARK = "#C53030";

const RANKINGS = [
  { rank: 1,  name: "리자몽 ex",    grade: "SR",  up: true  },
  { rank: 2,  name: "피카츄 ex",    grade: "SAR", up: true  },
  { rank: 3,  name: "뮤츠 ex",      grade: "UR",  up: false },
  { rank: 4,  name: "몽키 D. 루피", grade: "SAR", up: true  },
  { rank: 5,  name: "에이스",       grade: "UR",  up: true  },
  { rank: 6,  name: "이상해꽃",     grade: "SR",  up: false },
  { rank: 7,  name: "꼬부기 ex",    grade: "SR",  up: false },
  { rank: 8,  name: "조로",         grade: "SR",  up: true  },
  { rank: 9,  name: "뮤 ex",        grade: "SAR", up: false },
  { rank: 10, name: "잠만보 ex",    grade: "SR",  up: true  },
];

const BANNERS = [
  {
    id: 1,
    label: "신상 입고",
    title: "151 시리즈가\n돌아왔다",
    sub: "전설의 카드들을 지금 만나보세요",
    bgFrom: "#E53E3E",
    bgTo: "#9B2C2C",
  },
  {
    id: 2,
    label: "이번주 급매",
    title: "오늘만\n이 가격",
    sub: "시간 한정 특가 카드 모음",
    bgFrom: "#F6C90E",
    bgTo: "#D69E2E",
  },
  {
    id: 3,
    label: "교환 매칭",
    title: "내 카드로\n교환하기",
    sub: "원하는 카드와 바로 매칭",
    bgFrom: "#ED8936",
    bgTo: "#C05621",
  },
];

const RECENT_CARDS: Record<string, { id: number; name: string; grade: string; price: number; condition: string }[]> = {
  홈: [
    { id: 1, name: "리자몽 ex",     grade: "SR",  price: 85000,  condition: "S급" },
    { id: 2, name: "피카츄 ex",     grade: "SAR", price: 42000,  condition: "A급" },
    { id: 3, name: "뮤츠 ex",       grade: "UR",  price: 120000, condition: "S급" },
    { id: 4, name: "롤로노아 조로", grade: "SR",  price: 67000,  condition: "A급" },
    { id: 5, name: "몽키 D. 루피",  grade: "SAR", price: 95000,  condition: "S급" },
  ],
  포켓몬: [
    { id: 1, name: "리자몽 ex",  grade: "SR",  price: 85000,  condition: "S급" },
    { id: 2, name: "피카츄 ex",  grade: "SAR", price: 42000,  condition: "A급" },
    { id: 3, name: "뮤츠 ex",    grade: "UR",  price: 120000, condition: "S급" },
    { id: 4, name: "이상해꽃",   grade: "SR",  price: 38000,  condition: "B급" },
    { id: 5, name: "꼬부기 ex",  grade: "SR",  price: 55000,  condition: "A급" },
  ],
  원피스: [
    { id: 1, name: "몽키 D. 루피",  grade: "SAR", price: 95000,  condition: "S급" },
    { id: 2, name: "롤로노아 조로", grade: "SR",  price: 67000,  condition: "A급" },
    { id: 3, name: "나미",          grade: "SR",  price: 45000,  condition: "A급" },
    { id: 4, name: "상디",          grade: "R",   price: 22000,  condition: "B급" },
    { id: 5, name: "에이스",        grade: "UR",  price: 130000, condition: "S급" },
  ],
};

const NEWS = [
  { id: 1, tag: "전시회",    tagColor: "bg-red-100 text-red-600",       iconColor: "#dc2626", title: "2026 포켓몬 카드 게임 공식 전시회", desc: "코엑스 B홀 · 6월 14일~16일",             bg: "bg-red-50"    },
  { id: 2, tag: "신상 박스", tagColor: "bg-orange-100 text-orange-600", iconColor: "#ea580c", title: "\"페어리 킹덤\" 신규 박스 출시",    desc: "6월 7일 전국 동시 발매 · SR 3종 포함", bg: "bg-orange-50" },
  { id: 3, tag: "이벤트",    tagColor: "bg-yellow-100 text-yellow-700", iconColor: "#a16207", title: "포켓몬 월드 챔피언십 예선",          desc: "국내 예선 접수 시작 · 7월 5일 마감",   bg: "bg-yellow-50" },
  { id: 4, tag: "재판 소식", tagColor: "bg-green-100 text-green-700",   iconColor: "#15803d", title: "스칼렛·바이올렛 151 재판 확정",     desc: "공식 발표 · 7월 중 재입고 예정",       bg: "bg-green-50"  },
];

const NEWS_ICONS: Record<string, typeof MapPin> = {
  "전시회":   MapPin,
  "신상 박스": Package,
  "이벤트":   Star,
  "재판 소식": RefreshCw,
};

export default function Home() {
  const router = useRouter();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("홈");
  const [activeCategory, setActiveCategory] = useState("홈");

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto relative">

      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-4">
          {["홈", "포켓몬", "원피스"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative pb-1"
              style={{
                fontWeight: activeCategory === cat ? 700 : 400,
                color: activeCategory === cat ? "#111" : "#9ca3af",
                fontSize: activeCategory === cat ? "17px" : "15px",
                letterSpacing: "-0.3px",
              }}
            >
              {cat}
              {activeCategory === cat && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: PRIMARY }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={20} color="#374151" strokeWidth={1.5} />
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              3
            </span>
          </button>
          <button><Search size={20} color="#374151" strokeWidth={1.5} /></button>
        </div>
      </header>

      {/* 랭킹 스트립 */}
      <div className="flex items-center border-b border-gray-100 overflow-hidden">
        <div className="flex items-center px-3 py-2.5 bg-white shrink-0 z-10 border-r border-gray-100">
          <span
            className="text-xs text-white px-2 py-0.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 700 }}
          >
            랭킹
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee">
            {[...RANKINGS, ...RANKINGS].map((item, i) => (
              <span key={i} className="flex items-center gap-1 px-4 py-2.5 shrink-0">
                <span
                  className="text-xs w-4 text-center"
                  style={{ fontWeight: 700, color: item.rank <= 3 ? PRIMARY : "#9ca3af" }}
                >
                  {item.rank}
                </span>
                <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{item.name}</span>
                <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{item.grade}</span>
                <span className="text-[10px]" style={{ color: item.up ? "#22c55e" : "#9ca3af" }}>
                  {item.up ? "▲" : "▼"}
                </span>
                <span className="text-gray-200 mx-1 text-xs">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 히어로 배너 */}
      <div className="px-4 pt-4">
        <div
          className="relative rounded-2xl overflow-hidden h-52 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${banner.bgFrom}, ${banner.bgTo})` }}
          onClick={() => setBannerIdx((bannerIdx + 1) % BANNERS.length)}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <span className="text-white/70 text-xs mb-1" style={{ fontWeight: 300 }}>{banner.label}</span>
            <h2 className="text-white text-2xl leading-tight whitespace-pre-line" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              {banner.title}
            </h2>
            <p className="text-white/80 text-xs mt-1" style={{ fontWeight: 300 }}>{banner.sub}</p>
          </div>
          <div className="absolute top-4 right-5 bg-black/20 text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {bannerIdx + 1}/{BANNERS.length}
          </div>
          <div className="absolute bottom-4 right-5 flex gap-1">
            {BANNERS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === bannerIdx ? "w-4 bg-white" : "w-1 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 홍보 카드 */}
      <div className="px-4 pt-3">
        <div
          className="rounded-2xl p-4 flex items-center justify-between overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)" }}
        >
          <div>
            <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>
              중복 카드, 모아두지 말고
            </p>
            <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>
              지금 바로 현금으로
            </p>
            <p className="text-gray-500 text-xs mt-1.5" style={{ fontWeight: 400 }}>등록 무료 · 팔릴 때만 수수료</p>
          </div>
          <div>
            <span
              className="text-xs text-white px-3 py-1.5 rounded-full"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              지금 팔기
            </span>
          </div>
        </div>
      </div>

      {/* 최근 등록 카드 */}
      <div className="pt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>최근 등록 카드</h3>
          <button className="text-gray-400 text-sm" style={{ fontWeight: 400 }}>›</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2">
          {RECENT_CARDS[activeCategory].map((card) => (
            <div key={card.id} className="shrink-0 w-28 cursor-pointer" onClick={() => router.push(`/card/${card.id}`)}>
              <div className="bg-gray-100 rounded-xl h-28 flex items-center justify-center mb-2">
                <div className="w-14 h-[78px] rounded-lg bg-white shadow-sm flex flex-col overflow-hidden border border-gray-200">
                  <div className="h-1.5 w-full" style={{ background: PRIMARY }} />
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[9px] text-gray-200 select-none" style={{ fontWeight: 700 }}>TCG</span>
                  </div>
                  <div className="h-5 bg-gray-50 flex items-center justify-center border-t border-gray-100">
                    <span className="text-[9px] text-gray-500" style={{ fontWeight: 700 }}>{card.grade}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
              <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{card.condition}</p>
              <p className="text-sm text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{card.price.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      </div>

      {/* 카드 소식 */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>카드 소식</h3>
          <button className="text-gray-400 text-sm" style={{ fontWeight: 400 }}>›</button>
        </div>
        <div className="flex flex-col gap-2 px-4">
          {NEWS.map((item) => {
            const NewsIcon = NEWS_ICONS[item.tag];
            return (
              <div key={item.id} className={`${item.bg} rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:opacity-80`}>
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                  {NewsIcon && <NewsIcon size={20} strokeWidth={1.5} color={item.iconColor} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md inline-block mb-1 ${item.tagColor}`} style={{ fontWeight: 600 }}>
                    {item.tag}
                  </span>
                  <p className="text-sm text-gray-900 leading-snug truncate" style={{ fontWeight: 600 }}>{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{item.desc}</p>
                </div>
                <span className="text-gray-300 text-lg shrink-0">›</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* + 판매 플로팅 버튼 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none z-10">
        <button
          onClick={() => router.push("/sell")}
          className="ml-auto flex pointer-events-auto text-white text-sm px-5 py-3 rounded-full shadow-lg items-center gap-1.5 transition-opacity hover:opacity-90"
          style={{ background: PRIMARY, fontWeight: 600 }}
        >
          <span className="text-base">+</span> 판매
        </button>
      </div>

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
        <div className="grid grid-cols-5 h-14">
          {(
            [
              { Icon: HomeIcon,       label: "홈",   href: "/"        },
              { Icon: Search,        label: "탐색", href: "/explore" },
              { Icon: Sparkles,      label: "피드", href: "/"        },
              { Icon: MessageCircle, label: "채팅", href: "/chat"    },
              { Icon: User,          label: "마이", href: "/mypage"  },
            ] as { Icon: LucideIcon; label: string; href: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => { setActiveTab(tab.label); router.push(tab.href); }}
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

      <div className="h-32" />
    </div>
  );
}
