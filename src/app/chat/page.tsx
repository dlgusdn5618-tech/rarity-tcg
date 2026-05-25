"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Search, Sparkles, MessageCircle, User, type LucideIcon } from "lucide-react";

const PRIMARY = "#E53E3E";

const INITIAL_CHATS = [
  { id: 1, user: "트레이너_루피", avatar: "👒", card: "리자몽 ex SR",     lastMsg: "네, 직거래 가능합니다! 강남역 어떠세요?",  time: "방금",     unread: 2, price: 85000,  isSelling: false },
  { id: 2, user: "피카덕후",      avatar: "⚡",  card: "피카츄 ex SAR",    lastMsg: "사진 더 보내주실 수 있나요?",              time: "5분 전",   unread: 0, price: 42000,  isSelling: true  },
  { id: 3, user: "카드마스터K",   avatar: "🌀", card: "뮤츠 ex UR",       lastMsg: "감사합니다! 잘 받았어요 🙏",               time: "1시간 전", unread: 0, price: 120000, isSelling: false },
  { id: 4, user: "조로팬클럽",   avatar: "⚔️", card: "롤로노아 조로 SR",  lastMsg: "가격 좀 깎아주실 수 있나요?",             time: "어제",     unread: 1, price: 67000,  isSelling: false },
  { id: 5, user: "불꽃트레이너", avatar: "🔥",  card: "에이스 UR",         lastMsg: "안전거래로 진행하겠습니다",                time: "어제",     unread: 0, price: 130000, isSelling: true  },
  { id: 6, user: "냉동빔",        avatar: "💧", card: "꼬부기 ex SR",      lastMsg: "택배 발송했습니다. 운송장번호 드릴게요",   time: "2일 전",   unread: 0, price: 55000,  isSelling: true  },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
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

  // 채팅방 나가기 선택 모드
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // 알림 토글 — localStorage 저장
  const [notifMsg, setNotifMsg] = useState(true);
  const [notifVibrate, setNotifVibrate] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("chat_settings");
    if (saved) {
      const p = JSON.parse(saved);
      setNotifMsg(p.notifMsg ?? true);
      setNotifVibrate(p.notifVibrate ?? true);
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

  function enterSelectMode() {
    setShowSettings(false);
    setSelectedIds(new Set());
    setSelectMode(true);
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function leaveSelected() {
    setChats((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
    setShowLeaveConfirm(false);
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
        {selectMode ? (
          <>
            <button
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
              className="text-sm text-gray-500"
              style={{ fontWeight: 500 }}
            >
              취소
            </button>
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
              {selectedIds.size > 0 ? `${selectedIds.size}개 선택됨` : "채팅방 선택"}
            </span>
            <div className="w-8" />
          </>
        ) : (
          <>
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

            {/* ⚙️ 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="p-1 -mr-1"
              >
                <span className="text-xl">⚙️</span>
              </button>

              {showSettings && (
                <>
                  {/* 외부 클릭 닫기 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">

                    {/* 전체 읽음 */}
                    <button
                      className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100 active:bg-gray-50"
                      onClick={markAllRead}
                      disabled={totalUnread === 0}
                    >
                      <span
                        className="text-sm"
                        style={{ fontWeight: 500, color: totalUnread > 0 ? "#111827" : "#9ca3af" }}
                      >
                        전체 읽음 처리
                      </span>
                      {totalUnread > 0 && (
                        <span
                          className="text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
                          style={{ background: PRIMARY, fontWeight: 700 }}
                        >
                          {totalUnread}
                        </span>
                      )}
                    </button>

                    {/* 알림 토글 */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                      <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>메시지 알림</span>
                      <Toggle on={notifMsg} onToggle={toggleNotifMsg} />
                    </div>

                    {/* 진동 토글 */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                      <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>진동</span>
                      <Toggle on={notifVibrate} onToggle={toggleNotifVibrate} />
                    </div>

                    {/* 채팅방 나가기 */}
                    <button
                      className="w-full flex items-center px-4 py-3.5 active:bg-red-50"
                      onClick={enterSelectMode}
                    >
                      <span className="text-sm" style={{ fontWeight: 600, color: PRIMARY }}>
                        채팅방 나가기
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </header>

      {/* 필터 탭 */}
      {!selectMode && (
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
      )}

      {/* 채팅 목록 */}
      <div className="divide-y divide-gray-50">
        {filtered.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 cursor-pointer"
            onClick={() => {
              if (selectMode) { toggleSelect(chat.id); return; }
              router.push(`/chat/${chat.id}`);
            }}
          >
            {/* 선택 모드 체크박스 */}
            {selectMode && (
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  borderColor: selectedIds.has(chat.id) ? PRIMARY : "#d1d5db",
                  background: selectedIds.has(chat.id) ? PRIMARY : "transparent",
                }}
              >
                {selectedIds.has(chat.id) && (
                  <span className="text-white text-xs" style={{ fontWeight: 700 }}>✓</span>
                )}
              </div>
            )}

            {/* 아바타 */}
            <div className="relative shrink-0">
              <div
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl transition-opacity"
                style={{ opacity: selectMode && selectedIds.has(chat.id) ? 0.5 : 1 }}
              >
                {chat.avatar}
              </div>
              {!selectMode && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 text-white text-[9px] px-1 py-0.5 rounded-full leading-none"
                  style={{ background: chat.isSelling ? "#3b82f6" : "#10b981", fontWeight: 700 }}
                >
                  {chat.isSelling ? "판매" : "구매"}
                </span>
              )}
            </div>

            {/* 내용 */}
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
                {!selectMode && chat.unread > 0 && (
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

      {filtered.length === 0 && !selectMode && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">💬</span>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>아직 채팅이 없어요</p>
          <p className="text-gray-400 text-xs mt-1" style={{ fontWeight: 400 }}>마음에 드는 카드를 찾아 문의해보세요</p>
        </div>
      )}

      {/* 선택 모드 하단 액션 바 */}
      {selectMode && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-4 py-3 z-30">
          <button
            className="w-full py-3.5 rounded-2xl text-sm transition-all"
            style={{
              background: selectedIds.size > 0 ? PRIMARY : "#f3f4f6",
              color: selectedIds.size > 0 ? "#fff" : "#9ca3af",
              fontWeight: 700,
            }}
            disabled={selectedIds.size === 0}
            onClick={() => setShowLeaveConfirm(true)}
          >
            {selectedIds.size > 0 ? `${selectedIds.size}개 채팅방 나가기` : "채팅방을 선택하세요"}
          </button>
        </div>
      )}

      {/* 나가기 확인 다이얼로그 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-8">
          <div className="w-full bg-white rounded-3xl overflow-hidden">
            <div className="px-6 pt-7 pb-5 text-center">
              <p className="text-base text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                채팅방 {selectedIds.size}개를 나가시겠어요?
              </p>
              <p className="text-sm text-gray-400 leading-relaxed" style={{ fontWeight: 400 }}>
                나가면 대화 내용이 모두 삭제되고<br />목록에서 사라져요.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                className="flex-1 py-4 text-sm text-gray-500 border-r border-gray-100"
                style={{ fontWeight: 500 }}
                onClick={() => setShowLeaveConfirm(false)}
              >
                취소
              </button>
              <button
                className="flex-1 py-4 text-sm"
                style={{ fontWeight: 700, color: PRIMARY }}
                onClick={leaveSelected}
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭 */}
      {!selectMode && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100">
          <div className="grid grid-cols-5 h-14">
            {(
              [
                { Icon: Home,          label: "홈",   href: "/"        },
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
                  className="flex flex-col items-center justify-center gap-0.5 transition-colors relative"
                  style={{ color: isActive ? "#111111" : "#9ca3af" }}
                >
                  <div className="relative">
                    <tab.Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                    {tab.label === "채팅" && totalUnread > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-[7px] h-[7px] rounded-full"
                        style={{ background: PRIMARY }}
                      />
                    )}
                  </div>
                  <span className="text-[10px]" style={{ fontWeight: isActive ? 700 : 400 }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="h-20" />
    </div>
  );
}
