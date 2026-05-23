"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const INITIAL_CHATS = [
  { id: 1, user: "트레이너_루피", avatar: "👒", card: "리자몽 ex SR",     lastMsg: "네, 직거래 가능합니다! 강남역 어떠세요?",   time: "방금",   unread: 2, price: 85000,  isSelling: false },
  { id: 2, user: "피카덕후",      avatar: "⚡",  card: "피카츄 ex SAR",    lastMsg: "사진 더 보내주실 수 있나요?",               time: "5분 전", unread: 0, price: 42000,  isSelling: true  },
  { id: 3, user: "카드마스터K",   avatar: "🌀", card: "뮤츠 ex UR",       lastMsg: "감사합니다! 잘 받았어요 🙏",                time: "1시간 전", unread: 0, price: 120000, isSelling: false },
  { id: 4, user: "조로팬클럽",   avatar: "⚔️", card: "롤로노아 조로 SR",  lastMsg: "가격 좀 깎아주실 수 있나요?",              time: "어제",   unread: 1, price: 67000,  isSelling: false },
  { id: 5, user: "불꽃트레이너", avatar: "🔥",  card: "에이스 UR",         lastMsg: "안전거래로 진행하겠습니다",                 time: "어제",   unread: 0, price: 130000, isSelling: true  },
  { id: 6, user: "냉동빔",        avatar: "💧", card: "꼬부기 ex SR",      lastMsg: "택배 발송했습니다. 운송장번호 드릴게요",    time: "2일 전", unread: 0, price: 55000,  isSelling: true  },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: on ? PRIMARY : "#d1d5db" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}

export default function ChatList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("채팅");
  const [filter, setFilter] = useState<"전체" | "구매" | "판매">("전체");
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [showSettings, setShowSettings] = useState(false);

  // 토글 상태 — localStorage 에서 불러오기
  const [notifMsg, setNotifMsg] = useState(true);
  const [notifVibrate, setNotifVibrate] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("chat_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifMsg(parsed.notifMsg ?? true);
      setNotifVibrate(parsed.notifVibrate ?? true);
    }
  }, []);

  function saveToggle(key: string, value: boolean) {
    const prev = JSON.parse(localStorage.getItem("chat_settings") ?? "{}");
    localStorage.setItem("chat_settings", JSON.stringify({ ...prev, [key]: value }));
  }

  function toggleNotifMsg() {
    const next = !notifMsg;
    setNotifMsg(next);
    saveToggle("notifMsg", next);
  }

  function toggleNotifVibrate() {
    const next = !notifVibrate;
    setNotifVibrate(next);
    saveToggle("notifVibrate", next);
  }

  function markAllRead() {
    setChats((prev) => prev.map((c) => ({ ...c, unread: 0 })));
    setShowSettings(false);
  }

  const filtered = chats.filter((c) => {
    if (filter === "구매") return !c.isSelling;
    if (filter === "판매") return c.isSelling;
    return true;
  });

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

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
        <button onClick={() => setShowSettings(true)} className="p-1 -mr-1">
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
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                {chat.avatar}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 text-white text-[9px] px-1 py-0.5 rounded-full leading-none"
                style={{ background: chat.isSelling ? "#3b82f6" : "#10b981", fontWeight: 700 }}
              >
                {chat.isSelling ? "판매" : "구매"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{chat.user}</span>
                <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{chat.time}</span>
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
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>아직 채팅이 없어요</p>
          <p className="text-gray-400 text-xs mt-1" style={{ fontWeight: 400 }}>마음에 드는 카드를 찾아 문의해보세요</p>
        </div>
      )}

      {/* ── 설정 바텀시트 ── */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 핸들 */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
            <p className="px-6 text-base text-gray-900 mb-5" style={{ fontWeight: 700 }}>채팅 설정</p>

            {/* 알림 섹션 */}
            <p className="px-6 text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>알림</p>
            <div className="mx-4 rounded-2xl overflow-hidden mb-4" style={{ background: "#f9fafb" }}>
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>메시지 알림</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>새 메시지가 오면 알려드려요</p>
                </div>
                <Toggle on={notifMsg} onToggle={toggleNotifMsg} />
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>진동</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>알림 시 진동도 함께</p>
                </div>
                <Toggle on={notifVibrate} onToggle={toggleNotifVibrate} />
              </div>
            </div>

            {/* 채팅 관리 섹션 */}
            <p className="px-6 text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>채팅 관리</p>
            <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#f9fafb" }}>
              <button
                className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-100"
                onClick={markAllRead}
                disabled={totalUnread === 0}
              >
                <div className="text-left">
                  <p
                    className="text-sm"
                    style={{ fontWeight: 600, color: totalUnread > 0 ? "#111827" : "#9ca3af" }}
                  >
                    전체 읽음 처리
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                    {totalUnread > 0 ? `읽지 않은 메시지 ${totalUnread}개` : "읽지 않은 메시지가 없어요"}
                  </p>
                </div>
                {totalUnread > 0 && (
                  <span
                    className="text-white text-xs px-2.5 py-1 rounded-full"
                    style={{ background: PRIMARY, fontWeight: 700 }}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>
            </div>

            <div className="h-4" />
          </div>
        </div>
      )}

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
              className="flex flex-col items-center justify-center gap-0.5 transition-colors relative"
              style={{
                color: activeTab === tab.label ? PRIMARY : "#9ca3af",
                fontWeight: activeTab === tab.label ? 600 : 400,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
              {tab.label === "채팅" && totalUnread > 0 && (
                <span className="absolute top-2 right-4 w-2 h-2 rounded-full" style={{ background: PRIMARY }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="h-20" />
    </div>
  );
}
