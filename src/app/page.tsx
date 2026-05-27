"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon, Search, Sparkles, MessageCircle, User,
  Bell, MapPin, Package, Star, RefreshCw, Flame, ArrowRight,
  type LucideIcon,
} from "lucide-react";

const PRIMARY      = "#D62828";
const PRIMARY_DARK = "#B01C1C";

const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  SAR: { bg: "#FFFBEB", color: "#92400E" },
  UR:  { bg: "#F3EEFF", color: "#6D28D9" },
  SR:  { bg: "#FFF0F0", color: "#B91C1C" },
  R:   { bg: "#F0F9FF", color: "#0369A1" },
};

/* ── Heat Ticker ────────────────────────────────────────── */
const HEAT_TICKER = [
  { name: "리자몽 ex",    grade: "SAR", change: "+12%", up: true,  hot: true  },
  { name: "피카츄 ex",    grade: "SAR", change: "+8%",  up: true,  hot: false },
  { name: "뮤츠 ex",      grade: "UR",  change: "-3%",  up: false, hot: false },
  { name: "몽키 D. 루피", grade: "SAR", change: "NEW",  up: true,  hot: false },
  { name: "에이스",       grade: "UR",  change: "+15%", up: true,  hot: true  },
  { name: "이상해꽃",     grade: "SR",  change: "-2%",  up: false, hot: false },
  { name: "꼬부기 ex",    grade: "SR",  change: "+5%",  up: true,  hot: false },
  { name: "조로",         grade: "SR",  change: "+3%",  up: true,  hot: false },
  { name: "뮤 ex",        grade: "SAR", change: "+20%", up: true,  hot: true  },
  { name: "잠만보 ex",    grade: "SR",  change: "+7%",  up: true,  hot: false },
];

/* ── Banners ────────────────────────────────────────────── */
const BANNERS = [
  {
    id: 1,
    badge: "NEW DROP",
    title: "151 시리즈\n재입고 확정",
    sub: "SAR 5종 포함 · 6월 7일 전국 발매",
    bgFrom: "#1a1a2e",
    bgTo:   "#0f0f1a",
    accent: "#D62828",
  },
  {
    id: 2,
    badge: "LIMITED DEAL",
    title: "이번주 한정\n급매 특가",
    sub: "시간 한정 · 최대 30% 저렴한 매물",
    bgFrom: "#1c1003",
    bgTo:   "#100a00",
    accent: "#F6C90E",
  },
  {
    id: 3,
    badge: "TRADE MATCH",
    title: "내 카드로\n교환 매칭",
    sub: "직거래 · 보증금 안전교환",
    bgFrom: "#0d1b2a",
    bgTo:   "#060d14",
    accent: "#3b82f6",
  },
];

/* ── Recent Cards with trend ────────────────────────────── */
const RECENT_CARDS: Record<string, {
  id: number; name: string; grade: string;
  price: number; condition: string; trend: number[];
}[]> = {
  홈: [
    { id: 1, name: "리자몽 ex",     grade: "SR",  price: 85000,  condition: "S급", trend: [72, 78, 75, 82, 85] },
    { id: 2, name: "피카츄 ex",     grade: "SAR", price: 42000,  condition: "A급", trend: [45, 42, 38, 41, 42] },
    { id: 3, name: "뮤츠 ex",       grade: "UR",  price: 120000, condition: "S급", trend: [105,112,108,115,120] },
    { id: 4, name: "롤로노아 조로", grade: "SR",  price: 67000,  condition: "A급", trend: [60, 65, 62, 66, 67] },
    { id: 5, name: "몽키 D. 루피",  grade: "SAR", price: 95000,  condition: "S급", trend: [80, 85, 90, 92, 95] },
  ],
  포켓몬: [
    { id: 1, name: "리자몽 ex", grade: "SR",  price: 85000,  condition: "S급", trend: [72, 78, 75, 82, 85] },
    { id: 2, name: "피카츄 ex", grade: "SAR", price: 42000,  condition: "A급", trend: [45, 42, 38, 41, 42] },
    { id: 3, name: "뮤츠 ex",   grade: "UR",  price: 120000, condition: "S급", trend: [105,112,108,115,120] },
    { id: 4, name: "이상해꽃",  grade: "SR",  price: 38000,  condition: "B급", trend: [42, 40, 38, 37, 38] },
    { id: 5, name: "꼬부기 ex", grade: "SR",  price: 55000,  condition: "A급", trend: [50, 52, 54, 53, 55] },
  ],
  원피스: [
    { id: 1, name: "몽키 D. 루피",  grade: "SAR", price: 95000,  condition: "S급", trend: [80, 85, 90, 92, 95] },
    { id: 2, name: "롤로노아 조로", grade: "SR",  price: 67000,  condition: "A급", trend: [60, 65, 62, 66, 67] },
    { id: 3, name: "나미",          grade: "SR",  price: 45000,  condition: "A급", trend: [42, 44, 46, 44, 45] },
    { id: 4, name: "상디",          grade: "R",   price: 22000,  condition: "B급", trend: [24, 23, 21, 22, 22] },
    { id: 5, name: "에이스",        grade: "UR",  price: 130000, condition: "S급", trend: [110,115,120,125,130] },
  ],
};

