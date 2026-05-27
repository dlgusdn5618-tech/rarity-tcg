"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ChevronRight, CheckCircle2, AlertTriangle, Users, Lock } from "lucide-react";

const PRIMARY = "#D62828";

type Method = "face" | "escrow" | null;

const MY_CARDS = [
  { id: "m1", name: "피카츄 ex", nameKo: "피카츄 ex", grade: "SAR", emoji: "⚡", value: 280000 },
  { id: "m2", name: "리자몽 ex", nameKo: "리자몽 ex", grade: "SR",  emoji: "🔥", value: 85000  },
  { id: "m3", name: "꼬부기 ex", nameKo: "꼬부기 ex", grade: "SR",  emoji: "💧", value: 55000  },
  { id: "m4", name: "뮤츠 ex",   nameKo: "뮤츠 ex",   grade: "UR",  emoji: "🌀", value: 120000 },
];

const FACE_TERMS = [
  { icon: "🤝", title: "P2P 직거래 방식", body: "본 교환은 이용자 간 직접 거래이며, 레어리티(주식회사 레어리티)는 거래 중개 플랫폼으로서 거래 당사자가 아닙니다." },
  { icon: "⚖️", title: "직거래 유의사항", body: "직거래는 이용자 간 직접 진행되는 방식입니다. 레어리티는 안전한 거래를 돕기 위해 기록과 신고 기능을 제공하며, 분쟁 발생 시 관련 증빙 확인을 지원합니다." },
  { icon: "📍", title: "공공장소 이용 권고", body: "교환 장소는 경찰청, 지하철역, 은행 등 CCTV가 설치된 공공장소를 권고합니다. 안전한 장소를 사전에 함께 정하고 진행하세요." },
  { icon: "🔍", title: "실물 확인 후 교환", body: "카드를 직접 눈으로 확인한 뒤 교환하세요. 교환 완료 후에는 취소·반품이 불가합니다. 감정서 및 케이스 상태를 반드시 현장에서 검증하시기 바랍니다." },
  { icon: "🚨", title: "사기 피해 신고 경로", body: "사기 피해 발생 시 경찰청 112 또는 사이버범죄 신고시스템(ECRM)에 즉시 신고하시기 바랍니다. 레어리티는 수사기관 요청 시 관련 로그를 적극 협조합니다." },
  { icon: "📣", title: "플랫폼 분쟁 신고", body: "거래 관련 분쟁이 발생하면 레어리티 고객센터(support@rarity.kr)에 신고하세요. 악성 이용자는 이용 제한 조치될 수 있습니다." },
];

const ESCROW_TERMS = [
  { icon: "🔐", title: "보증금 예치형 안전교환", body: "보증금 예치형 안전교환은 제휴 PG 연동을 전제로 한 정책 예시입니다. 레어리티는 보증금을 직접 보유하지 않으며, 연동된 결제 대행사가 중립적으로 관리합니다." },
  { icon: "💰", title: "보증금 = 카드 가액", body: "보증금 금액은 상대방 카드의 거래 예상가액과 동일합니다. 이는 발송 이행을 담보하기 위한 금액으로, 수수료나 거래 대금이 아닙니다." },
  { icon: "✅", title: "수령 확인 후 전액 환급", body: "상대방이 수령 확인을 완료하면 보증금 전액이 즉시 환급됩니다. 환급 소요 시간은 카드사·은행 정책에 따라 1~3 영업일이 걸릴 수 있습니다." },
  { icon: "⏱️", title: "72시간 발송 의무", body: "교환 수락 후 72시간(3일) 내에 카드를 발송해야 합니다. 정해진 발송 기한을 지키지 않거나 허위 발송이 확인되면, 보증금 처리는 운영정책과 증빙 자료에 따라 검토됩니다." },
  { icon: "📸", title: "발송 전 사진 등록 필수", body: "발송 전 카드 실물, 포장 상태, 운송장 번호가 포함된 사진을 앱에 등록해야 합니다. 미등록 시 발송 처리가 되지 않습니다." },
  { icon: "🏛️", title: "분쟁 처리 지원", body: "분쟁 발생 시 레어리티는 양측이 제출한 사진, 운송장, 채팅 기록 등 증빙 자료를 바탕으로 분쟁 처리를 지원합니다. 이의가 있는 경우 전자상거래분쟁조정위원회에 조정을 신청할 수 있습니다." },
  { icon: "📜", title: "분쟁 조정 안내", body: "분쟁 발생 시 한국소비자원 산하 전자상거래분쟁조정위원회에 조정을 신청할 수 있습니다. 관련 법령 및 운영정책에 따라 처리를 지원합니다." },
];

function ProposeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetCardId = searchParams.get("cardId") ?? "1";
  const targetCardName = searchParams.get("cardName") ?? "리자몽 ex";

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [method, setMethod] = useState<Method>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const terms = method === "face" ? FACE_TERMS : ESCROW_TERMS;
  const selectedCardData = MY_CARDS.find((c) => c.id === selectedCard);

  function handleSubmit() {
    if (!agreed || !selectedCard || !method) return;
    setSubmitted(true);
    setTimeout(() => {
      router.push(`/exchange/${targetCardId}?method=${method}&myCard=${selectedCard}`);
    }, 1800);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0fdf4" }}>
          <CheckCircle2 size={32} color="#10b981" strokeWidth={2} />
        </div>
        <p className="text-base text-gray-900 text-center" style={{ fontWeight: 700 }}>교환 제안을 보냈어요</p>
        <p className="text-sm text-gray-400 mt-1.5 text-center" style={{ fontWeight: 400 }}>
          상대방이 수락하면 알림을 보내드릴게요
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto flex flex-col">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button
          onClick={() => step === 0 ? router.back() : setStep((s) => (s - 1) as 0 | 1 | 2)}
          className="text-gray-700 text-xl p-1 -ml-1"
        >
          ‹
        </button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>교환 제안</h1>
        <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{step + 1} / 3</span>
      </header>

      {/* 진행 바 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full transition-all"
          style={{ background: PRIMARY, width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      {/* 대상 카드 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>교환 대상</span>
        <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{targetCardName}</span>
        <ChevronRight size={13} color="#d1d5db" strokeWidth={1.5} />
      </div>

      {/* ── STEP 0: 방식 선택 ── */}
      {step === 0 && (
        <div className="flex-1 px-4 py-5 flex flex-col gap-3">
          <p className="text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>교환 방식을 선택해주세요</p>

          {/* 직거래 */}
          <button
            onClick={() => setMethod("face")}
            className="w-full rounded-2xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: method === "face" ? PRIMARY : "#e5e7eb",
              background: method === "face" ? "#fff5f5" : "white",
            }}
          >
            <div className="flex items-start gap-3">
              <Users size={24} strokeWidth={1.5} color={method === "face" ? PRIMARY : "#6b7280"} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>직거래</p>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
                  공공장소에서 직접 만나 카드를 교환해요. 발송 위험 없이 실물을 바로 확인할 수 있어요.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["실물 확인 가능", "발송 위험 없음", "현장 즉시 완료"].map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 500 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* 보증금 에스크로 */}
          <button
            onClick={() => setMethod("escrow")}
            className="w-full rounded-2xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: method === "escrow" ? PRIMARY : "#e5e7eb",
              background: method === "escrow" ? "#fff5f5" : "white",
            }}
          >
            <div className="flex items-start gap-3">
              <Lock size={24} strokeWidth={1.5} color={method === "escrow" ? PRIMARY : "#6b7280"} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>보증금 안전교환</p>
                  <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full" style={{ background: "#6b7280", fontWeight: 600 }}>
                    PG 연동 예정
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
                  카드 가액만큼의 보증금을 예치하고 택배로 교환해요. 발송 기한을 지키지 않으면 운영정책에 따라 검토됩니다.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["원거리 가능", "보증금 담보", "72h 발송 의무"].map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 500 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* 안전 주의문 */}
          <div className="rounded-xl px-3 py-3 flex gap-2 mt-1" style={{ background: "#fffbeb" }}>
            <AlertTriangle size={14} color="#d97706" strokeWidth={2} className="shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700" style={{ fontWeight: 400, lineHeight: 1.55 }}>
              교환 사기 피해 발생 시 경찰청 <span style={{ fontWeight: 700 }}>112</span> 또는 사이버범죄 신고시스템(ECRM)에 신고하세요.
              레어리티는 P2P 중개 플랫폼으로 거래 당사자가 아닙니다.
            </p>
          </div>

          <div className="flex-1" />
          <button
            onClick={() => method && setStep(1)}
            className="w-full py-3.5 rounded-2xl text-sm text-white transition-opacity"
            style={{ background: PRIMARY, fontWeight: 700, opacity: method ? 1 : 0.4 }}
            disabled={!method}
          >
            다음
          </button>
        </div>
      )}

      {/* ── STEP 1: 내 카드 선택 ── */}
      {step === 1 && (
        <div className="flex-1 px-4 py-5 flex flex-col gap-3">
          <p className="text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>교환할 내 카드를 선택해주세요</p>

          <div className="grid grid-cols-2 gap-3">
            {MY_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className="rounded-2xl border-2 p-3 text-left transition-all"
                style={{
                  borderColor: selectedCard === card.id ? PRIMARY : "#e5e7eb",
                  background: selectedCard === card.id ? "#fff5f5" : "white",
                }}
              >
                <div className="w-full aspect-square rounded-xl bg-gray-100 flex flex-col overflow-hidden mb-2 relative">
                  <div className="h-2 w-full shrink-0" style={{ background: selectedCard === card.id ? PRIMARY : "#e5e7eb" }} />
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[10px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
                  </div>
                  <span
                    className="absolute top-1 left-1 text-[9px] bg-white/90 text-gray-600 px-1 py-0.5 rounded"
                    style={{ fontWeight: 600 }}
                  >
                    {card.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{card.nameKo}</p>
                <p className="text-[11px] mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {card.value.toLocaleString()}원
                </p>
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <button
            onClick={() => selectedCard && setStep(2)}
            className="w-full py-3.5 rounded-2xl text-sm text-white transition-opacity"
            style={{ background: PRIMARY, fontWeight: 700, opacity: selectedCard ? 1 : 0.4 }}
            disabled={!selectedCard}
          >
            다음
          </button>
        </div>
      )}

      {/* ── STEP 2: 약관 동의 ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <div className="px-4 pt-5 pb-2">
            <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
              {method === "face" ? "직거래 안전거래 안내" : "보증금 안전교환 안내"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
              아래 내용을 끝까지 확인하고 동의해주세요
            </p>
          </div>

          {/* 교환 요약 */}
          <div className="mx-4 mb-3 rounded-2xl border border-gray-200 p-4 bg-white">
            <p className="text-[11px] text-gray-400 mb-2" style={{ fontWeight: 600 }}>교환 요약</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl bg-gray-50 px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>내 카드</p>
                <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>
                  {selectedCardData?.emoji} {selectedCardData?.nameKo}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {selectedCardData?.value.toLocaleString()}원
                </p>
              </div>
              <span className="text-gray-400 text-lg">⇄</span>
              <div className="flex-1 rounded-xl bg-gray-50 px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>상대 카드</p>
                <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{targetCardName}</p>
                <p className="text-[11px] mt-0.5 text-gray-400" style={{ fontWeight: 400 }}>시세 조율 필요</p>
              </div>
            </div>
            {method === "escrow" && selectedCardData && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>예치 보증금 (내 카드 가액)</p>
                <p className="text-xs" style={{ color: PRIMARY, fontWeight: 700 }}>
                  {selectedCardData.value.toLocaleString()}원
                </p>
              </div>
            )}
          </div>

          {/* 약관 목록 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
            {terms.map((t, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{t.icon}</span>
                  <p className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{t.title}</p>
                </div>
                <p className="text-[11px] text-gray-500" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                  {t.body}
                </p>
              </div>
            ))}

            {/* 안전거래 안내 박스 */}
            <div className="rounded-2xl px-4 py-3 border" style={{ background: "#fff5f5", borderColor: "#fecaca" }}>
              <div className="flex items-start gap-2">
                <Shield size={14} color={PRIMARY} strokeWidth={2} className="shrink-0 mt-0.5" />
                <p className="text-[11px]" style={{ color: PRIMARY, fontWeight: 400, lineHeight: 1.6 }}>
                  본 화면은 이용자 간 교환 조건을 기록하기 위한 안내 화면입니다. 레어리티는 안전한 거래를 돕기 위해
                  기록과 신고 기능을 제공하며, 분쟁 발생 시 관련 법령 및 운영정책에 따라 처리를 지원합니다.
                </p>
              </div>
            </div>

            {/* 동의 체크 */}
            <button
              onClick={() => setAgreed((v) => !v)}
              className="flex items-center gap-3 rounded-2xl bg-white border-2 px-4 py-4 transition-all"
              style={{ borderColor: agreed ? PRIMARY : "#e5e7eb" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: agreed ? PRIMARY : "#f3f4f6" }}
              >
                {agreed && <CheckCircle2 size={14} color="white" strokeWidth={3} />}
              </div>
              <p className="text-xs text-gray-700 text-left" style={{ fontWeight: agreed ? 700 : 400 }}>
                위 약관을 모두 읽었으며, 이에 동의합니다.
              </p>
            </button>

            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-2xl text-sm text-white transition-opacity"
              style={{ background: PRIMARY, fontWeight: 700, opacity: agreed ? 1 : 0.4 }}
              disabled={!agreed}
            >
              교환 제안 보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProposePage() {
  return (
    <Suspense>
      <ProposeInner />
    </Suspense>
  );
}
