"use client";

import { use, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock, CheckCircle2, Clock, AlertTriangle,
  XCircle, Shield, Camera,
} from "lucide-react";

const PRIMARY = "#E53E3E";

// ── Demo toggle ──────────────────────────────────────────────────
// false: 사진 미등록 → 확정 불가 상태
// true : 모든 증빙 충족 → 확정 가능 상태
const DEMO_COMPLETE_EVIDENCE = false;

// ── Types ────────────────────────────────────────────────────────

type AgreementStatus =
  | "DRAFT"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "CHANGE_REQUESTED"
  | "CANCELLED"
  | "DISPUTED";

type CardInfo = {
  name: string;
  tcg: "Pokemon" | "One Piece";
  rarity: string;
  language: string;
  setNumber: string;
  condition: string;
  gradingCompany: string;
  grade: string;
  certificateNumber: string;
  imageUrl: string;
  estimatedPrice: number;
};

type AgreementTerms = {
  extraCashRequired: boolean;
  extraCashAmount: number;
  extraCashPayer: "me" | "partner" | null;
  shippingMethod: string;
  shipByDate: string;
  receiveConfirmByDate: string;
  safetyTradeEnabled: boolean;
  depositRequired: boolean;
  depositAmount: number;
  inspectionCenterRequired: boolean;
  disputeHandling: string;
};

type ExchangeAgreement = {
  id: string;
  status: AgreementStatus;
  myCard: CardInfo;
  partnerCard: CardInfo;
  terms: AgreementTerms;
  confirmedAt: string | null;
  myConfirmed: boolean;
  partnerConfirmed: boolean;
};

// ── Status config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AgreementStatus,
  { label: string; bg: string; color: string; banner: string; bannerBg: string; bannerColor: string }
> = {
  DRAFT: {
    label: "조율 중",
    bg: "#f3f4f6", color: "#6b7280",
    banner: "교환 조건을 확정하면 카드 정보, 상태, 추가금, 배송 조건이 고정됩니다. 이후 변경은 상대방의 재동의가 필요합니다.",
    bannerBg: "#f8fafc", bannerColor: "#475569",
  },
  PENDING_CONFIRMATION: {
    label: "확정 대기",
    bg: "#fffbeb", color: "#d97706",
    banner: "포켓마스터가 확정을 요청했습니다. 내용을 확인하고 동의하면 교환 조건이 고정됩니다.",
    bannerBg: "#fffbeb", bannerColor: "#92400e",
  },
  CONFIRMED: {
    label: "확정됨",
    bg: "#f0fdf4", color: "#10b981",
    banner: "교환 조건이 확정되었습니다. 이후 카드 변경, 상태 변경, 추가금 변경은 상대방 재동의가 필요합니다.",
    bannerBg: "#f0fdf4", bannerColor: "#065f46",
  },
  CHANGE_REQUESTED: {
    label: "변경 요청",
    bg: "#fff5f5", color: PRIMARY,
    banner: "상대방이 조건 변경을 요청했습니다. 변경된 항목을 확인하고 재동의하거나 거절할 수 있습니다.",
    bannerBg: "#fff5f5", bannerColor: "#991b1b",
  },
  CANCELLED: {
    label: "취소됨",
    bg: "#f9fafb", color: "#9ca3af",
    banner: "교환이 취소되었습니다.",
    bannerBg: "#f9fafb", bannerColor: "#6b7280",
  },
  DISPUTED: {
    label: "분쟁 중",
    bg: "#fff5f5", color: PRIMARY,
    banner: "분쟁이 접수되었습니다. 레어리티 운영팀에서 검토 후 연락드립니다.",
    bannerBg: "#fff5f5", bannerColor: "#991b1b",
  },
};

// ── Validation ───────────────────────────────────────────────────

