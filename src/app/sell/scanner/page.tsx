"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Camera, CheckCircle2, AlertCircle,
  Sparkles, RefreshCw, Shield, Info, X,
} from "lucide-react";
import {
  scanCard, confidenceLabel, conditionToGrade,
  type ScanSlotKey, type ScanResult,
} from "@/lib/scanner";
import { PRIMARY, RARITY_CHIP, SHADOW, SEMANTIC } from "@/lib/tokens";
import { LoadingState } from "@/components/LoadingState";

// ── 슬롯 정의 ─────────────────────────────────────────────────────────────────

type SlotDef = { key: ScanSlotKey; label: string; hint: string; required: boolean };

const REQUIRED_SLOTS: SlotDef[] = [
  { key: "front",  label: "앞면 전체",    hint: "앞면 전체가 선명하게",    required: true },
  { key: "back",   label: "뒷면 전체",    hint: "뒷면 텍스트가 선명하게",  required: true },
  { key: "corner", label: "네 모서리",    hint: "모서리 4곳 클로즈업",     required: true },
  { key: "glare",  label: "표면 빛 반사", hint: "빛 비춰 스크래치 확인",   required: true },
];

const GRADED_SLOTS: SlotDef[] = [
  { key: "slab",    label: "감정 케이스", hint: "케이스 전면 전체",  required: false },
  { key: "slabnum", label: "감정 번호",   hint: "번호 클로즈업",     required: false },
];

// 슬롯 채움 값: data URL (실제 파일) 또는 "mock" (테스트용)
// 실제 file input으로 교체 시: fillSlot 내부 setSlots 라인을
//   slotTargetRef.current = key; fileInputRef.current?.click(); 으로 교체
const MOCK_VALUE = "mock";

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function getConfColor(n: number): string {
  if (n >= 85) return "#16a34a";
  if (n >= 65) return "#1D4ED8";
  if (n >= 45) return "#D97706";
  return "#dc2626";
}

function previewConf(reqFilled: number): number {
  return Math.round(62 + (reqFilled / 4) * 26);
}

// ── 슬롯 카드 컴포넌트 ────────────────────────────────────────────────────────

function SlotCard({
  slot, value, onFill, onClear,
}: {
  slot: SlotDef;
  value: string;
  onFill: (key: ScanSlotKey) => void;
  onClear: (key: ScanSlotKey) => void;
}) {
  const filled = Boolean(value);
  return (
    <div>
      <div className="relative">
        <button
          onClick={() => { if (!filled) onFill(slot.key); }}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-1 rr-pressable"
          style={{
            height: 88,
            background: filled ? SEMANTIC.successBg : "#f9fafb",
            border: `1.5px solid ${filled ? "#bbf7d0" : slot.required ? "#fca5a5" : "#e5e7eb"}`,
          }}
        >
          {filled ? (
            <>
              <CheckCircle2 size={20} strokeWidth={2} color={SEMANTIC.success} />
              <span className="text-[11px]" style={{ color: SEMANTIC.success, fontWeight: 700 }}>
                {slot.label}
              </span>
            </>
          ) : (
            <>
              <Camera size={20} strokeWidth={1.5} color={slot.required ? "#fca5a5" : "#d1d5db"} />
              <span
                className="text-[10px] text-center leading-tight px-1"
                style={{ color: slot.required ? "#9ca3af" : "#d1d5db", fontWeight: slot.required ? 600 : 400 }}
              >
                {slot.label}
              </span>
              {slot.required && (
                <span className="text-[9px]" style={{ color: "#fca5a5", fontWeight: 600 }}>필수</span>
              )}
            </>
          )}
        </button>

        {filled && (
          <button
            onClick={() => onClear(slot.key)}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: SHADOW.subtle, border: "1px solid #e5e7eb" }}
          >
            <X size={10} strokeWidth={2.5} color="#9ca3af" />
          </button>
        )}
      </div>

      {!filled && (
        <p className="text-[9px] text-gray-400 text-center mt-1 leading-snug">
          {slot.hint}
        </p>
      )}
    </div>
  );
}