const NEWS = [
  { id: 1, tag: "전시회",    tagColor: "#dc2626", tagBg: "#fef2f2", iconColor: "#dc2626", title: "2026 포켓몬 카드 게임 공식 전시회", desc: "코엑스 B홀 · 6월 14일~16일"             },
  { id: 2, tag: "신상 박스", tagColor: "#ea580c", tagBg: "#fff7ed", iconColor: "#ea580c", title: "\"페어리 킹덤\" 신규 박스 출시",    desc: "6월 7일 전국 동시 발매 · SR 3종 포함" },
  { id: 3, tag: "이벤트",    tagColor: "#a16207", tagBg: "#fefce8", iconColor: "#a16207", title: "포켓몬 월드 챔피언십 예선",          desc: "국내 예선 접수 시작 · 7월 5일 마감"   },
  { id: 4, tag: "재판 소식", tagColor: "#15803d", tagBg: "#f0fdf4", iconColor: "#15803d", title: "스칼렛·바이올렛 151 재판 확정",     desc: "공식 발표 · 7월 중 재입고 예정"       },
];

const NEWS_ICONS: Record<string, typeof MapPin> = {
  "전시회":    MapPin,
  "신상 박스": Package,
  "이벤트":    Star,
  "재판 소식": RefreshCw,
};

