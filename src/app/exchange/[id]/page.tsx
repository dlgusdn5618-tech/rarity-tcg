"use client";

import { use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, CheckCircle2, Clock, Package, AlertTriangle, Users, Lock } from "lucide-react";

const PRIMARY = "#E53E3E";

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

function ExchangeDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") ?? "face";
  const myCardId = searchParams.get("myCard") ?? "m1";

  const isFace = method === "face";
  const currentStep = 1;

  const steps = isFace ? FACE_STEPS(currentStep) : ESCROW_STEPS(currentStep);
  const totalSteps = steps.length;
  const doneCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / totalSteps) * 100);

  const myCards: Record<string, { name: string; emoji: string; grade: string; value: number }> = {
    m1: { name: "피카츄 ex", emoji: "⚡", grade: "SAR", value: 280000 },
    m2: { name: "리자몽 ex", emoji: "🔥", grade: "SR",  value: 85000  },
    m3: { name: "꼬부기 ex", emoji: "💧", grade: "SR",  value: 55000  },
    m4: { name: "뮤츠 ex",   emoji: "🌀", grade: "UR",  value: 120000 },
  };
  const myCard = myCards[myCardId] ?? myCards["m1"];

  const partner = { name: "포켓마스터", card: "리자몽 ex", emoji: "🔥", grade: "SR", value: 85000 };

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

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
          <div className="flex-1 rounded-xl bg-gray-50 px-3 py-3 text-center">
            <div className="w-10 h-14 rounded-lg flex flex-col overflow-hidden mx-auto mb-1" style={{ border: "1.5px solid #e5e7eb", background: "#fff" }}>
              <div className="h-1.5 w-full shrink-0" style={{ background: "#E53E3E" }} />
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[7px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
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
            <div className="w-10 h-14 rounded-lg flex flex-col overflow-hidden mx-auto mb-1" style={{ border: "1.5px solid #e5e7eb", background: "#fff" }}>
              <div className="h-1.5 w-full shrink-0" style={{ background: "#E53E3E" }} />
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[7px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>상대 카드</p>
            <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{partner.card}</p>
            <p className="text-[11px] mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
              {partner.value.toLocaleString()}원
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>상대방</p>
          <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>{partner.name}</p>
        </div>
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

      {/* 진행도 */}
      <div className="bg-white mt-2 px-4 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>진행 상황</p>
          <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{progressPct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ background: PRIMARY, width: `${progressPct}%` }}
          />
        </div>
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
