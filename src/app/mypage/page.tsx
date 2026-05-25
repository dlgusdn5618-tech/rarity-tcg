"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag, ShoppingBag, ArrowLeftRight,
  Heart, Clock, MessageSquare,
} from "lucide-react";

const PRIMARY = "#E53E3E";

const GRID_ITEMS = [
  { Icon: Tag,             label: "판매내역",    href: "/mypage/sales",     color: "#3b82f6" },
  { Icon: ShoppingBag,     label: "구매내역",    href: "/mypage/purchases",  color: "#10b981" },
  { Icon: ArrowLeftRight,  label: "교환내역",    href: "/mypage/trades",    color: "#f59e0b" },
  { Icon: Heart,           label: "찜한 카드",   href: "/mypage/wishlist",  color: PRIMARY   },
  { Icon: Clock,           label: "최근 본 카드", href: "/mypage/recent",    color: "#8b5cf6" },
  { Icon: MessageSquare,   label: "가격제안",    href: "/mypage/offers",    color: "#06b6d4" },
];

const MENU_ITEMS = [
  {
    section: "혜택",
    items: [
      { icon: "🎟️", label: "쿠폰함",     href: "/mypage/coupons",       value: "2장",    badge: 2 },
      { icon: "💎", label: "포인트",      href: "/mypage/points",        value: "1,200P", badge: 0 },
    ],
  },
  {
    section: "계정",
    items: [
      { icon: "🚚", label: "배송지 관리", href: "",                       value: "",       badge: 0 },
      { icon: "💳", label: "결제 정보",   href: "",                       value: "",       badge: 0 },
      { icon: "🔔", label: "알림 설정",   href: "/mypage/notifications",  value: "",       badge: 0 },
      { icon: "🔒", label: "계정 보안",   href: "",                       value: "",       badge: 0 },
    ],
  },
  {
    section: "고객지원",
    items: [
      { icon: "📋", label: "공지사항",    href: "/mypage/notices",        value: "",       badge: 1 },
      { icon: "❓", label: "고객센터",    href: "",                       value: "",       badge: 0 },
      { icon: "📄", label: "이용약관",    href: "",                       value: "",       badge: 0 },
    ],
  },
];

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("마이");

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 bg-white">
        <h1 className="text-xl text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>마이</h1>
        <div className="flex items-center gap-3">
          <button className="relative">
            <span className="text-xl">🔔</span>
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              3
            </span>
          </button>
          <button><span className="text-xl">⚙️</span></button>
        </div>
      </header>

      {/* 프로필 */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="relative shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg, #E53E3E, #F6C90E)" }}
            >
              🎴
            </div>
            <button
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs border"
              style={{ borderColor: "#e5e7eb" }}
            >
              ✏️
            </button>
          </div>

          {/* 닉네임 + 정보 */}
          <div className="flex-1 min-w-0">
            <p className="text-[17px] text-gray-900 leading-tight" style={{ fontWeight: 700 }}>
              레어리티유저
            </p>
            <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>@rarity_user</p>

            {/* 별점 */}
            <div className="flex items-center gap-1 mt-2">
              <span style={{ color: "#F6C90E", fontSize: 14 }}>★</span>
              <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>4.8</span>
              <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>(23개)</span>
            </div>

            {/* 태그: 인증 + 거래수 */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}
              >
                ✓ 인증완료
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "#f9fafb", color: "#6b7280", fontWeight: 500 }}
              >
                거래 18회
              </span>
            </div>
          </div>
        </div>

        {/* 팔로워 / 팔로잉 — 미니멀 */}
        <div className="flex items-center gap-4 mt-4 pl-1">
          <button className="flex items-center gap-1.5">
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>128</span>
            <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>팔로워</span>
          </button>
          <span className="text-gray-200 text-sm">·</span>
          <button className="flex items-center gap-1.5">
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>64</span>
            <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>팔로잉</span>
          </button>
        </div>

        {/* 컬렉터 태그 */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {["PSA 10", "일본판 위주", "PROMO 수집", "SAR 관심", "미개봉 선호"].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ border: "1px solid #d1d5db", color: "#6b7280", fontWeight: 500 }}
            >
              {tag}
            </span>
          ))}
          <span
            className="text-xs px-2.5 py-1 rounded-full cursor-pointer"
            style={{ border: "1px dashed #d1d5db", color: "#9ca3af", fontWeight: 400 }}
          >
            + 편집
          </span>
        </div>

        {/* 버튼 — 보조(아웃라인) + 주요(채움) */}
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", fontWeight: 500 }}
            onClick={() => {}}
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

      {/* 아이콘 그리드 */}
      <div className="bg-white mt-2 px-4 py-5">
        <div className="grid grid-cols-3 gap-y-6">
          {GRID_ITEMS.map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center gap-2 active:opacity-70"
              onClick={() => router.push(item.href)}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${item.color}15` }}
              >
                <item.Icon size={24} strokeWidth={1.8} color={item.color} />
              </div>
              <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      {MENU_ITEMS.map((group) => (
        <div key={group.section} className="bg-white mt-2">
          <p className="px-4 pt-4 pb-1 text-xs text-gray-400" style={{ fontWeight: 600 }}>
            {group.section}
          </p>
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
                onClick={() => item.href && router.push(item.href)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-sm text-gray-400" style={{ fontWeight: 500 }}>{item.value}</span>
                  )}
                  {item.badge > 0 && (
                    <span
                      className="text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ background: PRIMARY, fontWeight: 700 }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="text-gray-300">›</span>
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
          {[
            { icon: "🏠", label: "홈",      href: "/"        },
            { icon: "🔍", label: "탐색",    href: "/explore" },
            { icon: "✨", label: "내 피드",  href: "/"        },
            { icon: "💬", label: "채팅",    href: "/chat"    },
            { icon: "👤", label: "마이",    href: "/mypage"  },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setActiveTab(tab.label); router.push(tab.href); }}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{
                color: activeTab === tab.label ? PRIMARY : "#9ca3af",
                fontWeight: activeTab === tab.label ? 600 : 400,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="h-24" />
    </div>
  );
}
