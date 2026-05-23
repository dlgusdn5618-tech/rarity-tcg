"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const NOTICES = [
  {
    id: 1,
    tag: "공지",
    tagColor: PRIMARY,
    title: "레어리티 서비스 이용약관 개정 안내",
    preview: "2026년 6월 1일부로 이용약관 일부가 개정됩니다. 주요 변경 사항을 확인해주세요.",
    date: "2026.05.20",
    isNew: true,
    body: `안녕하세요, 레어리티입니다.\n\n2026년 6월 1일부로 서비스 이용약관 일부가 개정됩니다.\n\n주요 변경 사항은 다음과 같습니다.\n\n1. 안전거래 수수료 정책 명확화\n2. 가품 판매 시 제재 기준 강화\n3. 분쟁 중재 처리 기간 단축 (7일 → 3일)\n\n변경된 약관은 시행일 이후 자동 적용됩니다.\n이용에 참고해 주시기 바랍니다.\n\n감사합니다.`,
  },
  {
    id: 2,
    tag: "이벤트",
    tagColor: "#f59e0b",
    title: "첫 거래 완료 포인트 2배 적립 이벤트",
    preview: "5월 한 달간 첫 거래를 완료하시면 포인트를 2배로 드립니다!",
    date: "2026.05.15",
    isNew: true,
    body: `레어리티 포인트 2배 적립 이벤트를 진행합니다!\n\n기간: 2026년 5월 1일 ~ 5월 31일\n대상: 이벤트 기간 중 첫 거래 완료 회원\n혜택: 거래금액의 2% 포인트 적립 (기존 1%)\n\n포인트는 거래 완료 후 자동으로 지급됩니다.\n많은 참여 부탁드립니다!`,
  },
  {
    id: 3,
    tag: "업데이트",
    tagColor: "#10b981",
    title: "교환 제안 기능 출시 안내",
    preview: "이제 원하는 카드를 직접 교환 제안할 수 있어요. 새로운 교환 기능을 이용해보세요.",
    date: "2026.05.10",
    isNew: false,
    body: `새로운 교환 제안 기능이 출시되었습니다!\n\n내가 가진 카드와 원하는 카드를 교환할 수 있는 기능이에요.\n\n사용 방법\n1. 상대방의 카드 상세 페이지에서 "교환 제안" 버튼 클릭\n2. 내 카드 중 교환할 카드 선택\n3. 상대방이 수락하면 안전거래로 진행\n\n교환 거래도 기존 안전거래 정책이 동일하게 적용됩니다.`,
  },
  {
    id: 4,
    tag: "공지",
    tagColor: PRIMARY,
    title: "개인정보 처리방침 변경 안내",
    preview: "개인정보 처리방침이 일부 변경되었습니다. 내용을 확인해주세요.",
    date: "2026.04.25",
    isNew: false,
    body: `개인정보 처리방침이 2026년 5월 1일부로 변경됩니다.\n\n주요 변경 내용:\n- 수집 항목에 거래 이력 추가\n- 보관 기간 명시 강화\n- 제3자 제공 내용 갱신\n\n자세한 내용은 앱 설정 > 이용약관에서 확인하실 수 있습니다.`,
  },
];

export default function NoticesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const selected = NOTICES.find((n) => n.id === selectedId);
  const newCount = NOTICES.filter((n) => n.isNew && !readIds.has(n.id)).length;

  function openNotice(id: number) {
    setSelectedId(id);
    setReadIds((prev) => new Set([...prev, id]));
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-white max-w-sm mx-auto">
        <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
          <button onClick={() => setSelectedId(null)} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
          <h1 className="flex-1 text-base text-gray-900 truncate" style={{ fontWeight: 700 }}>공지사항</h1>
        </header>

        <div className="px-5 pt-5 pb-10">
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ background: selected.tagColor, fontWeight: 600 }}
          >
            {selected.tag}
          </span>
          <h2 className="text-base text-gray-900 mt-2 leading-snug" style={{ fontWeight: 700 }}>
            {selected.title}
          </h2>
          <p className="text-xs text-gray-400 mt-1 mb-5" style={{ fontWeight: 400 }}>{selected.date}</p>
          <div className="h-px bg-gray-100 mb-5" />
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ fontWeight: 400 }}>
            {selected.body}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>
          공지사항
          {newCount > 0 && (
            <span
              className="ml-2 text-white text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: PRIMARY, fontWeight: 700 }}
            >
              {newCount}
            </span>
          )}
        </h1>
      </header>

      <div className="bg-white mt-2 divide-y divide-gray-50">
        {NOTICES.map((notice) => {
          const isUnread = notice.isNew && !readIds.has(notice.id);
          return (
            <button
              key={notice.id}
              className="w-full text-left px-4 py-4 active:bg-gray-50"
              onClick={() => openNotice(notice.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0"
                      style={{ background: notice.tagColor, fontWeight: 600 }}
                    >
                      {notice.tag}
                    </span>
                    {isUnread && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "#fef2f2", color: PRIMARY, fontWeight: 600 }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm text-gray-900 leading-snug"
                    style={{ fontWeight: isUnread ? 700 : 500 }}
                  >
                    {notice.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1" style={{ fontWeight: 400 }}>
                    {notice.preview}
                  </p>
                  <p className="text-xs text-gray-300 mt-1.5" style={{ fontWeight: 400 }}>{notice.date}</p>
                </div>
                <span className="text-gray-300 text-lg shrink-0">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