function computeMissingRequirements(ag: ExchangeAgreement): string[] {
  const missing: string[] = [];
  const { myCard, partnerCard, terms } = ag;

  // 카드 사진
  if (!myCard.imageUrl)      missing.push("내 카드 사진 등록 필요");
  if (!partnerCard.imageUrl) missing.push("상대 카드 사진 등록 필요");

  // 내 카드 필수 항목
  const myFields: [string, string | number][] = [
    ["내 카드 레어도",   myCard.rarity],
    ["내 카드 언어",     myCard.language],
    ["내 카드 세트번호", myCard.setNumber],
    ["내 카드 상태",     myCard.condition],
    ["내 카드 예상가",   myCard.estimatedPrice],
  ];
  for (const [label, val] of myFields) {
    if (!val || val === "-") missing.push(`${label} 입력 필요`);
  }

  // 내 카드 감정 (감정사가 있는 경우)
  if (myCard.gradingCompany && myCard.gradingCompany !== "-") {
    if (!myCard.grade || myCard.grade === "-")
      missing.push("내 카드 감정 등급 입력 필요");
    if (!myCard.certificateNumber || myCard.certificateNumber === "-")
      missing.push("내 카드 인증번호 입력 필요");
  }

  // 상대 카드 필수 항목
  const partnerFields: [string, string | number][] = [
    ["상대 카드 레어도",   partnerCard.rarity],
    ["상대 카드 언어",     partnerCard.language],
    ["상대 카드 세트번호", partnerCard.setNumber],
    ["상대 카드 상태",     partnerCard.condition],
    ["상대 카드 예상가",   partnerCard.estimatedPrice],
  ];
  for (const [label, val] of partnerFields) {
    if (!val || val === "-") missing.push(`${label} 확인 필요`);
  }

  // 상대 카드 감정 (감정사가 있는 경우)
  if (partnerCard.gradingCompany && partnerCard.gradingCompany !== "-") {
    if (!partnerCard.grade || partnerCard.grade === "-")
      missing.push("상대 카드 감정 등급 확인 필요");
    if (!partnerCard.certificateNumber || partnerCard.certificateNumber === "-")
      missing.push("상대 카드 인증번호 확인 필요");
  }

  // 추가금 조건
  if (terms.extraCashRequired) {
    if (!terms.extraCashAmount || terms.extraCashAmount <= 0)
      missing.push("추가금 금액 입력 필요");
    if (!terms.extraCashPayer)
      missing.push("추가금 지급 주체 확인 필요");
  }

  // 교환 조건 필수 항목
  if (!terms.shippingMethod)       missing.push("배송 방식 입력 필요");
  if (!terms.shipByDate)           missing.push("발송 기한 입력 필요");
  if (!terms.receiveConfirmByDate) missing.push("수령 확인 기한 입력 필요");
  if (!terms.disputeHandling)      missing.push("분쟁 처리 방식 입력 필요");

  return missing;
}

// ── Mock data ────────────────────────────────────────────────────

const MOCK: ExchangeAgreement = {
  id: "exg_001",
  status: "DRAFT",
  myCard: {
    name: "리자몽 ex",
    tcg: "Pokemon",
    rarity: "SR",
    language: "한국어",
    setNumber: "006/165",
    condition: "Near Mint",
    gradingCompany: "PSA",
    grade: "9",
    certificateNumber: "87654321",
    imageUrl: DEMO_COMPLETE_EVIDENCE ? "__registered__" : "",
    estimatedPrice: 85000,
  },
  partnerCard: {
    name: "피카츄 ex",
    tcg: "Pokemon",
    rarity: "SAR",
    language: "일본어",
    setNumber: "168/165",
    condition: "Near Mint",
    gradingCompany: "-",
    grade: "-",
    certificateNumber: "-",
    imageUrl: DEMO_COMPLETE_EVIDENCE ? "__registered__" : "",
    estimatedPrice: 280000,
  },
  terms: {
    extraCashRequired: true,
    extraCashAmount: 195000,
    extraCashPayer: "me",
    shippingMethod: "택배 (등기)",
    shipByDate: "2026.06.02",
    receiveConfirmByDate: "2026.06.06",
    safetyTradeEnabled: true,
    depositRequired: true,
    depositAmount: 85000,
    inspectionCenterRequired: false,
    disputeHandling: "레어리티 중재",
  },
  confirmedAt: null,
  myConfirmed: false,
  partnerConfirmed: true,
};

