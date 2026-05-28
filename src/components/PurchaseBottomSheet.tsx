"use client";

import { useState } from "react";
import {
  X, Package, Store, Users, Camera, ShieldCheck,
  CheckCircle2, FileText, Layers, type LucideIcon,
} from "lucide-react";
import { PRIMARY, RARITY_CHIP, SHADOW } from "@/lib/tokens";
// rr-button-primary / rr-button-secondary / rr-price → globals.css

export interface PurchaseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  rarity: string;
  condition: string;
  price: number;
  seller: string;
  photoVerified: boolean;
  safeTrade: boolean;
  onChat: () => void;
}

type Delivery = "택배" | "반값택배" | "직거래";

const DELIVERY_OPTIONS: { key: Delivery; label: string; Icon: LucideIcon; desc: string }[] = [
  { key: "택배",    label: "택배",    Icon: Package, desc: "일반 택배"   },
  { key: "반값택배", label: "반값택배", Icon: Store,   desc: "편의점 접수" },
  { key: "직거래",  label: "직거래",  Icon: Users,   desc: "직접 만남"   },
];

const FEE_RATE = 0.03;

function fmt(n: number) { return n.toLocaleString("ko-KR"); }

function DoneState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-4 pb-8 pt-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "#f0fdf4" }}
      >
        <CheckCircle2 size={32} strokeWidth={2} color="#16a34a" />
      </div>
      <p className="text-[16px] text-gray-900 mb-2" style={{ fontWeight: 700 }}>
        구매 요청이 판매자에게 전송됐어요
      </p>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed" style={{ fontWeight: 400 }}>
        판매자가 확인하면 채팅에서<br />이어서 진행할 수 있어요
      </p>
      <button onClick={onClose} className="rr-button-primary">
        확인
      </button>
    </div>
  );
}

export function PurchaseBottomSheet({
  isOpen, onClose,
  cardName, rarity, condition, price,
  seller, photoVerified, safeTrade, onChat,
}: PurchaseSheetProps) {
  const [delivery, setDelivery] = useState<Delivery>("택배");
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const isDirect = delivery === "직거래";
  const fee = isDirect ? 0 : Math.round(price * FEE_RATE);
  const total = price + fee;
  const chip = RARITY_CHIP[rarity] ?? { bg: "#f4f4f5", color: "#71717a" };

  function handleClose() {
    setDone(false);
    onClose();
  }

  return (
    <>
      {/* 배경 */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />

      {/* 시트 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-white rounded-t-[24px] flex flex-col"
        style={{ boxShadow: SHADOW.sheet, maxHeight: "88vh" }}
      >
        {/* 핸들 + 헤더 */}
        <div className="shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <p className="text-[16px] text-gray-900" style={{ fontWeight: 700 }}>
              {done ? "구매 요청 완료" : "구매하기"}
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
            <DoneState onClose={handleClose} />
          ) : (
            <>
              {/* 카드 정보 */}
              <div className="rounded-2xl p-3.5 mb-4" style={{ background: "#f9fafb" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-[15px] text-gray-900" style={{ fontWeight: 700 }}>{cardName}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: chip.bg, color: chip.color, fontWeight: 700 }}
                    >
                      {rarity}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: "#fffbeb", color: "#92400e", fontWeight: 600 }}
                    >
                      {condition}
                    </span>
                  </div>
                  <span className="text-[17px] text-gray-900 shrink-0" style={{ fontWeight: 800 }}>
                    {fmt(price)}원
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>{seller}</span>
                  {photoVerified && (
                    <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#16a34a", fontWeight: 600 }}>
                      <Camera size={10} strokeWidth={2} />사진 인증
                    </span>
                  )}
                  {safeTrade && (
                    <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#1D4ED8", fontWeight: 600 }}>
                      <ShieldCheck size={10} strokeWidth={2} />안전거래
                    </span>
                  )}
                </div>
              </div>

              {/* 배송 방식 */}
              <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>배송 방식</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {DELIVERY_OPTIONS.map(({ key, label, Icon, desc }) => {
                  const active = delivery === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setDelivery(key)}
                      aria-label={`구매 배송 방식 ${label} 선택`}
                      aria-pressed={active}
                      className="flex flex-col items-center gap-1 py-3 rounded-2xl border transition-colors"
                      style={{
                        borderColor: active ? PRIMARY : "#e5e7eb",
                        background: active ? "#fff1f1" : "#fff",
                        color: active ? PRIMARY : "#6b7280",
                      }}
                    >
                      <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                      <span className="text-xs" style={{ fontWeight: active ? 700 : 500 }}>{label}</span>
                      <span className="text-[10px]" style={{ color: active ? "#b01c1c" : "#9ca3af", fontWeight: 400 }}>{desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* 예상 결제금액 */}
              <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>예상 결제금액</p>
              <div className="rounded-2xl p-3.5 mb-4" style={{ background: "#f9fafb" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600" style={{ fontWeight: 400 }}>카드 가격</span>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{fmt(price)}원</span>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm text-gray-600" style={{ fontWeight: 400 }}>
                    {isDirect ? "직거래 수수료" : `안전거래 수수료 (${(FEE_RATE * 100).toFixed(0)}%)`}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 600, color: isDirect ? "#9ca3af" : "#374151" }}>
                    {isDirect ? "없음" : `+${fmt(fee)}원`}
                  </span>
                </div>
                <div className="h-px mb-2.5" style={{ background: "#e5e7eb" }} />
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-sm text-gray-700" style={{ fontWeight: 700 }}>예상 합계</span>
                    <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                      {isDirect ? "현장 결제" : "판매자 확인 후 확정"}
                    </p>
                  </div>
                  <span className="rr-price text-[20px] text-gray-900">{fmt(total)}원</span>
                </div>
              </div>

              {/* 구매 전 확인 체크리스트 */}
              <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>구매 전 확인</p>
              <div className="flex flex-col gap-2.5 mb-5">
                {[
                  { Icon: Layers,   label: "카드 패스포트 확인", desc: "TCG 정보·등급·희소성 확인됨"   },
                  { Icon: Camera,   label: "사진 인증 확인",     desc: "판매자 제공 사진 검토 완료"     },
                  { Icon: FileText, label: "상태 설명 확인",     desc: "판매자 기재 상태 내용 확인됨"   },
                ].map(({ Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <CheckCircle2 size={16} strokeWidth={2} color="#16a34a" className="shrink-0" />
                    <div>
                      <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{label}</p>
                      <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button onClick={() => setDone(true)} className="rr-button-primary mb-2.5">
                구매 요청하기
              </button>
              <button onClick={onChat} className="rr-button-secondary">
                판매자에게 문의
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
