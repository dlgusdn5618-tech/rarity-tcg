"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const CHAT_DATA: Record<string, {
  user: string;
  avatar: string;
  card: string;
  grade: string;
  price: number;
  cardEmoji: string;
  messages: { id: number; from: "me" | "them"; text: string; time: string }[];
}> = {
  "1": {
    user: "트레이너_루피",
    avatar: "👒",
    card: "리자몽 ex",
    grade: "SR",
    price: 85000,
    cardEmoji: "🔥",
    messages: [
      { id: 1, from: "them", text: "안녕하세요! 리자몽 ex 아직 판매 중인가요?", time: "오후 2:10" },
      { id: 2, from: "me",   text: "네, 아직 판매 중입니다 😊", time: "오후 2:11" },
      { id: 3, from: "them", text: "상태가 어느 정도인가요? 사진 더 보내주실 수 있나요?", time: "오후 2:12" },
      { id: 4, from: "me",   text: "S급이에요! 봉투에서 바로 꺼내서 슬리브에 보관했습니다. 사진 보내드릴게요!", time: "오후 2:13" },
      { id: 5, from: "them", text: "가격 조금 협의 가능할까요?", time: "오후 2:15" },
      { id: 6, from: "me",   text: "8만원까지는 괜찮습니다!", time: "오후 2:16" },
      { id: 7, from: "them", text: "네, 직거래 가능합니다! 강남역 어떠세요?", time: "오후 2:20" },
    ],
  },
  "2": {
    user: "피카덕후",
    avatar: "⚡",
    card: "피카츄 ex",
    grade: "SAR",
    price: 42000,
    cardEmoji: "⚡",
    messages: [
      { id: 1, from: "me",   text: "안녕하세요! 피카츄 ex SAR 판매 중이신가요?", time: "오후 11:05" },
      { id: 2, from: "them", text: "네 맞아요! A급 상태입니다", time: "오후 11:06" },
      { id: 3, from: "me",   text: "사진 더 보내주실 수 있나요?", time: "오후 11:10" },
    ],
  },
  "3": {
    user: "카드마스터K",
    avatar: "🌀",
    card: "뮤츠 ex",
    grade: "UR",
    price: 120000,
    cardEmoji: "🌀",
    messages: [
      { id: 1, from: "me",   text: "뮤츠 UR 구매 희망합니다!", time: "오전 10:00" },
      { id: 2, from: "them", text: "안전거래로 진행해드리겠습니다", time: "오전 10:05" },
      { id: 3, from: "me",   text: "입금했습니다!", time: "오전 10:30" },
      { id: 4, from: "them", text: "감사합니다! 잘 받았어요 🙏", time: "오전 10:35" },
    ],
  },
  "4": {
    user: "조로팬클럽",
    avatar: "⚔️",
    card: "롤로노아 조로",
    grade: "SR",
    price: 67000,
    cardEmoji: "⚔️",
    messages: [
      { id: 1, from: "them", text: "조로 SR 아직 있나요?", time: "어제 오후 3:00" },
      { id: 2, from: "me",   text: "네! A급입니다", time: "어제 오후 3:10" },
      { id: 3, from: "them", text: "가격 좀 깎아주실 수 있나요?", time: "어제 오후 3:15" },
    ],
  },
  "5": {
    user: "불꽃트레이너",
    avatar: "🔥",
    card: "에이스",
    grade: "UR",
    price: 130000,
    cardEmoji: "🔥",
    messages: [
      { id: 1, from: "me",   text: "에이스 UR 구매 문의드립니다", time: "어제 오후 1:00" },
      { id: 2, from: "them", text: "안전거래로 진행하겠습니다", time: "어제 오후 1:05" },
    ],
  },
  "6": {
    user: "냉동빔",
    avatar: "💧",
    card: "꼬부기 ex",
    grade: "SR",
    price: 55000,
    cardEmoji: "💧",
    messages: [
      { id: 1, from: "me",   text: "꼬부기 ex 구매했습니다!", time: "2일 전 오후 2:00" },
      { id: 2, from: "them", text: "택배 발송했습니다. 운송장번호 드릴게요", time: "2일 전 오후 4:00" },
    ],
  },
};

export default function ChatRoom({ params }: { params: { id: string } }) {
  const router = useRouter();
  const chat = CHAT_DATA[params.id] ?? CHAT_DATA["1"];

  const [messages, setMessages] = useState(chat.messages);
  const [input, setInput] = useState("");
  const [showOffer, setShowOffer] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "me",
        text,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  }

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100 shrink-0">
        <button onClick={() => router.push("/chat")} className="text-gray-700 text-xl">‹</button>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
          {chat.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-none" style={{ fontWeight: 700 }}>{chat.user}</p>
          <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>최근 접속 5분 전</p>
        </div>
        <button className="text-gray-400 text-xl">⋮</button>
      </header>

      {/* 거래 카드 배너 */}
      <div
        className="mx-4 mt-3 rounded-2xl p-3 flex items-center gap-3 shrink-0"
        style={{ background: "#fef9f9", border: "1px solid #fee2e2" }}
      >
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
          {chat.cardEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400" style={{ fontWeight: 500 }}>{chat.grade}</p>
          <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{chat.card}</p>
          <p className="text-sm" style={{ color: PRIMARY, fontWeight: 700 }}>
            {chat.price.toLocaleString()}원
          </p>
        </div>
        <button
          onClick={() => setShowOffer(true)}
          className="text-white text-xs px-3 py-2 rounded-xl shrink-0"
          style={{ background: PRIMARY, fontWeight: 600 }}
        >
          거래 제안
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.from === "me" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.from === "them" && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                {chat.avatar}
              </div>
            )}
            <div className={`flex flex-col ${msg.from === "me" ? "items-end" : "items-start"}`}>
              <div
                className="px-3.5 py-2.5 rounded-2xl max-w-[220px] text-sm leading-relaxed"
                style={
                  msg.from === "me"
                    ? { background: PRIMARY, color: "#fff", borderBottomRightRadius: "4px", fontWeight: 400 }
                    : { background: "#f3f4f6", color: "#111", borderBottomLeftRadius: "4px", fontWeight: 400 }
                }
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <button className="text-gray-400 text-xl shrink-0">+</button>
          <input
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            style={{ fontWeight: 400 }}
          />
          <button
            onClick={sendMessage}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: input.trim() ? PRIMARY : "#d1d5db",
            }}
          >
            <span className="text-white text-base">↑</span>
          </button>
        </div>
      </div>

      {/* 거래 제안 모달 */}
      {showOffer && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setShowOffer(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-base text-gray-900 mb-4" style={{ fontWeight: 700 }}>거래 방식 선택</h3>
            {[
              { icon: "📦", label: "택배 거래",      desc: "판매자 → 구매자 택배 발송" },
              { icon: "🚚", label: "반값 택배",       desc: "CJ대한통운 반값 택배 이용" },
              { icon: "🤝", label: "직거래",          desc: "직접 만나서 거래" },
              { icon: "🔒", label: "안전거래",        desc: "플랫폼 보호 · 수수료 3%" },
            ].map((opt) => (
              <button
                key={opt.label}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2 active:bg-gray-100"
                style={{ background: "#f9fafb" }}
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      from: "me",
                      text: `[거래 제안] ${opt.label}으로 거래 희망합니다 😊`,
                      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
                    },
                  ]);
                  setShowOffer(false);
                }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="text-left">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{opt.label}</p>
                  <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{opt.desc}</p>
                </div>
              </button>
            ))}
            <div className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
}