// ── Passport 미리보기 행 ──────────────────────────────────────────────────────

function PassportRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: "1px solid #f4f4f5" }}
    >
      <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{label}</span>
      <span
        className="text-[12px]"
        style={{ color: accent ? PRIMARY : "#111827", fontWeight: accent ? 700 : 600 }}
      >
        {value}
      </span>
    </div>
  );
}

// ── 스캔 결과 화면 ────────────────────────────────────────────────────────────

function ScanResultScreen({
  result,
  onReset,
  onContinue,
}: {
  result: ScanResult;
  onReset: () => void;
  onContinue: () => void;
}) {
  const router = useRouter();
  const rChip    = RARITY_CHIP[result.rarity] ?? { bg: "#f4f4f5", color: "#71717a" };
  const confColor = getConfColor(result.confidence);
  const condGrade = conditionToGrade(result.condition);
  const gradeStr  = result.isGraded && result.grade
    ? `${result.gradingCompany} ${result.grade} (감지됨)`
    : "Ungraded";

  return (
    <div className="min-h-screen pb-28" style={{ background: "#FAFAFA" }}>

      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 bg-white px-4 pt-12 pb-3"
        style={{ borderBottom: "1px solid #f4f4f5" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-gray-100"
          >
            <ChevronLeft size={22} strokeWidth={2} color="#111827" />
          </button>
          <h1 className="text-lg text-gray-900" style={{ fontWeight: 800 }}>스캔 결과</h1>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* 신뢰도 배너 */}
        <div
          className="rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{
            background: result.confidence >= 75 ? SEMANTIC.successBg : SEMANTIC.warningBg,
            boxShadow: SHADOW.card,
          }}
        >
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5" style={{ fontWeight: 600 }}>
              AI 분석 신뢰도
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl" style={{ color: confColor, fontWeight: 800 }}>
                {result.confidence}%
              </span>
              <span className="text-xs" style={{ color: confColor, fontWeight: 600 }}>
                {confidenceLabel(result.confidence)}
              </span>
            </div>
          </div>

          {/* 슬롯 커버리지 도트 */}
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-1.5" style={{ fontWeight: 400 }}>
              분석 슬롯
            </p>
            <div className="flex gap-1 justify-end">
              {(["front","back","corner","glare","slab","slabnum"] as ScanSlotKey[]).map((k) => (
                <div
                  key={k}
                  className="w-3 h-1.5 rounded-full"
                  style={{ background: result.photoSlots[k] ? confColor : "#e5e7eb" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 경고 메시지 */}
        {result.warnings.length > 0 && (
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: SEMANTIC.warningBg, border: "1px solid #fde68a" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle size={13} strokeWidth={2} color={SEMANTIC.warning} />
              <p className="text-[11px]" style={{ color: SEMANTIC.warning, fontWeight: 700 }}>
                확인 필요한 항목
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-gray-600 leading-snug" style={{ fontWeight: 400 }}>
                  · {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 감지된 카드 정보 */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: SHADOW.card }}>
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={13} strokeWidth={2} color={PRIMARY} />
            <p className="text-[11px] text-gray-400" style={{ fontWeight: 700 }}>
              감지된 카드 (추정)
            </p>
          </div>

          {/* 이름 + 레어도 */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] text-gray-900 leading-tight" style={{ fontWeight: 800 }}>
                {result.nameKo}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                {result.name}
              </p>
            </div>
            <span
              className="text-[11px] px-2 py-1 rounded-lg shrink-0"
              style={{ background: rChip.bg, color: rChip.color, fontWeight: 700 }}
            >
              {result.rarity}
            </span>
          </div>

          {/* 태그 행 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#f4f4f5", color: "#374151", fontWeight: 600 }}>
              {result.series}
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#f4f4f5", color: "#374151", fontWeight: 600 }}>
              No.{result.cardId}
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#f4f4f5", color: "#374151", fontWeight: 600 }}>
              {result.language}
            </span>
            {result.isGraded && (
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }}>
                {result.gradingCompany} {result.grade} 감지됨
              </span>
            )}
          </div>

          {/* 상태 + 배포 그리드 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2" style={{ background: "#f9fafb" }}>
              <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>상태 (추정)</p>
              <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>
                {condGrade}
              </p>
              <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{result.condition}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ background: "#f9fafb" }}>
              <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>배포 방식</p>
              <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>
                {result.distribution}
              </p>
            </div>
          </div>
        </div>

        {/* Card Passport 초안 */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: SHADOW.card }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Shield size={13} strokeWidth={2} color={PRIMARY} />
              <p className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>
                카드 패스포트 초안
              </p>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: SEMANTIC.warningBg, color: SEMANTIC.warning, fontWeight: 600 }}
            >
              확인 필요
            </span>
          </div>

          <PassportRow label="카드명 (한국어)"  value={result.nameKo} />
          <PassportRow label="카드명 (영문)"    value={result.name} />
          <PassportRow label="시리즈"           value={result.series} />
          <PassportRow label="카드 ID"          value={result.cardId} />
          <PassportRow label="레어도"           value={result.rarity} accent />
          <PassportRow label="언어판"           value={result.language} />
          <PassportRow label="배포 방식"        value={result.distribution} />
          <PassportRow label="상태 추정"        value={`${condGrade} (${result.condition})`} />
          <PassportRow label="감정 등급"        value={gradeStr} accent={result.isGraded} />

          <p
            className="text-[10px] text-gray-400 mt-3 leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            * AI가 사진을 분석해 추정한 초안입니다. 등록 전 반드시 직접 확인해 주세요.
          </p>
        </div>

        {/* 설명 문구 초안 */}
        {result.descDraft && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: SHADOW.card }}>
            <p className="text-[11px] text-gray-400 mb-2" style={{ fontWeight: 700 }}>
              자동 생성 판매 설명 초안
            </p>
            <p className="text-[12px] text-gray-700 leading-relaxed" style={{ fontWeight: 400 }}>
              {result.descDraft}
            </p>
            <p className="text-[10px] text-gray-400 mt-2" style={{ fontWeight: 400 }}>
              * 초안이며, 등록 시 직접 수정할 수 있어요.
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2 pb-6">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl text-white text-sm"
            style={{ background: PRIMARY, fontWeight: 700 }}
          >
            이 정보로 등록 계속하기
          </button>
          <button
            onClick={onReset}
            className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-1.5"
            style={{ background: "#f4f4f5", color: "#374151", fontWeight: 600 }}
          >
            <RefreshCw size={13} strokeWidth={2} />
            다시 스캔하기
          </button>
        </div>

      </div>
    </div>
  );
}

// ── 메인 스캐너 페이지 ────────────────────────────────────────────────────────

export default function ScannerPage() {
  const router = useRouter();

  // ── 슬롯 상태: ScanSlotKey → data URL(실제) | "mock"(테스트) | ""(비어있음)
  const [slots, setSlots] = useState<Record<ScanSlotKey, string>>({
    front: "", back: "", corner: "", glare: "", slab: "", slabnum: "",
  });
  const [isGraded, setIsGraded]   = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError]   = useState<string | null>(null);

  // 실제 파일 업로드 전환 포인트:
  //   fillSlot() 내부의 setSlots mock 로직 대신
  //   slotTargetRef.current = key; fileInputRef.current?.click(); 사용
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const slotTargetRef = useRef<ScanSlotKey | null>(null);

  const fillSlot  = (key: ScanSlotKey) => setSlots((p) => ({ ...p, [key]: MOCK_VALUE }));
  const clearSlot = (key: ScanSlotKey) => setSlots((p) => ({ ...p, [key]: "" }));

  // 실제 file input onChange (교체 후 활성화)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !slotTargetRef.current) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const k = slotTargetRef.current!;
      setSlots((p) => ({ ...p, [k]: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const reqFilled     = REQUIRED_SLOTS.filter((s) => Boolean(slots[s.key])).length;
  const allFilled     = [
    ...REQUIRED_SLOTS,
    ...(isGraded ? GRADED_SLOTS : []),
  ].filter((s) => Boolean(slots[s.key])).length;
  const totalSlots    = REQUIRED_SLOTS.length + (isGraded ? GRADED_SLOTS.length : 0);
  const canScan       = reqFilled === 4;
  const confPreview   = previewConf(reqFilled);

  const handleScan = async () => {
    setScanError(null);
    setScanning(true);
    try {
      const filled: Partial<Record<ScanSlotKey, string>> = {};
      (Object.keys(slots) as ScanSlotKey[]).forEach((k) => {
        if (slots[k]) filled[k] = slots[k];
      });
      const result = await scanCard({ slots: filled });
      setScanResult(result);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "스캔 중 오류가 발생했어요.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setScanError(null);
    setSlots({ front: "", back: "", corner: "", glare: "", slab: "", slabnum: "" });
  };

  // Phase 4에서 sell/page.tsx Step 0이 sessionStorage의 scanResult를 읽어 자동완성
  const handleContinue = () => {
    if (!scanResult) return;
    sessionStorage.setItem("scanResult", JSON.stringify(scanResult));
    router.push("/sell");
  };

  // 스캔 결과 화면으로 전환
  if (scanResult) {
    return (
      <ScanResultScreen
        result={scanResult}
        onReset={handleReset}
        onContinue={handleContinue}
      />
    );
  }

  // 스캔 중 로딩 화면
  if (scanning) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "#FAFAFA" }}
      >
        <LoadingState variant="scanner" />
      </div>
    );
  }

  // ── 슬롯 입력 화면 ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-28" style={{ background: "#FAFAFA" }}>

      {/* 실제 파일 업로드 전환 시 사용할 hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 bg-white px-4 pt-12 pb-3"
        style={{ borderBottom: "1px solid #f4f4f5" }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-gray-100"
          >
            <ChevronLeft size={22} strokeWidth={2} color="#111827" />
          </button>
          <h1 className="text-lg text-gray-900" style={{ fontWeight: 800 }}>AI 카드 스캐너</h1>
        </div>
        <p className="text-xs text-gray-400 pl-9" style={{ fontWeight: 400 }}>
          사진이 많을수록 분석 신뢰도가 올라가요
        </p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* 촬영 팁 배너 */}
        <div
          className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: "#EFF6FF", border: "1px solid #bfdbfe" }}
        >
          <Info size={14} strokeWidth={2} color="#1D4ED8" className="shrink-0 mt-px" />
          <div>
            <p className="text-[12px]" style={{ color: "#1e40af", fontWeight: 700 }}>촬영 팁</p>
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "#1e40af", fontWeight: 400, opacity: 0.8 }}>
              밝은 곳에서 카드를 평평하게 놓고 촬영하세요. 필수 4장이 모두 있어야 스캔을 시작할 수 있어요.
              AI 분석 결과는 추정값이므로 등록 전 반드시 확인해 주세요.
            </p>
          </div>
        </div>

        {/* 신뢰도 프리뷰 바 */}
        <div className="bg-white rounded-2xl px-4 py-3" style={{ boxShadow: SHADOW.card }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>
              현재 예상 신뢰도
            </p>
            <p
              className="text-[12px]"
              style={{ color: getConfColor(confPreview), fontWeight: 700 }}
            >
              ~{confPreview}%
            </p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f4f4f5" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${confPreview}%`,
                background: getConfColor(confPreview),
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-right" style={{ fontWeight: 400 }}>
            {allFilled} / {totalSlots} 슬롯 채워짐
          </p>
        </div>

        {/* 필수 사진 슬롯 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400" style={{ fontWeight: 700 }}>
              필수 사진 · 4장
            </p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: reqFilled === 4 ? SEMANTIC.successBg : "#fef2f2",
                color: reqFilled === 4 ? SEMANTIC.success : "#dc2626",
                fontWeight: 600,
              }}
            >
              {reqFilled} / 4
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {REQUIRED_SLOTS.map((slot) => (
              <SlotCard
                key={slot.key}
                slot={slot}
                value={slots[slot.key]}
                onFill={fillSlot}
                onClear={clearSlot}
              />
            ))}
          </div>
        </div>

        {/* 감정 카드 토글 */}
        <div>
          <button
            onClick={() => setIsGraded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
            style={{
              background: isGraded ? "#111827" : "white",
              boxShadow: SHADOW.card,
            }}
          >
            <div className="flex items-center gap-2.5">
              <Shield
                size={15}
                strokeWidth={2}
                color={isGraded ? "#F6C90E" : "#9ca3af"}
              />
              <span
                className="text-sm"
                style={{ color: isGraded ? "white" : "#374151", fontWeight: isGraded ? 700 : 500 }}
              >
                감정 카드 (PSA / BGS / CGC)
              </span>
            </div>
            {/* 토글 스위치 */}
            <div
              className="rounded-full flex items-center px-0.5 transition-all duration-200"
              style={{
                width: 40, height: 22,
                background: isGraded ? PRIMARY : "#e5e7eb",
              }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ transform: isGraded ? "translateX(18px)" : "translateX(0)" }}
              />
            </div>
          </button>

          {isGraded && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {GRADED_SLOTS.map((slot) => (
                <SlotCard
                  key={slot.key}
                  slot={slot}
                  value={slots[slot.key]}
                  onFill={fillSlot}
                  onClear={clearSlot}
                />
              ))}
            </div>
          )}
        </div>

        {/* 오류 메시지 */}
        {scanError && (
          <div
            className="rounded-2xl px-4 py-3 flex items-start gap-2"
            style={{ background: SEMANTIC.errorBg, border: "1px solid #fecaca" }}
          >
            <AlertCircle size={13} strokeWidth={2} color={SEMANTIC.error} className="shrink-0 mt-px" />
            <p className="text-[12px]" style={{ color: "#7f1d1d", fontWeight: 500 }}>
              {scanError}
            </p>
          </div>
        )}

        {/* 스캔 버튼 */}
        <div className="pb-4">
          {scanning ? (
            <div
              className="w-full py-4 rounded-2xl flex flex-col items-center gap-2"
              style={{ background: "#111827" }}
            >
              <div className="flex items-center gap-2 rr-pulse-soft">
                <RefreshCw
                  size={16}
                  strokeWidth={2}
                  color="#F6C90E"
                  className="animate-spin"
                />
                <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                  AI 분석 중…
                </span>
              </div>
              <p
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}
              >
                카드 정보를 감지하고 있어요. 잠시만 기다려 주세요.
              </p>
            </div>
          ) : (
            <button
              onClick={handleScan}
              disabled={!canScan}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm rr-pressable"
              style={{
                background:  canScan ? "#111827" : "#f4f4f5",
                color:       canScan ? "white"   : "#9ca3af",
                fontWeight: 700,
                cursor:     canScan ? "pointer"  : "not-allowed",
              }}
            >
              <Sparkles
                size={16}
                strokeWidth={2}
                color={canScan ? "#F6C90E" : "#d1d5db"}
              />
              {canScan
                ? "AI 스캔 시작"
                : `필수 사진 ${reqFilled}/4 — 모두 추가해야 스캔 가능`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
