"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const COUPONS = [
  {
    id: 1,
    title: "신규 가입 축하 쿠폰",
    discount: "3,000원",
    condition: "5만원 이상 구매 시",
    expiry: "2026.06.30",
    status: "사용 가능",
    color: "#E53E3E",
  },
  {
    id: 2,
    title: "첫 거래 완료 보상",
    discount: "5%",
    condition: "포켓몬 카드 구매 시 (최대 2,000원)",
    expiry: "2026.07.15",
    status: "사용 가능",
    color: "#F6C90E",
  },
  {
    id: 3,
    title: "안전거래 수수료 할인",
    discount: "50%",
    condition: "안전거래 수수료 1회 한정",
    expiry: "2026.05.01",
    status: "만료",
    color: "#9ca3af",
  },
  {
    id: 4,
    title: "친구 초대 리워드",
    discount: "2,000원",
    condition: "제한 없음",
    expiry: "2026.04.20",
    status: "사용 완료",
    color: "#9ca3af",
  },
];

export default function CouponsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"사용 가능" | "사용 완료">("사용 가능");

  const visible = COUPONS.filter((c) =>
    tab === "사용 가능" ? c.status === "사용 가능" : c.status !== "사용 가능"
  );

  const availableCount = COUPONS.filter((c) => c.status === "사용 가능").length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-700 text-xl p-1 -ml-1">‹</button>
        <h1 className="flex-1 text-base text-gray-900" style={{ fontWeight: 700 }}>쿠폰함</h1>
      </header>

      {/* 사용 가능 배너 */}
      <div
        className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #E53E3E, #C53030)" }}
      >
        <div>
          <p className="text-white/80 text-xs mb-0.5" style={{ fontWeight: 400 }}>사용 가능한 쿠폰</p>
          <p className="text-white text-2xl" style={{ fontWeight: 800 }}>{availableCount}장</p>
        </div>
        <span className="text-5xl opacity-20">🎟️</span>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-4 mt-4">
        {(["사용 가능", "사용 완료"] as const).map((t) => (
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

      {/* 쿠폰 목록 */}
      <div className="px-4 mt-4 flex flex-col gap-3 pb-10">
        {visible.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ opacity: coupon.status === "사용 가능" ? 1 : 0.5 }}
          >
            {/* 상단 컬러 바 + 할인 금액 */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: coupon.color }}
            >
              <div>
                <p className="text-white/80 text-xs" style={{ fontWeight: 400 }}>{coupon.title}</p>
                <p className="text-white text-2xl mt-0.5" style={{ fontWeight: 800 }}>{coupon.discount} 할인</p>
              </div>
              <span className="text-white/20 text-5xl">🎟️</span>
            </div>

            {/* 점선 구분 */}
            <div className="flex items-center px-4">
              <div className="w-4 h-4 rounded-full -ml-6" style={{ background: "#f3f4f6" }} />
              <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
              <div className="w-4 h-4 rounded-full -mr-6" style={{ background: "#f3f4f6" }} />
            </div>

            {/* 하단 조건 */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{coupon.condition}</p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                  만료일 {coupon.expiry}
                </p>
              </div>
              {coupon.status === "사용 가능" && (
                <span
                  className="text-white text-xs px-3 py-1.5 rounded-full"
                  style={{ background: PRIMARY, fontWeight: 600 }}
                >
                  사용하기
                </span>
              )}
              {coupon.status === "만료" && (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
                  만료됨
                </span>
              )}
              {coupon.status === "사용 완료" && (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
                  사용 완료
                </span>
              )}
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-4">🎟️</span>
            <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>쿠폰이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