/* ── Mini trend bars ───────────────────────────────────── */
function TrendBars({ trend, color }: { trend: number[]; color: string }) {
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 14, width: 36 }}>
      {trend.map((v, i) => {
        const pct = ((v - min) / range) * 65 + 35;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${pct}%`,
              background: i === trend.length - 1 ? color : `${color}38`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Banner card stack decoration ──────────────────────── */
function CardStack({ accent }: { accent: string }) {
  return (
    <div className="relative shrink-0" style={{ width: 46, height: 64 }}>
      <div className="absolute inset-0 rounded-lg" style={{
        transform: "rotate(16deg) translate(6px, -5px)",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
      }} />
      <div className="absolute inset-0 rounded-lg" style={{
        transform: "rotate(8deg) translate(3px, -2px)",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
      }} />
      <div className="absolute inset-0 rounded-lg overflow-hidden" style={{
        background: "rgba(255,255,255,0.11)",
        border: "1px solid rgba(255,255,255,0.22)",
      }}>
        <div className="h-[3px] w-full" style={{ background: accent }} />
        <div className="flex-1 h-full flex items-center justify-center p-1.5 pt-2">
          <div className="w-full h-full rounded-sm" style={{
            border: `1px solid ${accent}40`,
            background: `radial-gradient(ellipse at 50% 30%, ${accent}25, transparent 70%)`,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [bannerIdx, setBannerIdx]         = useState(0);
  const [activeTab, setActiveTab]         = useState("홈");
  const [activeCategory, setActiveCategory] = useState("홈");

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">

      {/* ── 헤더 ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          {(["홈", "포켓몬", "원피스"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative pb-1"
              style={{
                fontWeight: activeCategory === cat ? 800 : 400,
                color:      activeCategory === cat ? "#111" : "#9ca3af",
                fontSize:   activeCategory === cat ? "17px" : "15px",
                letterSpacing: "-0.3px",
              }}
            >
              {cat}
              {activeCategory === cat && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: PRIMARY }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="relative" onClick={() => router.push("/mypage/notifications")}>
            <Bell size={20} color="#374151" strokeWidth={1.5} />
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              3
            </span>
          </button>
          <button onClick={() => router.push("/explore")}>
            <Search size={20} color="#374151" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Heat Ticker ── */}
      <div className="flex items-center overflow-hidden bg-white border-b border-gray-100">
        {/* 레이블 */}
        <div
          className="flex items-center gap-1 px-3 py-2.5 shrink-0 border-r border-gray-100"
          style={{ background: "#111" }}
        >
          <Flame size={10} color="#f97316" strokeWidth={2.5} />
          <span className="text-[10px] text-white" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
            SIGNAL
          </span>
        </div>
        {/* 스크롤 아이템 */}
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee">
            {[...HEAT_TICKER, ...HEAT_TICKER].map((item, i) => {
              const chip = RARITY_CHIP[item.grade] ?? { bg: "#f8fafc", color: "#475569" };
              const changeColor = item.change === "NEW" ? "#2563eb"
                : item.up ? "#16a34a" : "#dc2626";
              return (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-2.5 shrink-0">
                  <span
                    className="text-[9px] px-1 py-px rounded"
                    style={{ background: chip.bg, color: chip.color, fontWeight: 700 }}
                  >
                    {item.grade}
                  </span>
                  <span className="text-[11px] text-gray-800" style={{ fontWeight: 600 }}>
                    {item.name}
                  </span>
                  <span className="text-[10px]" style={{ color: changeColor, fontWeight: 700 }}>
                    {item.change}
                  </span>
                  {item.hot && (
                    <span
                      className="text-[8px] px-1 rounded"
                      style={{ background: "#fff7ed", color: "#ea580c", fontWeight: 700 }}
                    >
                      HOT
                    </span>
                  )}
                  <span className="text-gray-200 text-xs mx-0.5">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 히어로 배너 ── */}
      <div className="px-4 pt-4">
        <div
          className="relative rounded-2xl overflow-hidden h-48 cursor-pointer"
          style={{ background: `linear-gradient(140deg, ${banner.bgFrom} 0%, ${banner.bgTo} 100%)` }}
          onClick={() => setBannerIdx((bannerIdx + 1) % BANNERS.length)}
        >
          {/* 도트 패턴 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          {/* 좌측 텍스트 */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 pr-24">
            <span
              className="text-[10px] mb-2.5 self-start px-2 py-0.5 rounded"
              style={{ background: banner.accent, color: "#fff", fontWeight: 700, letterSpacing: "0.06em" }}
            >
              {banner.badge}
            </span>
            <h2
              className="text-white text-[22px] leading-snug whitespace-pre-line"
              style={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              {banner.title}
            </h2>
            <p className="text-white/60 text-[11px] mt-1.5" style={{ fontWeight: 400 }}>
              {banner.sub}
            </p>
          </div>
          {/* 카드 스택 장식 */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <CardStack accent={banner.accent} />
          </div>
          {/* 하단 페이지 도트 */}
          <div className="absolute bottom-3.5 right-4 flex gap-1">
            {BANNERS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width:      i === bannerIdx ? 14 : 4,
                  height:     4,
                  background: i === bannerIdx ? banner.accent : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 판매 유도 스트립 ── */}
      <div className="px-4 pt-3">
        <div
          className="rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{ background: "#fff", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
        >
          <div>
            <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>
              중복 카드를 지금 바로 현금으로
            </p>
            <p className="text-gray-400 text-[11px] mt-0.5" style={{ fontWeight: 400 }}>
              등록 무료 · 팔릴 때만 수수료 7%
            </p>
          </div>
          <button
            onClick={() => router.push("/sell")}
            className="flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded-full shrink-0"
            style={{ background: PRIMARY, fontWeight: 700 }}
          >
            지금 팔기 <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── 최근 등록 카드 ── */}
      <div className="pt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-gray-900 text-[15px]" style={{ fontWeight: 700 }}>최근 등록 카드</h3>
          <button
            className="flex items-center gap-0.5 text-xs text-gray-400"
            style={{ fontWeight: 400 }}
            onClick={() => router.push("/explore")}
          >
            더보기 <ArrowRight size={11} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2">
          {RECENT_CARDS[activeCategory].map((card) => {
            const chip = RARITY_CHIP[card.grade] ?? { bg: "#f8fafc", color: "#475569" };
            const isUp = card.trend[4] >= card.trend[0];
            return (
              <div
                key={card.id}
                className="shrink-0 w-[108px] cursor-pointer"
                onClick={() => router.push(`/card/${card.id}`)}
              >
                {/* 카드 프레임 영역 */}
                <div
                  className="rounded-xl h-[108px] flex flex-col items-center justify-center mb-2"
                  style={{ background: `${chip.color}0e`, border: `1px solid ${chip.color}22` }}
                >
                  <div
                    className="w-[58px] h-[80px] rounded-lg flex flex-col overflow-hidden"
                    style={{
                      border: `1px solid ${chip.color}38`,
                      background: `linear-gradient(175deg, ${chip.color}12 0%, #f6f6f6 55%)`,
                    }}
                  >
                    <div className="h-[3px] w-full" style={{ background: chip.color }} />
                    <div className="flex-1 flex items-center justify-center p-1.5">
                      <div style={{
                        width: "100%", height: "100%", borderRadius: 2,
                        border: `1px solid ${chip.color}22`,
                        background: `radial-gradient(ellipse at 50% 30%, ${chip.color}18, transparent 70%)`,
                      }} />
                    </div>
                    <div className="py-0.5 text-center" style={{ background: `${chip.color}15`, borderTop: `1px solid ${chip.color}20` }}>
                      <span className="text-[8px]" style={{ color: chip.color, fontWeight: 700 }}>{card.grade}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 700 }}>{card.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{card.condition}</p>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 800 }}>{card.price.toLocaleString()}원</p>
                  <TrendBars trend={card.trend} color={isUp ? "#16a34a" : "#dc2626"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 카드 소식 ── */}
      <div className="pt-5 pb-2">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-gray-900 text-[15px]" style={{ fontWeight: 700 }}>카드 소식</h3>
          <button className="text-xs text-gray-400" style={{ fontWeight: 400 }}>더보기 ›</button>
        </div>
        <div className="flex flex-col gap-2 px-4">
          {NEWS.map((item) => {
            const NewsIcon = NEWS_ICONS[item.tag];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50"
                style={{ border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.tagBg }}
                >
                  {NewsIcon && <NewsIcon size={18} strokeWidth={1.5} color={item.iconColor} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-md"
                      style={{ background: item.tagBg, color: item.tagColor, fontWeight: 700 }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 leading-snug truncate" style={{ fontWeight: 600 }}>{item.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{item.desc}</p>
                </div>
                <ArrowRight size={13} color="#d1d5db" strokeWidth={1.5} className="shrink-0" />
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
          style={{ background: PRIMARY, fontWeight: 600, boxShadow: `0 4px 14px ${PRIMARY}55` }}
        >
          <span className="text-base leading-none">+</span> 판매
        </button>
      </div>

      {/* ── 하단 탭 ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
        <div className="grid grid-cols-5 h-14">
          {(
            [
              { Icon: HomeIcon,       label: "홈",   href: "/"        },
              { Icon: Search,        label: "탐색", href: "/explore" },
              { Icon: Sparkles,      label: "피드", href: "/feed"    },
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
