"use client";

import { useState, useEffect } from "react";
import { X, Bell, BellRing, CheckCircle2, ShieldCheck, ArrowLeftRight, Package, TrendingDown } from "lucide-react";
import { PRIMARY, SHADOW } from "@/lib/tokens";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SignalOptions {
  targetPrice: boolean;
  priceDrop: boolean;
  newListing: boolean;
  safeTrade: boolean;
  tradeMatch: boolean;
}

export interface SignalData {
  cardId: string;
  cardName: string;
  currentPrice: number;
  targetPrice: number;
  options: SignalOptions;
  createdAt: string;
}

// ── localStorage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "rarity_watch_signals";

function loadAll(): SignalData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SignalData[]) : [];
  } catch {
    return [];
  }
}

export function getSignalForCard(cardId: string): SignalData | null {
  return loadAll().find((s) => s.cardId === cardId) ?? null;
}

function saveSignal(signal: SignalData): void {
  try {
    const rest = loadAll().filter((s) => s.cardId !== signal.cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...rest, signal]));
  } catch {}
}

// ── Option row ──────────────────────────────────────────────────────────────────

type OptionDef = {
  key: keyof SignalOptions;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
};

const OPTION_DEFS: OptionDef[] = [
  { key: "targetPrice", label: "목표가 도달",      desc: "설정한 가격에 가까워지면 알려드려요", Icon: Bell           },
  { key: "priceDrop",   label: "가격 하락",        desc: "현재가보다 가격이 내려가면 알려드려요", Icon: TrendingDown   },
  { key: "newListing",  label: "새 매물",          desc: "같은 카드 새 매물이 올라오면 알려드려요", Icon: Package       },
  { key: "safeTrade",   label: "안전거래 매물",    desc: "새 안전거래 매물이 올라오면 시그널로 보여드려요", Icon: ShieldCheck },
  { key: "tradeMatch",  label: "교환 후보",        desc: "교환 가능한 조합이 발견되면 알려드려요", Icon: ArrowLeftRight },
];

function fmt(n: number) { return n.toLocaleString("ko-KR"); }

function ToggleRow({
  def, value, onChange,
}: { def: OptionDef; value: boolean; onChange: (v: boolean) => void }) {
  const { Icon, label, desc } = def;
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: value ? "#fff1f1" : "#f9fafb" }}
        >
          <Icon size={15} strokeWidth={1.8} color={value ? PRIMARY : "#9ca3af"} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{label}</p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5" style={{ fontWeight: 400 }}>{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="shrink-0 ml-3 w-10 h-5.5 rounded-full relative transition-colors"
        style={{
          background: value ? PRIMARY : "#d1d5db",
          width: 40, height: 22,
          border: "none",
          outline: "none",
        }}
        aria-label={`${label} ${value ? "끄기" : "켜기"}`}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-transform"
          style={{
            width: 18, height: 18,
            left: value ? 20 : 2,
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}

// ── Done state ─────────────────────────────────────────────────────────────────

function DoneState({
  onClose, onFeed,
}: { onClose: () => void; onFeed: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-4 pb-6 pt-2">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "#fff1f1" }}
      >
        <BellRing size={30} strokeWidth={2} color={PRIMARY} />
      </div>
      <p className="text-[16px] text-gray-900 mb-2" style={{ fontWeight: 700 }}>
        시그널이 설정됐어요
      </p>
      <p className="text-sm text-gray-500 mb-1.5 leading-relaxed" style={{ fontWeight: 400 }}>
        목표가에 가까워지거나 새 매물이 올라오면<br />피드에서 확인할 수 있어요
      </p>
      <p className="text-[11px] text-gray-400 mb-6" style={{ fontWeight: 400 }}>
        가격 정보는 거래 참고용이에요
      </p>
      <button
        onClick={onFeed}
        className="w-full py-3.5 rounded-2xl text-white text-sm mb-2.5"
        style={{ background: PRIMARY, fontWeight: 700 }}
      >
        피드 보러가기
      </button>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl text-sm"
        style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}
      >
        닫기
      </button>
    </div>
  );
}

// ── Main sheet ─────────────────────────────────────────────────────────────────

export interface SignalAlertSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  cardName: string;
  currentPrice: number;
  avgPrice30d: number;
  onSaved: () => void;
  onNavigateFeed: () => void;
}

