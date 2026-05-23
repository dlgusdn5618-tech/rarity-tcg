"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const MY_LISTINGS = [
  { id: 1, name: "리자몽 ex",     grade: "SR",  price: 85000,  emoji: "🔥", status: "판매중",   condition: "S급" },
  { id: 2, name: "뮤츠 ex",       grade: "UR",  price: 120000, emoji: "🌀", status: "판매중",   condition: "S급" },
  { id: 3, name: "꼬부기 ex",     grade: "SR",  price: 55000,  emoji: "💧", status: "거래완료", condition: "A급" },
  { id: 4, name: "이상해꽃",      grade: "SR",  price: 38000,  emoji: "🌿", status: "거래완료", condition: "B급" },
];

const MENU_ITEMS = [
  {
    section: "거래",
    items: [
      { icon: "📦", label: "구매내역",    badge: 0  },
      { icon: "🏷️", label: "판매내역",   badge: 2  },
      { icon: "⭐", label: "찜한 카드",   badge: 12 },
      { icon: "🔄", label: "교환 제안",   badge: 1  },
    ],
  },
  {
    section: "계정",
    items: [
      { icon: "🌟", label: "받은 리뷰",   badge: 0 },
      { icon: "📝", label: "쓴 리뷰",     badge: 0 },
      { icon: "🔔", label: "알림 설정",   badge: 0 },
      { icon: "💳", label: "결제 정보",   badge: 0 },
    ],
  },
  {
    section: "기타",
    items: [
      { icon: "❓", label: "고객센터",    badge: 0 },
      { icon: "📋", label: "공지사항",    badge: 1 },
      { icon: "⚙️", label: "앱 설정",    badge: 0 },
    ],
  },
];

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("마이");
  const [listingTab, setListingTab] = useState<"판매중" | "거래완료">("판매중");

  const visibleListings = MY_LISTINGS.filter((c) => c.status === listingTab);

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">

      {/* 프로필 헤더 */}
      <div className="bg-white px-4 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>마이페이지</h1>
          <button
            className="text-white text-xs px-3 py-1.5 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
            onClick={() => {}}
          >
            프로필 수정
          </button>
        </div>

        {/* 아바타 + 정보 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg, #E53E3E, #F6C90E)" }}
            >
              🎴
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs border-2"
              style={{ borderColor: "#E53E3E" }}
            >
              ✏️
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>레어리티유저</p>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-xs" style={{ color: s <= 4 ? "#F6C90E" : "#d1d5db" }}>★</span>
              ))}
              <span className="text-xs text-gray-400 ml-1" style={{ fontWeight: 400 }}>4.8 (23개)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1" style={{ fontWeight: 400 }}>
              <span className="text-green-500 font-semibold">●</span> 인증 완료 · 가입 6개월
            </p>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-0 mt-5 border border-gray-100 rounded-2xl overflow-hidden">
          {[
            { label: "판매중",   value: "2",  color: PRIMARY },
            { label: "거래완료", value: "18", color: "#10b981" },
            { label: "찜한 카드", value: "12", color: "#f59e0b" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-4 bg-white ${i < 2 ? "border-r border-gray-100" : ""}`}
            >
              <span className="text-xl" style={{ fontWeight: 800, color: stat.color }}>{stat.value}</span>
              <span className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 내 카드 섹션 */}
      <div className="bg-white mt-2 px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>내 카드</h2>
          <button
            onClick={() => router.push("/sell")}
            className="text-white text-xs px-3 py-1 rounded-full"
            style={{ background: PRIMARY, fontWeight: 600 }}
          >
            + 등록
          </button>
        </div>

        {/* 상태 탭 */}
        <div className="flex gap-2 mb-3">
          {(["판매중", "거래완료"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setListingTab(t)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: listingTab === t ? PRIMARY : "#f3f4f6",
                color: listingTab === t ? "#fff" : "#6b7280",
                fontWeight: listingTab === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {visibleListings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleListings.map((card) => (
              <div
                key={card.id}
                className="cursor-pointer"
                onClick={() => router.push(`/card/${card.id}`)}
              >
                <div className="bg-gray-100 rounded-xl h-28 flex items-center justify-center relative mb-2">
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="absolute top-1.5 left-1.5 text-[10px] bg-white/90 text-gray-600 px-1.5 py-0.5 rounded-md" style={{ fontWeight: 500 }}>
                    {card.grade}
                  </span>
                  {card.status === "거래완료" && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs" style={{ fontWeight: 700 }}>거래완료</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{card.name}</p>
                <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{card.condition}</p>
                <p className="text-sm text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{card.price.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="text-4xl mb-3">🎴</span>
            <p className="text-sm text-gray-400" style={{ fontWeight: 400 }}>아직 카드가 없어요</p>
          </div>
        )}
      </div>

      {/* 메뉴 리스트 */}
      {MENU_ITEMS.map((group) => (
        <div key={group.section} className="bg-white mt-2">
          <p className="px-4 pt-4 pb-2 text-xs text-gray-400" style={{ fontWeight: 600 }}>{group.section}</p>
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge > 0 && (
                    <span
                      className="text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ background: PRIMARY, fontWeight: 700 }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 로그아웃 */}
      <div className="px-4 py-5">
        <button className="w-full text-center text-sm text-gray-400" style={{ fontWeight: 400 }}>
          로그아웃
        </button>
      </div>

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
        <div className="grid grid-cols-5 h-14">
          {[
            { icon: "🏠", label: "홈",     href: "/"        },
            { icon: "🔍", label: "탐색",   href: "/explore" },
            { icon: "✨", label: "내 피드", href: "/"        },
            { icon: "💬", label: "채팅",   href: "/chat"    },
            { icon: "👤", label: "마이",   href: "/mypage"  },
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
