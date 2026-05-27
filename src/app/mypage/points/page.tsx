"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#D62828";

const HISTORY = [
  { id: 1, type: "적립", label: "리자몽 ex 거래 완료",    amount: +850,  balance: 1200, date: "2026.05.20" },
  { id: 2, type: "적립", label: "피카츄 ex 거래 완료",    amount: +420,  balance: 350,  date: "2026.05.14" },
  { id: 3, type: "사용", label: "꼬부기 ex 구매 시 사용", amount: -500,  balance: -70,  date: "2026.05.10" },
  { id: 4, type: "적립", label: "친구 초대 보상",          amount: +300,  balance: 430,  date: "2026.05.02" },
  { id: 5, type: "적립", label: "회원가입 축하 포인트",    amount: +130,  balance: 130,  date: "2026.04.28" },
];

export default function PointsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"전체" | "적립" | "사용">("전체");

  const visible = HISTORY.filter((h) => tab === "전체" || h.type === tab);
  const balance = 1200;
  const totalEarned = HISTORY.filter((h) => h.type === "적립").reduce((s, h) => s + h.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>포인트</h1>
      </header>

      {/* 잔액 카드 */}
      <div
        className="mx-4 mt-4 rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
      >
        <p className="text-white/60 text-xs mb-1" style={{ fontWeight: 400 }}>보유 포인트</p>
        <p className="text-white text-3xl" style={{ fontWeight: 800 }}>
          {balance.toLocaleString()}<span className="text-lg ml-1" style={{ fontWeight: 400 }}>P</span>
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-white/50 text-xs" style={{ fontWeight: 400 }}>
            누적 적립 {totalEarned.toLocaleString()}P · 1P = 1원
          </p>
          <button
            className="text-xs px-3 py-1.5 rounded-full text-white"
            style={{ background: "rgba(255,255,255,0.15)", fontWeight: 600 }}
          >
            사용하기
          </button>
        </div>
      </div>

      {/* 적립 안내 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">💡</span>
        <p className="text-xs text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>
          거래 완료 시 <span style={{ color: PRIMARY, fontWeight: 600 }}>거래금액의 1%</span>가 자동 적립돼요.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-4 mt-4">
        {(["전체", "적립", "사용"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: tab === t ? PRIMARY : "#f3f4f6",
              color: tab === t ? "#fff" : "#6b7280",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 내역 리스트 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl overflow-hidden mb-10">
        {visible.map((h, i) => (
          <div
            key={h.id}
            className={`flex items-center justify-between px-4 py-4 ${i < visible.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{h.label}</p>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>{h.date}</p>
            </div>
            <div className="text-right">
              <p
                className="text-sm"
                style={{ fontWeight: 700, color: h.type === "적립" ? "#10b981" : "#9ca3af" }}
              >
                {h.type === "적립" ? "+" : ""}{h.amount.toLocaleString()}P
              </p>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                잔액 {Math.abs(h.balance).toLocaleString()}P
              </p>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-4xl mb-3">💎</span>
            <p className="text-sm text-gray-400" style={{ fontWeight: 400 }}>내역이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
