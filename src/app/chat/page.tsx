"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const CHATS = [
  {
    id: 1,
    user: "트레이너_루피",
    avatar: "👒",
    card: "리자몽 ex SR",
    lastMsg: "네, 직거래 가능합니다! 강남역 어떠세요?",
    time: "방금",
    unread: 2,
    price: 85000,
    isSelling: false,
  },
  {
    id: 2,
    user: "피카덕후",
    avatar: "⚡",
    card: "피카츄 ex SAR",
    lastMsg: "사진 더 보내주실 수 있나요?",
    time: "5분 전",
    unread: 0,
    price: 42000,
    isSelling: true,
  },
  {
    id: 3,
    user: "카드마스터K",
    avatar: "🌀",
    card: "뮤츠 ex UR",
    lastMsg: "감사합니다! 잘 받았어요 🙏",
    time: "1시간 전",
    unread: 0,
    price: 120000,
    isSelling: false,
  },
  {
    id: 4,
    user: "조로팬클럽",
    avatar: "⚔️",
    card: "롤로노아 조로 SR",
    lastMsg: "가격 좀 깎아주실 수 있나요?",
    time: "어제",
    unread: 1,
    price: 67000,
    isSelling: false,
  },
  {
    id: 5,
    user: "불꽃트레이너",
    avatar: "🔥",
    card: "에이스 UR",
    lastMsg: "안전거래로 진행하겠습니다",
    time: "어제",
    unread: 0,
    price: 130000,
    isSelling: true,
  },
  {
    id: 6,
    user: "냉동빔",
    avatar: "💧",
    card: "꼬부기 ex SR",
    lastMsg: "택배 발송했습니다. 운송장번호 드릴게요",
    time: "2일 전",
    unread: 0,
    price: 55000,
    isSelling: true,
  },
];

export default function ChatList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("채팅");
  const [filter, setFilter] = useState<"전체" | "구매" | "판매">("전체");

  const filtered = CHATS.filter((c) => {
    if (filter === "구매") return !c.isSelling;
    if (filter === "판매") return c.isSelling;
    return true;
  });

  const totalUnread = CHATS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto relative">

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 bg-white">
        <h1 className="text-xl text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
          채팅
          {totalUnread > 0 && (
            <span
              className="ml-2 text-white text-xs px-2 py-0.5 rounded-full"
              style={{ background: PRIMARY, fontWeight: 700, fontSize: "11px" }}
            >
              {totalUnread}
            </span>
          )}
        </h1>
        <button className="text-gray-400">
          <span className="text-xl">⚙️</span>
        </button>
      </header>

      {/* 필터 탭 */}
      <div className="flex gap-2 px-4 pb-3">
        {(["전체", "구매", "판매"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
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

      {/* 채팅 목록 */}
      <div className="divide-y divide-gray-50">
        {filtered.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/chat/${chat.id}`)}
          >
            {/* 아바타 */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                {chat.avatar}
              </div>
              {chat.isSelling && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 text-white text-[9px] px-1 py-0.5 rounded-full leading-none"
                  style={{ background: "#3b82f6", fontWeight: 700 }}
                >
                  판매
                </span>
              )}
              {!chat.isSelling && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 text-white text-[9px] px-1 py-0.5 rounded-full leading-none"
                  style={{ background: "#10b981", fontWeight: 700 }}
                >
                  구매
                </span>
              )}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                  {chat.user}
                </span>
                <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>
                  {chat.time}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>
                {chat.card} · {chat.price.toLocaleString()}원
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400 }}>
                  {chat.lastMsg}
                </p>
                {chat.unread > 0 && (
                  <span
                    className="ml-2 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: PRIMARY, fontWeight: 700 }}
                  >
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">💬</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>
            아직 채팅이 없어요
          </p>
          <p className="text-gray-400 text-xs mt-1" style={{ fontWeight: 400 }}>
            마음에 드는 카드를 찾아 문의해보세요
          </p>
        </div>
      )}

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
              className="flex flex-col items-center justify-center gap-0.5 transition-colors relative"
              style={{
                color: activeTab === tab.label ? PRIMARY : "#9ca3af",
                fontWeight: activeTab === tab.label ? 600 : 400,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
              {tab.label === "채팅" && totalUnread > 0 && (
                <span
                  className="absolute top-2 right-4 w-2 h-2 rounded-full"
                  style={{ background: PRIMARY }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="h-20" />
    </div>
  );
}
