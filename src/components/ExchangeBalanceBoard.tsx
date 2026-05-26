"use client";

const PRIMARY = "#E53E3E";

export type ScarcityLevel = "Low" | "Medium" | "High" | "Grail";

export type BalanceCardData = {
  name: string;
  tcg: "Pokemon" | "One Piece";
  rarity: string;
  condition: string;
  gradingCompany: string;
  grade: string;
  recentPrice: number;
  scarcity: ScarcityLevel;
};

export type BalanceReport = {
  myCard: BalanceCardData;
  theirCard: BalanceCardData;
  extraCashRange: [number, number];
  extraCashPayer: "me" | "them" | "none";
  fitPercent: number;
  analysisNote: string;
};

const SCARCITY: Record<ScarcityLevel, { label: string; color: string }> = {
  Grail:  { label: "Grail",  color: "#111111" },
  High:   { label: "High",   color: "#2563eb" },
  Medium: { label: "Medium", color: "#d97706" },
  Low:    { label: "Low",    color: "#9ca3af" },
};

// ── Card column ───────────────────────────────────────────────────
function CardColumn({ card, side }: { card: BalanceCardData; side: "my" | "their" }) {
  const sc = SCARCITY[card.scarcity];
  const gradeText = card.gradingCompany !== "-"
    ? `${card.gradingCompany} ${card.grade}`
    : card.condition;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>
        {side === "my" ? "내 카드" : "상대 카드"}
      </p>

      {/* Card placeholder frame */}
      <div
        className="w-full rounded-xl flex flex-col items-center justify-end"
        style={{
          height: 92,
          background: "#f4f4f5",
          border: "1px solid #e9e9eb",
          paddingBottom: 8,
        }}
      >
        <p
          className="text-[10px] text-gray-600 text-center px-2 leading-snug"
          style={{ fontWeight: 700 }}
        >
          {card.name}
        </p>
        <p className="text-[9px] text-gray-400 text-center" style={{ fontWeight: 500 }}>
          {card.rarity}
        </p>
      </div>

      {/* Card info */}
      <div className="mt-2">
        <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 700 }}>{card.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
          {card.tcg} · {card.rarity}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontWeight: 500 }}>
          {gradeText}
        </p>
        <p className="text-xs mt-1.5" style={{ color: PRIMARY, fontWeight: 700 }}>
          {card.recentPrice.toLocaleString()}원
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: sc.color, fontWeight: 600 }}>
          희소성 {sc.label}
        </p>
      </div>
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────
function InfoRow({
  label, value, valueColor, highlighted,
}: {
  label: string; value: string; valueColor?: string; highlighted?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={highlighted ? {
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "8px 12px",
      } : undefined}
    >
      <p className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>{label}</p>
      <p
        className="text-[11px]"
        style={{ color: valueColor ?? "#111", fontWeight: highlighted ? 700 : 600 }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export function ExchangeBalanceBoard({
  report,
  onChat,
}: {
  report: BalanceReport;
  onChat?: () => void;
}) {
  const { myCard, theirCard, extraCashRange, extraCashPayer, fitPercent, analysisNote } = report;

  const priceDiff = myCard.recentPrice - theirCard.recentPrice;
  const total = myCard.recentPrice + theirCard.recentPrice;
  const myBarPct = Math.round((myCard.recentPrice / total) * 100);

  const fitBg    = fitPercent >= 85 ? "#f0fdf4" : fitPercent >= 70 ? "#fffbeb" : "#fff5f5";
  const fitColor = fitPercent >= 85 ? "#10b981" : fitPercent >= 70 ? "#d97706" : PRIMARY;

  const diffAbs  = Math.abs(priceDiff);
  const diffText =
    priceDiff === 0
      ? "균형"
      : priceDiff > 0
      ? `${diffAbs.toLocaleString()}원 · 내 카드 우위`
      : `${diffAbs.toLocaleString()}원 · 상대 카드 우위`;
  const diffColor = priceDiff === 0 ? "#10b981" : PRIMARY;

  const extraText =
    extraCashPayer === "none"
      ? "추가금 없이 동등 교환"
      : `${extraCashRange[0].toLocaleString()} ~ ${extraCashRange[1].toLocaleString()}원 (${extraCashPayer === "me" ? "내가 지급" : "상대방 지급"})`;

  const myGradeText =
    myCard.gradingCompany !== "-"
      ? `${myCard.gradingCompany} ${myCard.grade}`
      : myCard.condition;
  const theirGradeText =
    theirCard.gradingCompany !== "-"
      ? `${theirCard.gradingCompany} ${theirCard.grade}`
      : theirCard.condition;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #e5e7eb", background: "white" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}
      >
        <div>
          <p
            className="text-[9px] text-gray-400"
            style={{ fontWeight: 700, letterSpacing: "0.1em" }}
          >
            TRADE BALANCE
          </p>
          <p className="text-xs text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>
            교환 밸런스 분석
          </p>
        </div>
        <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl" style={{ background: fitBg }}>
          <span className="text-sm" style={{ color: fitColor, fontWeight: 800 }}>{fitPercent}%</span>
          <span className="text-[10px]" style={{ color: fitColor, fontWeight: 500 }}>적정</span>
        </div>
      </div>

      {/* ── Card comparison ── */}
      <div className="flex px-4 py-4" style={{ borderBottom: "1px solid #f3f4f6", gap: 10 }}>
        <CardColumn card={myCard} side="my" />
        <div className="self-stretch" style={{ width: 1, background: "#f0f0f0", marginTop: 22 }} />
        <CardColumn card={theirCard} side="their" />
      </div>

      {/* ── Balance bar ── */}
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
        <p className="text-[10px] text-gray-400 mb-2" style={{ fontWeight: 600 }}>시세 밸런스</p>
        <div className="flex rounded-full overflow-hidden" style={{ height: 7, gap: 1 }}>
          <div style={{ width: `${myBarPct}%`, background: "#111111", borderRadius: "99px 0 0 99px" }} />
          <div className="flex-1" style={{ background: "#e5e7eb", borderRadius: "0 99px 99px 0" }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <div>
            <p className="text-[10px]" style={{ color: "#111", fontWeight: 700 }}>
              {myCard.recentPrice.toLocaleString()}원
            </p>
            <p className="text-[9px] text-gray-400" style={{ fontWeight: 400 }}>{myBarPct}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500" style={{ fontWeight: 700 }}>
              {theirCard.recentPrice.toLocaleString()}원
            </p>
            <p className="text-[9px] text-gray-400" style={{ fontWeight: 400 }}>{100 - myBarPct}%</p>
          </div>
        </div>
      </div>

      {/* ── Summary rows ── */}
      <div
        className="px-4 py-3.5 flex flex-col gap-2.5"
        style={{ borderBottom: "1px solid #f3f4f6" }}
      >
        <InfoRow label="차액"       value={diffText}       valueColor={diffColor} />
        <InfoRow label="추가금 추천" value={extraText}      highlighted />
        <InfoRow
          label="상태 비교"
          value={`${myGradeText} vs ${theirGradeText}`}
          valueColor="#374151"
        />
      </div>

      {/* ── Analysis note ── */}
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <p className="text-[11px] text-gray-500" style={{ fontWeight: 400, lineHeight: 1.65 }}>
          {analysisNote}
        </p>
      </div>

      {/* ── CTA ── */}
      <div className="px-4 py-3">
        <button
          onClick={onChat}
          disabled={!onChat}
          className="w-full py-2.5 rounded-xl text-xs border transition-colors"
          style={{
            borderColor: onChat ? "#374151" : "#e5e7eb",
            color:       onChat ? "#374151" : "#9ca3af",
            fontWeight: 600,
            cursor: onChat ? "pointer" : "default",
            background: "white",
          }}
        >
          채팅에서 조율하기
        </button>
      </div>
    </div>
  );
}