// ── Sub-components ───────────────────────────────────────────────

function StatusChipIcon({ status, size = 11 }: { status: AgreementStatus; size?: number }) {
  const color = STATUS_CONFIG[status].color;
  const p = { size, strokeWidth: 2.2, color };
  switch (status) {
    case "CONFIRMED":           return <CheckCircle2 {...p} />;
    case "CANCELLED":           return <XCircle {...p} />;
    case "CHANGE_REQUESTED":
    case "DISPUTED":            return <AlertTriangle {...p} />;
    default:                    return <Clock {...p} />;
  }
}

function SectionHeader({ title, locked }: { title: string; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">
      <p className="text-[11px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.04em" }}>
        {title}
      </p>
      {locked && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4" }}>
          <Lock size={9} color="#10b981" strokeWidth={2.5} />
          <span className="text-[9px]" style={{ color: "#10b981", fontWeight: 700 }}>고정됨</span>
        </div>
      )}
    </div>
  );
}

function CardThumbnail({ card, label }: { card: CardInfo; label: string }) {
  const hasPhoto = Boolean(card.imageUrl);
  return (
    <div className="flex-1 min-w-0">
      <div
        className="w-full rounded-xl flex flex-col items-center justify-center gap-1.5"
        style={{
          height: 96,
          background: hasPhoto ? "#f0fdf4" : "#f3f4f6",
          border: `1px solid ${hasPhoto ? "#bbf7d0" : "#e5e7eb"}`,
        }}
      >
        {hasPhoto ? (
          <>
            <CheckCircle2 size={18} color="#10b981" strokeWidth={1.5} />
            <span className="text-[9px]" style={{ color: "#10b981", fontWeight: 600 }}>사진 등록됨</span>
          </>
        ) : (
          <>
            <Camera size={18} color="#d1d5db" strokeWidth={1.5} />
            <span className="text-[9px] text-gray-400" style={{ fontWeight: 400 }}>사진 미등록</span>
          </>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 text-center" style={{ fontWeight: 400 }}>{label}</p>
      <p className="text-xs text-gray-900 mt-0.5 text-center truncate" style={{ fontWeight: 700 }}>{card.name}</p>
      <p className="text-[11px] text-center mt-0.5" style={{ color: PRIMARY, fontWeight: 700 }}>
        {card.estimatedPrice.toLocaleString()}원
      </p>
    </div>
  );
}

function CompareRow({
  label, myVal, partnerVal, mono = false, changed = false, priceRow = false,
}: {
  label: string; myVal: string; partnerVal: string;
  mono?: boolean; changed?: boolean; priceRow?: boolean;
}) {
  const rowBg = changed ? "#fffbeb" : "white";
  const valueStyle = (val: string) => ({
    color: priceRow ? PRIMARY : val === "-" ? "#d1d5db" : "#111",
    fontWeight: priceRow ? 700 : val === "-" ? 400 : 600,
  });
  return (
    <div className="flex items-start px-4 py-2.5 border-b border-gray-50" style={{ background: rowBg }}>
      <p className="w-20 text-[11px] text-gray-400 shrink-0 mt-0.5" style={{ fontWeight: 400 }}>{label}</p>
      <p className={`flex-1 text-[11px] ${mono ? "font-mono" : ""}`} style={valueStyle(myVal)}>
        {myVal || "-"}
      </p>
      {changed && (
        <div className="mx-1 shrink-0 mt-0.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>
            변경됨
          </span>
        </div>
      )}
      <p className={`flex-1 text-[11px] ${mono ? "font-mono" : ""}`} style={valueStyle(partnerVal)}>
        {partnerVal || "-"}
      </p>
    </div>
  );
}

function TermRow({
  label, value, highlight = false, changed = false,
}: {
  label: string; value: string; highlight?: boolean; changed?: boolean;
}) {
  return (
    <div
      className="flex items-start px-4 py-3 border-b border-gray-50"
      style={{ background: changed ? "#fffbeb" : "white" }}
    >
      <p className="w-28 text-[11px] text-gray-400 shrink-0 mt-0.5" style={{ fontWeight: 400 }}>{label}</p>
      <div className="flex-1 flex items-center gap-2">
        <p className="text-[11px]" style={{ color: highlight ? PRIMARY : "#111", fontWeight: highlight ? 700 : 600 }}>
          {value}
        </p>
        {changed && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>
            변경됨
          </span>
        )}
      </div>
    </div>
  );
}

function MissingRequirementsBox({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div
      className="mx-4 mb-3 rounded-xl px-3.5 py-3.5"
      style={{ background: "#fff5f5", border: "1px solid #fecaca" }}
    >
      <p className="text-[11px] mb-2.5" style={{ color: PRIMARY, fontWeight: 700 }}>
        확정 전에 필요한 증빙이 남아 있어요.
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <div
              className="w-1 h-1 rounded-full shrink-0 mt-1.5"
              style={{ background: "#fca5a5" }}
            />
            <p className="text-[11px]" style={{ color: "#991b1b", fontWeight: 400 }}>
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Inner Component ─────────────────────────────────────────

type Params = { id: string };

function AgreementInner({ id }: { id: string }) {
  void id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as AgreementStatus | null) ?? "DRAFT";

  const [agreement, setAgreement] = useState<ExchangeAgreement>({
    ...MOCK,
    status: initialStatus,
    myConfirmed: initialStatus === "CONFIRMED",
    partnerConfirmed: initialStatus === "CONFIRMED" || initialStatus === "PENDING_CONFIRMATION",
    confirmedAt: initialStatus === "CONFIRMED" ? "2026.05.26 14:23" : null,
  });

  // ── Derived validation state ─────────────────────────────────
  const missingRequirements = computeMissingRequirements(agreement);
  const canConfirm = missingRequirements.length === 0;

  const cfg = STATUS_CONFIG[agreement.status];
  const isLocked     = agreement.status === "CONFIRMED";
  const isTerminated = agreement.status === "CANCELLED" || agreement.status === "DISPUTED";
  const needsAction  = agreement.status === "DRAFT"
    || agreement.status === "PENDING_CONFIRMATION"
    || agreement.status === "CHANGE_REQUESTED";

  function handleConfirmRequest() {
    if (!canConfirm) return;
    setAgreement((p) => ({ ...p, status: "PENDING_CONFIRMATION", myConfirmed: true }));
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setAgreement((p) => ({
      ...p, status: "CONFIRMED",
      myConfirmed: true, partnerConfirmed: true, confirmedAt: "2026.05.26 14:23",
    }));
  }

  function handleReject() {
    setAgreement((p) => ({ ...p, status: "DRAFT", myConfirmed: false, partnerConfirmed: false }));
  }

  const { myCard, partnerCard, terms } = agreement;

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-28">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>교환 조건 확정서</h1>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: cfg.bg }}>
          <StatusChipIcon status={agreement.status} size={11} />
          <span className="text-[10px]" style={{ color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
        </div>
      </header>

      {/* 상태 배너 */}
      <div className="px-4 py-3.5 border-b border-gray-100" style={{ background: cfg.bannerBg }}>
        <p className="text-[11px]" style={{ color: cfg.bannerColor, fontWeight: 400, lineHeight: 1.65 }}>
          {cfg.banner}
        </p>
        {isLocked && agreement.confirmedAt && (
          <p className="text-[10px] mt-1.5" style={{ color: "#9ca3af", fontWeight: 400 }}>
            확정 일시: {agreement.confirmedAt}
          </p>
        )}
      </div>

      {/* ── 카드 정보 ── */}
      <div className="bg-white mt-2">
        <SectionHeader title="카드 정보" locked={isLocked} />

        {/* 카드 썸네일 */}
        <div className="flex items-start gap-2 px-4 pb-4">
          <CardThumbnail card={myCard} label="내 카드" />
          <div className="flex flex-col items-center justify-center pt-10 w-5 shrink-0">
            <div className="w-px h-8 bg-gray-200" />
            <p className="text-[9px] text-gray-300 my-1" style={{ fontWeight: 600 }}>vs</p>
            <div className="w-px h-8 bg-gray-200" />
          </div>
          <CardThumbnail card={partnerCard} label="상대 카드" />
        </div>

        {/* 비교 테이블 헤더 */}
        <div className="flex items-center px-4 py-2 border-t border-b border-gray-100" style={{ background: "#fafafa" }}>
          <div className="w-20 shrink-0" />
          <p className="flex-1 text-[10px] text-gray-400 text-center" style={{ fontWeight: 600 }}>내 카드</p>
          <p className="flex-1 text-[10px] text-gray-400 text-center" style={{ fontWeight: 600 }}>상대 카드</p>
        </div>

        {/* 비교 행 */}
        <CompareRow label="TCG"    myVal={myCard.tcg}            partnerVal={partnerCard.tcg} />
        <CompareRow label="레어도"  myVal={myCard.rarity}         partnerVal={partnerCard.rarity} />
        <CompareRow label="언어"    myVal={myCard.language}       partnerVal={partnerCard.language} />
        <CompareRow label="세트번호" myVal={myCard.setNumber}      partnerVal={partnerCard.setNumber} mono />
        <CompareRow label="상태"    myVal={myCard.condition}      partnerVal={partnerCard.condition} />
        <CompareRow label="감정사"  myVal={myCard.gradingCompany} partnerVal={partnerCard.gradingCompany} />
        <CompareRow label="등급"    myVal={myCard.grade}          partnerVal={partnerCard.grade} />
        <CompareRow label="인증번호" myVal={myCard.certificateNumber} partnerVal={partnerCard.certificateNumber} mono />
        <CompareRow
          label="예상가"
          myVal={`${myCard.estimatedPrice.toLocaleString()}원`}
          partnerVal={`${partnerCard.estimatedPrice.toLocaleString()}원`}
          priceRow
        />

        {/* 사진 등록 안내 (미확정 상태만) */}
        {!isLocked && (
          <div className="mx-4 mt-2 mb-4 rounded-xl px-3 py-2.5 flex items-start gap-2" style={{ background: "#f9fafb" }}>
            <Camera size={12} color="#9ca3af" strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400" style={{ fontWeight: 400, lineHeight: 1.55 }}>
              확정 전에 양쪽 카드 사진을 반드시 등록해야 합니다.
              사진은 분쟁 발생 시 상태 증빙 자료로 사용됩니다.
            </p>
          </div>
        )}
        {isLocked && <div className="h-4" />}
      </div>

      {/* ── 교환 조건 ── */}
      <div className="bg-white mt-2">
        <SectionHeader title="교환 조건" locked={isLocked} />

        <TermRow label="추가금"        value={terms.extraCashRequired ? "있음" : "없음"} />
        {terms.extraCashRequired && (
          <TermRow
            label="추가금 금액"
            value={`${terms.extraCashAmount.toLocaleString()}원 · ${terms.extraCashPayer === "me" ? "내가 지급" : "상대방이 지급"}`}
            highlight
          />
        )}
        <TermRow label="배송 방식"      value={terms.shippingMethod} />
        <TermRow label="발송 기한"      value={terms.shipByDate} />
        <TermRow label="수령 확인 기한"  value={terms.receiveConfirmByDate} />
        <TermRow
          label="보증금"
          value={terms.depositRequired ? `사용 · ${terms.depositAmount.toLocaleString()}원` : "미사용"}
        />
        <TermRow label="검수센터 경유"  value={terms.inspectionCenterRequired ? "경유" : "미경유"} />
        <TermRow label="분쟁 처리"      value={terms.disputeHandling} />
        <div className="h-4" />
      </div>

      {/* ── 확정 조건 검증 박스 (미확정 상태만) ── */}
      {needsAction && (
        <MissingRequirementsBox items={missingRequirements} />
      )}

      {/* ── 확정 상태 블록 (CONFIRMED) ── */}
      {isLocked && (
        <div className="bg-white mt-2 px-4 py-5">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-4" style={{ background: "#f8fdf9" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0fdf4" }}>
              <CheckCircle2 size={16} color="#10b981" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-gray-900" style={{ fontWeight: 700 }}>양측 확정 완료</p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                {agreement.confirmedAt} 기준으로 조건이 고정되었습니다
              </p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center" style={{ fontWeight: 400 }}>
            이 확정서는 분쟁 발생 시 레어리티 중재의 기준이 됩니다
          </p>
        </div>
      )}

      {/* ── 서명란 (CONFIRMED) ── */}
      {isLocked && (
        <div className="bg-white mt-2 px-4 py-5">
          <p className="text-[11px] text-gray-400 mb-3" style={{ fontWeight: 700, letterSpacing: "0.04em" }}>확정 서명</p>
          <div className="flex gap-3">
            {[
              { label: "내 계정", value: "rarity_user_01", done: agreement.myConfirmed },
              { label: "포켓마스터", value: "pocketmaster_99", done: agreement.partnerConfirmed },
            ].map((sig) => (
              <div key={sig.label} className="flex-1 rounded-xl border border-gray-100 px-3 py-3">
                <p className="text-[10px] text-gray-400 mb-1.5" style={{ fontWeight: 400 }}>{sig.label}</p>
                <p className="text-[10px] font-mono text-gray-500" style={{ fontWeight: 500 }}>{sig.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle2 size={10} color="#10b981" strokeWidth={2.5} />
                  <span className="text-[9px]" style={{ color: "#10b981", fontWeight: 700 }}>확정</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 법적 고지 ── */}
      <div className="mx-4 mt-2 mb-2 rounded-2xl border border-gray-100 px-4 py-3.5">
        <div className="flex items-start gap-2">
          <Shield size={12} color="#9ca3af" strokeWidth={1.5} className="shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 400, lineHeight: 1.65 }}>
            본 확정서는 이용자 간 자율 합의 기록입니다. 레어리티는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른
            통신판매중개업자로서 거래 당사자가 아니며, 교환 이행 책임은 각 이용자에게 있습니다.
            분쟁 발생 시 전자상거래분쟁조정위원회에 조정을 신청할 수 있습니다.
          </p>
        </div>
      </div>

      {/* ── 하단 액션 버튼 ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-4 py-3">

        {agreement.status === "DRAFT" && (
          <button
            onClick={handleConfirmRequest}
            disabled={!canConfirm}
            className="w-full py-3.5 rounded-2xl text-sm text-white"
            style={{
              background: PRIMARY,
              fontWeight: 700,
              opacity: canConfirm ? 1 : 0.35,
              cursor: canConfirm ? "pointer" : "default",
            }}
          >
            확정 요청하기
          </button>
        )}

        {agreement.status === "PENDING_CONFIRMATION" && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 py-3.5 rounded-2xl text-sm border"
              style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
            >
              거절
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 py-3.5 rounded-2xl text-sm text-white"
              style={{
                background: PRIMARY,
                fontWeight: 700,
                opacity: canConfirm ? 1 : 0.35,
                cursor: canConfirm ? "pointer" : "default",
              }}
            >
              확정하기
            </button>
          </div>
        )}

        {agreement.status === "CONFIRMED" && (
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-3.5 rounded-2xl text-sm text-white"
            style={{ background: "#111", fontWeight: 700 }}
          >
            채팅하기
          </button>
        )}

        {agreement.status === "CHANGE_REQUESTED" && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 py-3.5 rounded-2xl text-sm border"
              style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
            >
              거절
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 py-3.5 rounded-2xl text-sm text-white"
              style={{
                background: PRIMARY,
                fontWeight: 700,
                opacity: canConfirm ? 1 : 0.35,
                cursor: canConfirm ? "pointer" : "default",
              }}
            >
              재동의하기
            </button>
          </div>
        )}

        {isTerminated && (
          <button
            className="w-full py-3.5 rounded-2xl text-sm border"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
          >
            고객센터 문의
          </button>
        )}
      </div>
    </div>
  );
}

function AgreementWrapper({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <AgreementInner id={id} />
    </Suspense>
  );
}

export default function AgreementPage({ params }: { params: Promise<Params> }) {
  return <AgreementWrapper params={params} />;
}
