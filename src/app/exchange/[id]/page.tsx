"use client";

import { use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, CheckCircle2, Clock, Package, AlertTriangle, Users, Lock, Camera, Truck, type LucideIcon } from "lucide-react";

const PRIMARY = "#D62828";

const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  SAR: { bg: "#FFFBEB", color: "#92400E" },
  UR:  { bg: "#F3EEFF", color: "#6D28D9" },
  SR:  { bg: "#FFF0F0", color: "#B91C1C" },
  R:   { bg: "#F0F9FF", color: "#0369A1" },
};

type ExchangeStep = {
  id: string;
  label: string;
  desc: string;
  done: boolean;
  active: boolean;
};

const FACE_STEPS = (currentStep: number): ExchangeStep[] => [
  { id: "propose",  label: "교환 제안",    desc: "상대방에게 교환 제안을 보냈어요",              done: currentStep > 0, active: currentStep === 0 },
  { id: "accept",   label: "제안 수락",    desc: "상대방이 교환을 수락하면 연락처를 공유해요",    done: currentStep > 1, active: currentStep === 1 },
  { id: "meetup",   label: "만남 조율",    desc: "채팅으로 장소와 시간을 조율하세요",             done: currentStep > 2, active: currentStep === 2 },
  { id: "exchange", label: "직접 교환",    desc: "공공장소에서 실물 확인 후 교환하세요",          done: currentStep > 3, active: currentStep === 3 },
  { id: "complete", label: "교환 완료",    desc: "교환이 완료됐어요. 서로 리뷰를 남겨보세요",    done: currentStep > 4, active: currentStep === 4 },
];

const ESCROW_STEPS = (currentStep: number): ExchangeStep[] => [
  { id: "propose",  label: "교환 제안",    desc: "상대방에게 교환 제안을 보냈어요",                    done: currentStep > 0, active: currentStep === 0 },
  { id: "accept",   label: "제안 수락",    desc: "상대방이 교환을 수락했어요",                          done: currentStep > 1, active: currentStep === 1 },
  { id: "deposit",  label: "보증금 예치",  desc: "양측이 카드 가액만큼 보증금을 예치해요 (PG 연동 예정)", done: currentStep > 2, active: currentStep === 2 },
  { id: "ship",     label: "카드 발송",    desc: "72시간 내에 카드를 발송하고 사진을 등록해요",          done: currentStep > 3, active: currentStep === 3 },
  { id: "receive",  label: "수령 확인",    desc: "상대방 카드 수령 후 앱에서 확인 버튼을 눌러요",        done: currentStep > 4, active: currentStep === 4 },
  { id: "refund",   label: "보증금 환급",  desc: "양측 수령 확인 시 보증금이 전액 환급돼요",             done: currentStep > 5, active: currentStep === 5 },
];

type Params = { id: string };

// ──────────────────────────────────────────────
// 교환 상태판 데이터 정의
// ──────────────────────────────────────────────
type BoardStateData = {
  Icon: LucideIcon;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  headline: string;
  myTodos: { done: boolean; text: string }[];
  partnerTodos: { done: boolean; text: string }[];
  deadline: string | null;
  deadlineUrgent: boolean;
  evidence: string[];
  nextStep: string;
  alertText?: string;
};

