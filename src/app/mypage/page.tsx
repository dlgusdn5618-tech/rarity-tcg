"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag, ShoppingBag, ArrowLeftRight, Heart, Clock, DollarSign,
  Ticket, Gem, MapPin, CreditCard, Bell, Shield,
  Megaphone, HelpCircle, FileText, ChevronRight,
  Home, Search, Sparkles, MessageCircle, User,
  Settings, Pencil, Layers,
  type LucideIcon,
} from "lucide-react";

const PRIMARY = "#D62828";

const TRADE_ITEMS = [
  { Icon: Tag,            label: "판매내역",    href: "/mypage/sales"     },
  { Icon: ShoppingBag,    label: "구매내역",    href: "/mypage/purchases"  },
  { Icon: ArrowLeftRight, label: "교환내역",    href: "/mypage/trades"    },
  { Icon: DollarSign,     label: "가격제안",    href: "/mypage/offers"    },
];

const COLLECTION_ITEMS = [
  { Icon: Heart, label: "찜한 카드",    href: "/mypage/wishlist" },
  { Icon: Clock, label: "최근 본 카드", href: "/mypage/recent"   },
];

type MenuItem = { Icon: LucideIcon; label: string; href: string; value?: string; badge?: number };

const MENU_ITEMS: { section: string; items: MenuItem[] }[] = [
  {
    section: "혜택",
    items: [
      { Icon: Ticket,     label: "쿠폰함",     href: "/mypage/coupons",       value: "2장",    badge: 2 },
      { Icon: Gem,        label: "포인트",      href: "/mypage/points",        value: "1,200P", badge: 0 },
    ],
  },
  {
    section: "계정",
    items: [
      { Icon: MapPin,     label: "배송지 관리", href: "",                                        badge: 0 },
      { Icon: CreditCard, label: "결제 정보",   href: "",                                        badge: 0 },
      { Icon: Bell,       label: "알림 설정",   href: "/mypage/notifications",                   badge: 0 },
      { Icon: Shield,     label: "계정 보안",   href: "",                                        badge: 0 },
    ],
  },
  {
    section: "고객지원",
    items: [
      { Icon: Megaphone,  label: "공지사항",    href: "/mypage/notices",                         badge: 1 },
      { Icon: HelpCircle, label: "고객센터",    href: "",                                        badge: 0 },
      { Icon: FileText,   label: "이용약관",    href: "",                                        badge: 0 },
    ],
  },
];

function GridTile({ Icon, label, href, router }: { Icon: LucideIcon; label: string; href: string; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      className="flex items-center gap-3 px-4 active:bg-gray-50 transition-colors"
      style={{
        height: 54,
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 14,
      }}
      onClick={() => router.push(href)}
    >
      <Icon size={18} strokeWidth={1.6} color="#374151" />
      <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{label}</span>
    </button>
  );
}

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("마이");

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 bg-white">
        <h1 className="text-xl text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>마이</h1>
        <div className="flex items-center gap-3">
          <button className="relative p-1">
            <Bell size={22} strokeWidth={1.5} color="#374151" />
            <span
              className="absolute top-0 right-0 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              3
            </span>
          </button>
          <button className="p-1"><Settings size={22} strokeWidth={1.5} color="#374151" /></button>
        </div>
      </header>

      {/* 프로필 */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #E53E3E, #F6C90E)" }}
            >
              <span className="text-white text-2xl" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>R</span>
            </div>
            <button
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Pencil size={11} color="#374151" strokeWidth={2} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] text-gray-900 leading-tight" style={{ fontWeight: 700 }}>레어리티유저</p>
            <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>@rarity_user</p>
            <div className="flex items-center gap-1 mt-2">
              <span style={{ color: "#F6C90E", fontSize: 14 }}>★</span>
              <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>4.8</span>
              <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>(23개)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}>✓ 인증완료</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#f9fafb", color: "#6b7280", fontWeight: 500 }}>거래 18회</span>
            </div>
          </div>
        </div>

        {/* 거래 신뢰 지표 */}
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {[
            { label: "거래완료", value: "18건"  },
            { label: "응답시간", value: "~30분" },
            { label: "안전결제", value: "사용중" },
            { label: "최근접속", value: "오늘"  },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5 py-2 rounded-xl"
              style={{ background: "#f9fafb" }}
            >
              <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{stat.value}</span>
              <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {["PSA 10", "일본판 위주", "PROMO 수집", "SAR 관심", "감정 카드 경험"].map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ border: "1px solid #d1d5db", color: "#6b7280", fontWeight: 500 }}>
              {tag}
            </span>
          ))}
          <span className="text-xs px-2.5 py-1 rounded-full cursor-pointer" style={{ border: "1px dashed #d1d5db", color: "#9ca3af", fontWeight: 400 }}>
            + 편집
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-2.5 rounded-xl text-sm active:opacity-75 transition-opacity"
            style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", fontWeight: 500 }}
            onClick={() => router.push("/mypage/shop")}
          >
            내 샵 보기
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-sm text-white"
            style={{ background: PRIMARY, fontWeight: 700 }}
            onClick={() => router.push("/sell")}
          >
            + 카드 등록
          </button>
        </div>
      </div>

      {/* 거래 관리 그리드 */}
      <div className="bg-white mt-2 px-4 pt-4 pb-5">
        <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 600 }}>거래 관리</p>
        <div className="grid grid-cols-2 gap-2">
          {TRADE_ITEMS.map((item) => (
            <GridTile key={item.label} {...item} router={router} />
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-3 mt-5" style={{ fontWeight: 600 }}>컬렉션</p>

        {/* 컬렉션 금고 — 전 너비 진입 버튼 */}
        <button
          onClick={() => router.push("/mypage/collection")}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-2 active:opacity-80 transition-opacity"
          style={{ background: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.10)" }}
            >
              <Layers size={18} strokeWidth={1.8} color="#F6C90E" />
            </div>
            <div className="text-left">
              <p className="text-sm text-white" style={{ fontWeight: 700 }}>컬렉션 금고</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
                내 카드 자산과 거래 기회
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.8} color="rgba(255,255,255,0.40)" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          {COLLECTION_ITEMS.map((item) => (
            <GridTile key={item.label} {...item} router={router} />
          ))}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      {MENU_ITEMS.map((group) => (
        <div key={group.section} className="bg-white mt-2">
          <p className="px-4 pt-4 pb-1 text-xs text-gray-400" style={{ fontWeight: 600 }}>{group.section}</p>
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-4 active:bg-gray-50"
                style={{ height: 54 }}
                onClick={() => item.href && router.push(item.href)}
              >
                <div className="flex items-center gap-3">
                  <item.Icon size={18} strokeWidth={1.6} color="#9ca3af" />
                  <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-sm text-gray-400" style={{ fontWeight: 400 }}>{item.value}</span>
                  )}
                  {item.badge && item.badge > 0 ? (
                    <span
                      className="text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ background: PRIMARY, fontWeight: 700 }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                  <ChevronRight size={15} strokeWidth={1.5} color="#d1d5db" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 로그아웃 */}
      <div className="px-4 py-6">
        <button className="w-full text-center text-sm text-gray-400" style={{ fontWeight: 400 }}>
          로그아웃
        </button>
      </div>

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

      <div className="h-24" />
    </div>
  );
}