export function SignalAlertSheet({
  isOpen, onClose,
  cardId, cardName, currentPrice, avgPrice30d,
  onSaved, onNavigateFeed,
}: SignalAlertSheetProps) {
  const suggestedTarget = Math.round(currentPrice * 0.92 / 1000) * 1000;

  const [targetPrice, setTargetPrice] = useState(suggestedTarget);
  const [targetInput, setTargetInput] = useState(suggestedTarget.toString());
  const [options, setOptions] = useState<SignalOptions>({
    targetPrice: true,
    priceDrop: true,
    newListing: true,
    safeTrade: true,
    tradeMatch: false,
  });
  const [done, setDone] = useState(false);

  // 기존 저장값 읽기
  useEffect(() => {
    if (!isOpen) return;
    const existing = getSignalForCard(cardId);
    if (existing) {
      setTargetPrice(existing.targetPrice);
      setTargetInput(existing.targetPrice.toString());
      setOptions(existing.options);
    } else {
      setTargetPrice(suggestedTarget);
      setTargetInput(suggestedTarget.toString());
      setOptions({ targetPrice: true, priceDrop: true, newListing: true, safeTrade: true, tradeMatch: false });
    }
    setDone(false);
  }, [isOpen, cardId, suggestedTarget]);

  if (!isOpen) return null;

  function handleTargetInput(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setTargetInput(digits);
    const n = parseInt(digits, 10);
    if (!isNaN(n)) setTargetPrice(n);
  }

  function handleSave() {
    const signal: SignalData = {
      cardId,
      cardName,
      currentPrice,
      targetPrice,
      options,
      createdAt: new Date().toISOString(),
    };
    saveSignal(signal);
    setDone(true);
    onSaved();
  }

  function handleClose() {
    setDone(false);
    onClose();
  }

  const pctOff = currentPrice > 0
    ? Math.round(((currentPrice - targetPrice) / currentPrice) * 100)
    : 0;

  return (
    <>
      {/* 배경 */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />

      {/* 시트 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-white rounded-t-[24px] flex flex-col"
        style={{ boxShadow: SHADOW.sheet, maxHeight: "92vh" }}
      >
        {/* 핸들 + 헤더 */}
        <div className="shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <p className="text-[16px] text-gray-900" style={{ fontWeight: 700 }}>
              {done ? "시그널 설정 완료" : "시그널 받기"}
            </p>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full"
              style={{ background: "#f4f4f5" }}
            >
              <X size={14} strokeWidth={2.5} color="#374151" />
            </button>
          </div>
        </div>

        {/* 스크롤 본문 */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {done ? (
            <DoneState onClose={handleClose} onFeed={onNavigateFeed} />
          ) : (
            <>
              {/* 카드 정보 */}
              <div className="rounded-2xl p-3.5 mb-4" style={{ background: "#f9fafb" }}>
                <p className="text-[15px] text-gray-900 mb-2" style={{ fontWeight: 700 }}>{cardName}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>현재가</p>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{fmt(currentPrice)}원</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>30일 평균</p>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{fmt(avgPrice30d)}원</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>추천 목표가</p>
                    <p className="text-sm" style={{ fontWeight: 700, color: PRIMARY }}>{fmt(suggestedTarget)}원</p>
                  </div>
                </div>
              </div>

              {/* 목표가 입력 */}
              <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>목표가 설정</p>
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-1.5"
                style={{ border: `1.5px solid ${PRIMARY}`, background: "#fff1f1" }}
              >
                <input
                  type="number"
                  inputMode="numeric"
                  aria-label="목표가"
                  value={targetInput}
                  onChange={(e) => handleTargetInput(e.target.value)}
                  className="flex-1 bg-transparent text-[17px] text-gray-900 outline-none"
                  style={{ fontWeight: 800 }}
                  placeholder="목표 가격 입력"
                />
                <span className="text-sm text-gray-500 shrink-0" style={{ fontWeight: 500 }}>원</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-4" style={{ fontWeight: 400 }}>
                {targetPrice > 0 && targetPrice < currentPrice
                  ? `현재가보다 ${pctOff}% 낮은 가격이에요 · 거래 참고용`
                  : "현재가 이하로 설정하면 알림 받기 좋아요"}
              </p>

              {/* 알림 옵션 */}
              <p className="text-xs text-gray-400 mb-1" style={{ fontWeight: 600 }}>알림 받을 조건</p>
              <div className="divide-y divide-gray-50">
                {OPTION_DEFS.map((def) => (
                  <ToggleRow
                    key={def.key}
                    def={def}
                    value={options[def.key]}
                    onChange={(v) => setOptions({ ...options, [def.key]: v })}
                  />
                ))}
              </div>

              {/* 안내 문구 */}
              <div
                className="flex items-start gap-2 mt-4 mb-5 p-3 rounded-xl"
                style={{ background: "#f9fafb" }}
              >
                <CheckCircle2 size={13} strokeWidth={2} color="#9ca3af" className="shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed" style={{ fontWeight: 400 }}>
                  시그널은 피드 탭에서 확인할 수 있어요. 실시간 푸시 알림은 추후 지원 예정이에요.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl text-white text-sm"
                style={{ background: PRIMARY, fontWeight: 700 }}
              >
                시그널 설정하기
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