function getBoardState(step: number, isFace: boolean): BoardStateData {
  if (isFace) {
    const map: BoardStateData[] = [
      {
        Icon: Clock, statusLabel: "제안 보냄", statusColor: "#6b7280", statusBg: "#f3f4f6",
        headline: "교환 제안을 보냈어요. 상대방이 확인하면 알림이 와요.",
        myTodos:      [{ done: true,  text: "교환 제안 전송" }],
        partnerTodos: [{ done: false, text: "교환 제안 확인 및 수락" }],
        deadline: null, deadlineUrgent: false, evidence: [],
        nextStep: "상대방 수락 후 채팅으로 만남 장소·시간을 조율하세요",
      },
      {
        Icon: Clock, statusLabel: "수락 대기", statusColor: "#d97706", statusBg: "#fffbeb",
        headline: "지금은 상대방의 수락을 기다리는 단계예요.",
        myTodos:      [{ done: true, text: "교환 제안 전송" }],
        partnerTodos: [{ done: false, text: "교환 제안 확인 및 수락" }],
        deadline: null, deadlineUrgent: false, evidence: [],
        nextStep: "수락 후 채팅으로 만남 장소·시간을 조율하세요",
      },
      {
        Icon: Users, statusLabel: "만남 조율 중", statusColor: "#2563eb", statusBg: "#eff6ff",
        headline: "채팅으로 만날 장소와 시간을 조율하고 있어요.",
        myTodos:      [{ done: true, text: "교환 수락 완료" }, { done: false, text: "채팅으로 장소·시간 확정" }],
        partnerTodos: [{ done: false, text: "채팅으로 장소·시간 확정" }],
        deadline: null, deadlineUrgent: false, evidence: [],
        nextStep: "장소·시간 확정 후 공공장소에서 실물을 확인하고 교환하세요",
      },
      {
        Icon: Users, statusLabel: "직접 교환", statusColor: "#16a34a", statusBg: "#f0fdf4",
        headline: "공공장소에서 실물 카드를 직접 확인하고 교환하세요.",
        myTodos:      [{ done: false, text: "카드 실물 육안 확인" }, { done: false, text: "교환 후 앱에서 완료 확인" }],
        partnerTodos: [{ done: false, text: "카드 실물 육안 확인" }, { done: false, text: "교환 후 앱에서 완료 확인" }],
        deadline: null, deadlineUrgent: false, evidence: [],
        nextStep: "양쪽 완료 확인 후 서로 리뷰를 남기면 교환이 종료돼요",
      },
      {
        Icon: CheckCircle2, statusLabel: "교환 완료", statusColor: "#10b981", statusBg: "#f0fdf4",
        headline: "교환이 완료됐어요. 서로 리뷰를 남겨주세요.",
        myTodos:      [{ done: true, text: "교환 완료" }],
        partnerTodos: [{ done: true, text: "교환 완료" }],
        deadline: null, deadlineUrgent: false, evidence: [],
        nextStep: "리뷰를 남기면 상대방 신뢰 지수에 반영돼요",
      },
    ];
    return map[Math.min(step, map.length - 1)];
  }

  // 보증금 방식
  const map: BoardStateData[] = [
    {
      Icon: Clock, statusLabel: "제안 보냄", statusColor: "#6b7280", statusBg: "#f3f4f6",
      headline: "교환 제안을 보냈어요. 상대방이 확인하면 알림이 와요.",
      myTodos:      [{ done: true,  text: "교환 제안 전송" }],
      partnerTodos: [{ done: false, text: "교환 제안 확인 및 수락" }],
      deadline: "7일 내 미수락 시 자동 취소", deadlineUrgent: false, evidence: [],
      nextStep: "상대방 수락 후 양쪽 보증금 예치 단계로 넘어가요",
    },
    {
      Icon: Clock, statusLabel: "수락 대기", statusColor: "#d97706", statusBg: "#fffbeb",
      headline: "지금은 상대방의 수락을 기다리는 단계예요.",
      myTodos:      [{ done: true,  text: "교환 제안 전송" }],
      partnerTodos: [{ done: false, text: "교환 제안 확인 및 수락" }],
      deadline: null, deadlineUrgent: false, evidence: [],
      nextStep: "수락 후 양쪽 보증금 예치 단계로 넘어가요",
    },
    {
      Icon: Package, statusLabel: "보증금 예치 대기", statusColor: "#d97706", statusBg: "#fffbeb",
      headline: "카드 가액만큼 보증금을 예치해야 다음 단계로 넘어가요.",
      myTodos:      [{ done: false, text: "내 보증금 예치 (PG 연동 예정)" }],
      partnerTodos: [{ done: false, text: "상대방 보증금 예치" }],
      deadline: "2026.06.02 23:59", deadlineUrgent: false, evidence: [],
      nextStep: "양쪽 예치 완료 후 72시간 내 카드를 발송해야 해요",
    },
    {
      Icon: Truck, statusLabel: "발송 대기", statusColor: "#2563eb", statusBg: "#eff6ff",
      headline: "72시간 내에 카드를 발송하고 운송장 번호와 사진을 등록해야 해요.",
      myTodos: [
        { done: true,  text: "보증금 예치 완료" },
        { done: false, text: "카드 발송 후 운송장 번호 등록" },
        { done: false, text: "발송 사진 첨부 (앞면·포장·운송장)" },
      ],
      partnerTodos: [
        { done: true,  text: "보증금 예치 완료" },
        { done: false, text: "카드 발송 대기 중" },
      ],
      deadline: "2026.06.02 23:59", deadlineUrgent: true,
      evidence: ["발송 사진 (앞면, 포장 상태)", "운송장 번호 사진"],
      nextStep: "양쪽 발송 확인 후 수령 확인 단계로 넘어가요",
      alertText: "기한 내 미발송 시 운영정책에 따라 보증금 처리가 검토될 수 있어요",
    },
    {
      Icon: Package, statusLabel: "수령 확인 대기", statusColor: "#2563eb", statusBg: "#eff6ff",
      headline: "상대방 카드가 도착했다면 앱에서 수령 확인 버튼을 눌러주세요.",
      myTodos: [
        { done: true,  text: "카드 발송 완료" },
        { done: false, text: "카드 수령 후 앱에서 수령 확인" },
      ],
      partnerTodos: [
        { done: true,  text: "카드 발송 완료" },
        { done: false, text: "카드 수령 후 앱에서 수령 확인" },
      ],
      deadline: "2026.06.05 23:59", deadlineUrgent: false,
      evidence: ["수령 확인 버튼 입력"],
      nextStep: "양쪽 수령 확인 후 보증금이 전액 환급돼요",
    },
    {
      Icon: CheckCircle2, statusLabel: "교환 완료", statusColor: "#10b981", statusBg: "#f0fdf4",
      headline: "교환이 완료됐어요. 보증금이 전액 환급됩니다.",
      myTodos:      [{ done: true, text: "교환 완료 및 보증금 환급" }],
      partnerTodos: [{ done: true, text: "교환 완료 및 보증금 환급" }],
      deadline: null, deadlineUrgent: false, evidence: [],
      nextStep: "리뷰를 남기면 상대방 신뢰 지수에 반영돼요",
    },
  ];
  return map[Math.min(step, map.length - 1)];
}

