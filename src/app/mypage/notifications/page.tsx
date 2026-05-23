"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

type ToggleKeys =
  | "chat" | "tradeStatus" | "priceOffer"
  | "newCard" | "event" | "appUpdate";

const SECTIONS = [
  {
    section: "거래 알림",
    items: [
      { key: "chat" as ToggleKeys,        label: "채팅 메시지",      desc: "새 메시지가 오면 알려드려요"    },
      { key: "tradeStatus" as ToggleKeys, label: "거래 상태 변경",    desc: "거래가 진행될 때마다 알려드려요" },
      { key: "priceOffer" as ToggleKeys,  label: "가격 제안",         desc: "새 가격 제안이 오면 알려드려요"  },
    ],
  },
  {
    section: "마케팅 알림",
    items: [
      { key: "newCard" as ToggleKeys,    label: "찜 카드 가격 변동", desc: "찜한 카드 가격이 바뀌면 알려드려요" },
      { key: "event" as ToggleKeys,      label: "이벤트 · 혜택",     desc: "쿠폰, 포인트 혜택 소식"           },
      { key: "appUpdate" as ToggleKeys,  label: "앱 업데이트",       desc: "새로운 기능 안내"                  },
    ],
  },
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

const DEFAULT_SETTINGS: Record<ToggleKeys, boolean> = {
  chat: true, tradeStatus: true, priceOffer: true,
  newCard: true, event: false, appUpdate: false,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("notif_settings");
    if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
  }, []);

  function toggle(key: ToggleKeys) {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notif_settings", JSON.stringify(next));
      return next;
    });
  }

  const allOn = Object.values(settings).every(Boolean);

  function toggleAll() {
    const next = Object.fromEntries(
      Object.keys(settings).map((k) => [k, !allOn])
    ) as Record<ToggleKeys, boolean>;
    setSettings(next);
    localStorage.setItem("notif_settings", JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>알림 설정</h1>
      </header>

      {/* 전체 알림 */}
      <div className="bg-white mx-0 mt-2 px-4 py-4 flex items-center justify-between border-b border-gray-50">
        <div>
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>전체 알림</p>
          <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
            {allOn ? "모든 알림이 켜져 있어요" : "일부 알림이 꺼져 있어요"}
          </p>
        </div>
        <Toggle on={allOn} onToggle={toggleAll} />
      </div>

      {/* 섹션별 토글 */}
      {SECTIONS.map((group) => (
        <div key={group.section} className="bg-white mt-2">
          <p className="px-4 pt-4 pb-1 text-xs text-gray-400" style={{ fontWeight: 600 }}>
            {group.section}
          </p>
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between px-4 py-4"
              >
                <div>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{item.desc}</p>
                </div>
                <Toggle on={settings[item.key]} onToggle={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="h-10" />
    </div>
  );
}