function StatusBoard({
  boardState, partnerName,
}: {
  boardState: BoardStateData;
  partnerName: string;
}) {
  const { Icon } = boardState;

  return (
    <div className="bg-white px-4 py-4">

      {/* 상태 레이블 + 기한 칩 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: boardState.statusBg }}
          >
            <Icon size={14} color={boardState.statusColor} strokeWidth={2} />
          </div>
          <span className="text-sm" style={{ color: boardState.statusColor, fontWeight: 700 }}>
            {boardState.statusLabel}
          </span>
        </div>
        {boardState.deadline && (
          <span
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: boardState.deadlineUrgent ? "#fff5f5" : "#f3f4f6",
              color:      boardState.deadlineUrgent ? PRIMARY   : "#6b7280",
              fontWeight: 600,
            }}
          >
            <Clock size={9} strokeWidth={2.5} />
            {boardState.deadlineUrgent ? "기한 임박" : "기한 있음"}
          </span>
        )}
      </div>

      {/* 헤드라인 */}
      <p className="text-[13px] text-gray-700 mb-4" style={{ fontWeight: 400, lineHeight: 1.65 }}>
        {boardState.headline}
      </p>

      {/* 체크리스트 카드 */}
      <div className="rounded-xl overflow-hidden border border-gray-100 mb-3">

        {/* 내 할 일 */}
        <div className="px-3 pt-3 pb-2.5 border-b border-gray-50">
          <p className="text-[9px] text-gray-400 mb-2"
            style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            내가 할 일
          </p>
          <div className="flex flex-col gap-1.5">
            {boardState.myTodos.map((todo, i) => (
              <div key={i} className="flex items-center gap-2">
                {todo.done
                  ? <CheckCircle2 size={13} color="#10b981" strokeWidth={2.5} className="shrink-0" />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                    </span>
                }
                <span
                  className="text-xs"
                  style={{
                    color: todo.done ? "#9ca3af" : "#111",
                    fontWeight: todo.done ? 400 : 600,
                    textDecoration: todo.done ? "line-through" : "none",
                  }}
                >
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 상대방 할 일 */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-[9px] text-gray-400 mb-2"
            style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {partnerName} 할 일
          </p>
          <div className="flex flex-col gap-1.5">
            {boardState.partnerTodos.map((todo, i) => (
              <div key={i} className="flex items-center gap-2">
                {todo.done
                  ? <CheckCircle2 size={13} color="#10b981" strokeWidth={2.5} className="shrink-0" />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 shrink-0" />
                }
                <span
                  className="text-xs text-gray-500"
                  style={{ fontWeight: todo.done ? 400 : 400, color: todo.done ? "#9ca3af" : "#6b7280" }}
                >
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 필요한 증빙 */}
      {boardState.evidence.length > 0 && (
        <div
          className="flex flex-col gap-1.5 rounded-xl px-3 py-2.5 border border-gray-100 mb-3"
          style={{ background: "#f9fafb" }}
        >
          <p className="text-[9px] text-gray-400 mb-0.5"
            style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            필요한 증빙
          </p>
          {boardState.evidence.map((e, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Camera size={11} color="#6b7280" strokeWidth={1.5} className="shrink-0" />
              <span className="text-xs text-gray-600" style={{ fontWeight: 400 }}>{e}</span>
            </div>
          ))}
        </div>
      )}

      {/* 기한 (날짜 형식) */}
      {boardState.deadline && boardState.deadline.includes(".") && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
          style={{ background: boardState.deadlineUrgent ? "#fff5f5" : "#f9fafb" }}
        >
          <Clock size={12} color={boardState.deadlineUrgent ? PRIMARY : "#9ca3af"} strokeWidth={2} className="shrink-0" />
          <p className="text-[11px]"
            style={{ color: boardState.deadlineUrgent ? PRIMARY : "#6b7280", fontWeight: boardState.deadlineUrgent ? 600 : 400 }}>
            {boardState.deadline}까지
          </p>
        </div>
      )}

      {/* 경고 */}
      {boardState.alertText && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: "#fffbeb" }}>
          <AlertTriangle size={12} color="#d97706" strokeWidth={2} className="shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700" style={{ fontWeight: 400, lineHeight: 1.55 }}>
            {boardState.alertText}
          </p>
        </div>
      )}

      {/* 다음 단계 */}
      <div className="flex items-start gap-2 pt-3 border-t border-gray-50">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-[6px]" />
        <p className="text-[11px] text-gray-400" style={{ fontWeight: 400, lineHeight: 1.55 }}>
          다음 단계: {boardState.nextStep}
        </p>
      </div>
    </div>
  );
}

function ExchangeDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") ?? "face";
  const myCardId = searchParams.get("myCard") ?? "m1";

  const isFace = method === "face";
  const currentStep = 1;

  const steps = isFace ? FACE_STEPS(currentStep) : ESCROW_STEPS(currentStep);
  const boardState = getBoardState(currentStep, isFace);

  const myCards: Record<string, { name: string; emoji: string; grade: string; value: number }> = {
    m1: { name: "피카츄 ex", emoji: "⚡", grade: "SAR", value: 280000 },
    m2: { name: "리자몽 ex", emoji: "🔥", grade: "SR",  value: 85000  },
    m3: { name: "꼬부기 ex", emoji: "💧", grade: "SR",  value: 55000  },
    m4: { name: "뮤츠 ex",   emoji: "🌀", grade: "UR",  value: 120000 },
  };
  const myCard = myCards[myCardId] ?? myCards["m1"];

  const partner = { name: "포켓마스터", card: "리자몽 ex", emoji: "🔥", grade: "SR", value: 85000 };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto overflow-x-hidden">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>교환 진행</h1>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: isFace ? "#f0fdf4" : "#eff6ff", color: isFace ? "#10b981" : "#2563eb", fontWeight: 600 }}
        >
          <span className="flex items-center gap-1">
            {isFace
              ? <><Users size={11} strokeWidth={2} />직거래</>
              : <><Lock size={11} strokeWidth={2} />보증금</>
            }
          </span>
        </span>
      </header>

      {/* 교환 카드 요약 */}
      <div className="bg-white mx-0 mt-2 px-4 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          {(() => {
            const myChip = RARITY_CHIP[myCard.grade] ?? { bg: "#f8fafc", color: "#475569" };
            const ptChip = RARITY_CHIP[partner.grade] ?? { bg: "#f8fafc", color: "#475569" };
            return (<>
          <div className="flex-1 rounded-xl bg-gray-50 px-3 py-3 text-center">
            <div
              className="w-10 h-14 rounded-lg flex flex-col overflow-hidden mx-auto mb-1"
              style={{
                border: `1px solid ${myChip.color}38`,
                background: `linear-gradient(175deg, ${myChip.color}12 0%, #f6f6f6 55%)`,
              }}
            >
              <div className="h-[3px] w-full shrink-0" style={{ background: myChip.color }} />
              <div className="flex-1 flex items-center justify-center p-1">
                <div style={{
                  width: "100%", height: "100%", borderRadius: 2,
                  border: `1px solid ${myChip.color}22`,
                  background: `radial-gradient(ellipse at 50% 30%, ${myChip.color}18, transparent 70%)`,
                }} />
              </div>
              <div className="py-0.5 text-center" style={{ background: `${myChip.color}15`, borderTop: `1px solid ${myChip.color}20` }}>
                <span className="text-[7px]" style={{ color: myChip.color, fontWeight: 700 }}>{myCard.grade}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>내 카드</p>
            <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{myCard.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
              {myCard.value.toLocaleString()}원
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-gray-300 text-xl">⇄</span>
          </div>
          <div className="flex-1 rounded-xl bg-gray-50 px-3 py-3 text-center">
            <div
              className="w-10 h-14 rounded-lg flex flex-col overflow-hidden mx-auto mb-1"
              style={{
                border: `1px solid ${ptChip.color}38`,
                background: `linear-gradient(175deg, ${ptChip.color}12 0%, #f6f6f6 55%)`,
              }}
            >
              <div className="h-[3px] w-full shrink-0" style={{ background: ptChip.color }} />
              <div className="flex-1 flex items-center justify-center p-1">
                <div style={{
                  width: "100%", height: "100%", borderRadius: 2,
                  border: `1px solid ${ptChip.color}22`,
                  background: `radial-gradient(ellipse at 50% 30%, ${ptChip.color}18, transparent 70%)`,
                }} />
              </div>
              <div className="py-0.5 text-center" style={{ background: `${ptChip.color}15`, borderTop: `1px solid ${ptChip.color}20` }}>
                <span className="text-[7px]" style={{ color: ptChip.color, fontWeight: 700 }}>{partner.grade}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>상대 카드</p>
            <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{partner.card}</p>
            <p className="text-[11px] mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
              {partner.value.toLocaleString()}원
            </p>
          </div>
          </>);
          })()}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>상대방</p>
          <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>{partner.name}</p>
        </div>
      </div>

      {/* 교환 상태판 */}
      <div className="mt-2 border-b border-gray-50">
        <StatusBoard boardState={boardState} partnerName={partner.name} />
      </div>

      {/* 교환 조건 확정서 진입 */}
      <div className="bg-white mt-2 px-4 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>교환 조건 확정서</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>
            조율 중
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mb-3" style={{ fontWeight: 400 }}>
          카드 정보, 추가금, 배송 조건을 확정하면 분쟁 시 기준이 됩니다.
        </p>
        <button
          onClick={() => router.push(`/exchange/${id}/agreement?status=DRAFT`)}
          className="w-full py-2.5 rounded-xl text-xs border"
          style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
        >
          확정서 작성하기
        </button>
      </div>

      {/* 단계별 타임라인 */}
      <div className="bg-white mt-2 px-4 py-4">
        <p className="text-xs text-gray-400 mb-4" style={{ fontWeight: 600 }}>단계별 현황</p>
        <div className="relative">
          {/* 세로선 */}
          <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-gray-100" />
          <div className="flex flex-col gap-6">
            {steps.map((s) => (
              <div key={s.id} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{
                    background: s.done ? PRIMARY : s.active ? "#fff5f5" : "#f3f4f6",
                    border: s.active ? `2px solid ${PRIMARY}` : "2px solid transparent",
                  }}
                >
                  {s.done ? (
                    <CheckCircle2 size={16} color="white" strokeWidth={2.5} />
                  ) : s.active ? (
                    <Clock size={14} color={PRIMARY} strokeWidth={2} />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p
                    className="text-sm"
                    style={{
                      color: s.done ? "#111" : s.active ? PRIMARY : "#9ca3af",
                      fontWeight: s.active || s.done ? 700 : 400,
                    }}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 보증금 에스크로 안내 (보증금 방식만) */}
      {!isFace && (
        <div className="bg-white mt-2 px-4 py-4">
          <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 600 }}>에스크로 보증금 현황</p>
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package size={14} color="#6b7280" strokeWidth={1.5} />
                <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>내 보증금</p>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "#fffbeb", color: "#d97706", fontWeight: 600 }}
              >
                예치 대기
              </span>
            </div>
            <p className="text-base" style={{ color: PRIMARY, fontWeight: 800 }}>
              {myCard.value.toLocaleString()}원
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
              카드 가액 기준 · 수령 확인 후 전액 환급
            </p>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fffbeb" }}>
            <AlertTriangle size={13} color="#d97706" strokeWidth={2} className="shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700" style={{ fontWeight: 400, lineHeight: 1.55 }}>
              교환 수락 후 <span style={{ fontWeight: 700 }}>72시간</span> 내에 발송하지 않으면, 보증금 처리는 운영정책과 증빙에 따라 검토됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 직거래 안전 안내 */}
      {isFace && (
        <div className="bg-white mt-2 px-4 py-4">
          <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 600 }}>직거래 안전 수칙</p>
          {[
            "경찰청, 지하철역, 은행 등 공공장소에서 교환하세요",
            "카드를 직접 육안으로 확인한 뒤에 교환하세요",
            "교환 완료 후에는 취소·반품이 불가합니다",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="text-[11px] w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5" style={{ fontWeight: 600 }}>
                {i + 1}
              </span>
              <p className="text-[11px] text-gray-500" style={{ fontWeight: 400 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* 안전거래 안내 */}
      <div className="mx-4 mt-2 mb-4 rounded-2xl px-4 py-3 border" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
        <div className="flex items-start gap-2">
          <Shield size={13} color="#9ca3af" strokeWidth={1.5} className="shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            레어리티는 P2P 중개 플랫폼입니다. 분쟁 발생 시 support@rarity.kr로 신고하시거나,
            경찰청 112에 연락하세요. 레어리티는 관련 증빙을 검토하여 처리를 지원합니다.
          </p>
        </div>
      </div>

      {/* 채팅 버튼 */}
      <div className="px-4 pb-8">
        <button
          onClick={() => router.push("/chat")}
          className="w-full py-3.5 rounded-2xl text-sm text-white"
          style={{ background: PRIMARY, fontWeight: 700 }}
        >
          {partner.name}와 채팅하기
        </button>
      </div>
    </div>
  );
}

function ExchangeDetailWrapper({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ExchangeDetailInner id={id} />
    </Suspense>
  );
}

export default function ExchangeDetailPage({ params }: { params: Promise<Params> }) {
  return <ExchangeDetailWrapper params={params} />;
}
