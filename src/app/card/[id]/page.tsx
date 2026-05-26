"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Shield, Share2, Heart, Eye, Package, Store, Users, ShieldCheck, type LucideIcon } from "lucide-react";

const PRIMARY = "#E53E3E";

const RARITY_KO: Record<string, string> = {
  "Common": "C",
  "Uncommon": "U",
  "Rare": "R",
  "Double Rare": "RR",
  "Ultra Rare": "SR",
  "Illustration Rare": "IR",
  "Special Illustration Rare": "SAR",
  "Hyper Rare": "UR",
};

type PassportData = {
  tcg: string; rarity: string; language: string; distribution: string;
  condition: string; grade: string; photoVerified: boolean; safeTrade: boolean;
  pricePosition: string; scarcity: string; cardId: string;
};

const RARITY_CHIP: Record<string, { bg: string; color: string }> = {
  TROPHY: { bg: "#111111", color: "#F6C90E" },
  SAR:    { bg: "#fff8e6", color: "#b45309" },
  UR:     { bg: "#f3e8ff", color: "#7c3aed" },
  PROMO:  { bg: "#eff6ff", color: "#2563eb" },
  SR:     { bg: "#fff5f5", color: "#dc2626" },
  IR:     { bg: "#f0fdfa", color: "#0d9488" },
  RR:     { bg: "#f8fafc", color: "#475569" },
};

const SCARCITY_COLOR: Record<string, string> = {
  Grail:  "#b45309",
  High:   "#2563eb",
  Rare:   "#0d9488",
  Common: "#9ca3af",
};

const TYPE_EMOJI: Record<string, string> = {
  Fire: "🔥", Water: "💧", Grass: "🌿", Lightning: "⚡",
  Psychic: "🔮", Fighting: "👊", Darkness: "🌑", Metal: "⚙️",
  Dragon: "🐉", Colorless: "⭐",
};

const CARD_DB: Record<string, {
  apiId: string; name: string; nameKo: string; price: number;
  condition: string; category: string; views: number; likes: number;
  seller: string; sellerGrade: string; sellerTrades: number;
  desc: string; priceHistory: number[];
  tradeType: "parcel" | "half" | "direct" | "safe";
  passport: PassportData;
}> = {
  "1": {
    apiId: "sv3pt5-183", nameKo: "리자몽 ex", name: "Charizard ex",
    price: 85000, condition: "S급", category: "포켓몬",
    views: 1240, likes: 320,
    seller: "포켓마스터", sellerGrade: "⭐ 우수판매자", sellerTrades: 247,
    desc: "구입 후 슬리브 보관. 모서리·표면 흠집 전혀 없음. 직거래 가능(강남).",
    priceHistory: [72000, 75000, 78000, 76000, 82000, 85000],
    tradeType: "safe",
    passport: {
      tcg: "Pokemon", rarity: "SAR", language: "Japanese", distribution: "Booster Set",
      condition: "Near Mint", grade: "PSA 10", photoVerified: true, safeTrade: true,
      pricePosition: "30D Top 18%", scarcity: "Grail", cardId: "SV3pt5-183",
    },
  },
  "2": {
    apiId: "sv3pt5-173", nameKo: "피카츄 ex", name: "Pikachu",
    price: 42000, condition: "A급", category: "포켓몬",
    views: 980, likes: 210,
    seller: "카드킹", sellerGrade: "⭐ 우수판매자", sellerTrades: 182,
    desc: "개봉 직후 슬리브 보관. 아주 미세한 표면 광택 차이 있으나 육안으로 식별 어려움.",
    priceHistory: [38000, 39000, 40000, 41000, 40000, 42000],
    tradeType: "parcel",
    passport: {
      tcg: "Pokemon", rarity: "SAR", language: "English", distribution: "Booster Set",
      condition: "Excellent", grade: "Ungraded", photoVerified: false, safeTrade: false,
      pricePosition: "Fair Price", scarcity: "High", cardId: "SV3pt5-173",
    },
  },
  "3": {
    apiId: "sv3pt5-205", nameKo: "뮤츠 ex", name: "Mew ex",
    price: 120000, condition: "S급", category: "포켓몬",
    views: 870, likes: 180,
    seller: "레어헌터", sellerGrade: "🔥 파워판매자", sellerTrades: 503,
    desc: "PSA 9 등급 상당 컨디션. 완전 민트. 하드케이스 보관 중.",
    priceHistory: [105000, 108000, 112000, 110000, 118000, 120000],
    tradeType: "safe",
    passport: {
      tcg: "Pokemon", rarity: "UR", language: "Japanese", distribution: "Booster Set",
      condition: "Near Mint", grade: "Ungraded", photoVerified: true, safeTrade: true,
      pricePosition: "30D Top 5%", scarcity: "Grail", cardId: "SV3pt5-205",
    },
  },
};

const CONDITION_INFO: Record<string, { color: string; bg: string; desc: string }> = {
  "S급": { color: "#D69E2E", bg: "#FFFFF0", desc: "완전 민트" },
  "A급": { color: "#3182CE", bg: "#EBF8FF", desc: "상태 양호" },
  "B급": { color: "#718096", bg: "#F7FAFC", desc: "사용감 있음" },
};

const TRADE_OPTIONS: { key: "parcel" | "half" | "direct" | "safe"; label: string; Icon: LucideIcon; desc: string }[] = [
  { key: "parcel", label: "택배",    Icon: Package,    desc: "일반 택배사" },
  { key: "half",   label: "반값택배", Icon: Store,      desc: "편의점 접수" },
  { key: "direct", label: "직거래",  Icon: Users,      desc: "직접 만남" },
  { key: "safe",   label: "안전거래", Icon: ShieldCheck, desc: "레어리티 보호" },
];

const SIMILAR = [
  { id: 2, name: "피카츄 ex",  grade: "SAR", price: 42000  },
  { id: 3, name: "뮤츠 ex",    grade: "UR",  price: 120000 },
  { id: 5, name: "꼬부기 ex",  grade: "SR",  price: 55000  },
];

type ApiSpec = {
  hp: string; types: string[]; evolvesFrom?: string;
  attacks: { name: string; damage: string; cost: string[] }[];
  weaknesses: { type: string; value: string }[];
  retreatCost: number; number: string; setName: string;
  setTotal: number; releaseDate: string; artist: string;
  regulationMark: string; rarity: string; image: string;
} | null;

function CardPassport({ name, nameKo, data }: { name: string; nameKo: string; data: PassportData }) {
  const chip = RARITY_CHIP[data.rarity] ?? { bg: "#f9fafb", color: "#6b7280" };
  const displayName = data.language === "Korean" ? nameKo : name;

  const row1 = [
    { label: "Language",  value: data.language     },
    { label: "Distrib.",  value: data.distribution },
    { label: "Grade",     value: data.grade        },
  ];
  const row2 = [
    { label: "Condition", value: data.condition,     accent: undefined                        },
    { label: "Market",    value: data.pricePosition, accent: undefined                        },
    { label: "Scarcity",  value: data.scarcity,      accent: SCARCITY_COLOR[data.scarcity]   },
  ];

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
      >
        <span className="text-[10px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "0.12em" }}>
          CARD PASSPORT
        </span>
        <span className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.08em" }}>
          RARITY ID
        </span>
      </div>

      {/* Card name + rarity chip */}
      <div
        className="flex items-start justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #f3f4f6" }}
      >
        <div>
          <p className="text-[9px] text-gray-400 uppercase mb-1" style={{ fontWeight: 500, letterSpacing: "0.1em" }}>
            Card Name
          </p>
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{displayName}</p>
        </div>
        <span
          className="text-[11px] px-2.5 py-1 rounded shrink-0 ml-3"
          style={{ background: chip.bg, color: chip.color, fontWeight: 700, border: `1px solid ${chip.color}33` }}
        >
          {data.rarity}
        </span>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
        {row1.map((f, i) => (
          <div
            key={f.label}
            className="px-3 py-3"
            style={{ borderRight: i < 2 ? "1px solid #f3f4f6" : "none" }}
          >
            <p className="text-[9px] text-gray-400 uppercase mb-1" style={{ fontWeight: 500, letterSpacing: "0.08em" }}>
              {f.label}
            </p>
            <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{f.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
        {row2.map((f, i) => (
          <div
            key={f.label}
            className="px-3 py-3"
            style={{ borderRight: i < 2 ? "1px solid #f3f4f6" : "none" }}
          >
            <p className="text-[9px] text-gray-400 uppercase mb-1" style={{ fontWeight: 500, letterSpacing: "0.08em" }}>
              {f.label}
            </p>
            <p className="text-xs" style={{ fontWeight: 600, color: f.accent ?? "#111111" }}>{f.value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
        {data.photoVerified && (
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 600, border: "1px solid #bbf7d0" }}
          >
            Photo Verified
          </span>
        )}
        {data.safeTrade && (
          <span
            className="text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ background: "#fff5f5", color: "#dc2626", fontWeight: 600, border: "1px solid #fecaca" }}
          >
            <Shield size={9} strokeWidth={2.5} />
            Safe Trade
          </span>
        )}
        {data.grade !== "Ungraded" && (
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: "#f9fafb", color: "#374151", fontWeight: 600, border: "1px solid #e5e7eb" }}
          >
            {data.grade}
          </span>
        )}
        <span
          className="text-[10px] px-2 py-0.5 rounded"
          style={{ background: chip.bg, color: chip.color, fontWeight: 600, border: `1px solid ${chip.color}33` }}
        >
          {data.rarity}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded"
          style={{ background: "#f9fafb", color: "#9ca3af", fontWeight: 400, border: "1px solid #e5e7eb", fontFamily: "monospace" }}
        >
          #{data.cardId}
        </span>
      </div>
    </div>
  );
}

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const card = CARD_DB[id] ?? CARD_DB["1"];
  const condition = CONDITION_INFO[card.condition];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(card.likes);
  const [tradeType, setTradeType] = useState(card.tradeType);
  const [spec, setSpec] = useState<ApiSpec>(null);
  const [specLoading, setSpecLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.pokemontcg.io/v2/cards/${card.apiId}`)
      .then((r) => r.json())
      .then((d) => {
        const c = d.data;
        setSpec({
          hp: c.hp,
          types: c.types ?? [],
          evolvesFrom: c.evolvesFrom,
          attacks: (c.attacks ?? []).map((a: { name: string; damage?: string; cost: string[] }) => ({
            name: a.name, damage: a.damage ?? "-", cost: a.cost,
          })),
          weaknesses: c.weaknesses ?? [],
          retreatCost: c.convertedRetreatCost ?? 0,
          number: c.number,
          setName: c.set.name,
          setTotal: c.set.total,
          releaseDate: c.set.releaseDate.replace(/\//g, "."),
          artist: c.artist ?? "-",
          regulationMark: c.regulationMark ?? "-",
          rarity: RARITY_KO[c.rarity] ?? c.rarity,
          image: c.images?.large ?? "",
        });
      })
      .catch(() => setSpec(null))
      .finally(() => setSpecLoading(false));
  }, [card.apiId]);

  const maxPrice = Math.max(...card.priceHistory);
  const minPrice = Math.min(...card.priceHistory);

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-28">

      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <span className="text-xl text-gray-700">←</span>
        </button>
        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>카드 상세</span>
        <button className="w-8 h-8 flex items-center justify-center">
          <Share2 size={18} color="#374151" strokeWidth={1.5} />
        </button>
      </header>

      {/* 카드 이미지 */}
      <div className="bg-white px-4 pt-5 pb-4">
        <div className="rounded-2xl h-60 flex items-center justify-center relative mb-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FFF5F5, #FED7D7)" }}>
          {spec?.image
            ? <img src={spec.image} alt={card.nameKo} className="h-52 object-contain drop-shadow-xl" />
            : (
              <div className="w-32 h-44 rounded-2xl bg-white shadow-md flex flex-col overflow-hidden border border-gray-100">
                <div className="h-3 w-full" style={{ background: PRIMARY }} />
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG CARD</span>
                </div>
                <div className="h-10 bg-gray-50 flex items-center justify-center border-t border-gray-100 px-2">
                  <span className="text-xs text-gray-500 text-center truncate" style={{ fontWeight: 700 }}>{card.nameKo}</span>
                </div>
              </div>
            )
          }
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-xs px-2 py-1 rounded-lg"
              style={{ background: condition.bg, color: condition.color, fontWeight: 700 }}>
              {spec ? spec.rarity : "..."}
            </span>
            <span className="text-xs bg-black/10 text-gray-700 px-2 py-1 rounded-lg" style={{ fontWeight: 500 }}>
              {card.category}
            </span>
          </div>
          <button onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
            <Heart
              size={18}
              strokeWidth={1.5}
              fill={liked ? PRIMARY : "none"}
              color={liked ? PRIMARY : "#374151"}
            />
          </button>
          <div className="absolute bottom-3 right-3 bg-black/20 rounded-full px-2 py-0.5">
            <div className="flex items-center gap-1 text-white text-[10px]">
              <Eye size={10} strokeWidth={2} color="white" />
              {card.views.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 이름 + 가격 */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 400 }}>
              {spec ? `${spec.setName} · ${spec.number}/${spec.setTotal}` : "불러오는 중..."}
            </p>
            <h1 className="text-xl text-gray-900 mb-1" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              {card.nameKo}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: condition.bg, color: condition.color, fontWeight: 600 }}>
              {card.condition} · {condition.desc}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>
              {card.price.toLocaleString()}<span className="text-sm" style={{ fontWeight: 400 }}>원</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
              <Heart size={10} strokeWidth={1.5} color="#9ca3af" />
              {likeCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Card Passport */}
      <div className="mx-4 mt-3">
        <CardPassport name={card.name} nameKo={card.nameKo} data={card.passport} />
      </div>

      {/* ① 거래 방식 선택 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>거래 방식</p>
        <div className="grid grid-cols-2 gap-2">
          {TRADE_OPTIONS.map((opt) => {
            const active = tradeType === opt.key;
            return (
              <button key={opt.key} onClick={() => setTradeType(opt.key)}
                className="flex flex-col items-center py-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: active ? PRIMARY : "#E5E7EB",
                  background: active ? "#FFF5F5" : "white",
                }}>
                <div className="mb-1">
                  <opt.Icon size={22} strokeWidth={1.5} color={active ? PRIMARY : "#6b7280"} />
                </div>
                <span className="text-xs" style={{ fontWeight: active ? 700 : 500, color: active ? PRIMARY : "#374151" }}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 text-center leading-tight" style={{ fontWeight: 400 }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ② 거래 방식 안내 배너 */}
      {tradeType === "parcel" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-blue-50">
          <Package size={22} strokeWidth={1.5} color="#2563eb" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>택배 거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              판매자가 하드케이스·뽁뽁이로 안전하게 포장 후 발송해요.
              발송 후 운송장 번호를 채팅으로 공유해드립니다.
            </p>
          </div>
        </div>
      )}
      {tradeType === "half" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-indigo-50">
          <Store size={22} strokeWidth={1.5} color="#4f46e5" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>반값택배 거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              CU·GS25 편의점에서 접수, 일반 택배보다 약 50% 저렴해요 (약 2,500~3,500원).
              CJ대한통운·로젠 반값택배 이용 가능합니다.
            </p>
          </div>
        </div>
      )}
      {tradeType === "direct" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3 bg-green-50">
          <Users size={22} strokeWidth={1.5} color="#16a34a" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>직거래</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              카페·편의점 등 공공장소에서 실물을 직접 확인 후 결제해요.
              채팅으로 장소와 시간을 조율해보세요.
            </p>
          </div>
        </div>
      )}
      {tradeType === "safe" && (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "linear-gradient(135deg, #FFF5F5, #FED7D7)" }}>
          <ShieldCheck size={22} strokeWidth={1.5} color={PRIMARY} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>레어리티 안전거래 적용 중</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ fontWeight: 400 }}>
              구매자가 카드를 받고 확인한 후 판매자에게 대금이 지급돼요.
              가품 판정 시 <span style={{ fontWeight: 700 }}>100% 환불</span>됩니다.
            </p>
          </div>
        </div>
      )}

      {/* ③ 카드 공식 스펙 (Pokemon TCG API) */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>카드 공식 스펙</p>
          <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md" style={{ fontWeight: 600 }}>
            Pokemon TCG 공식 데이터
          </span>
        </div>

        {specLoading ? (
          <div className="flex justify-center py-4">
            <span className="text-gray-400 text-sm animate-pulse">스펙 불러오는 중...</span>
          </div>
        ) : spec ? (
          <div className="space-y-0">
            {/* 기본 스펙 테이블 */}
            {[
              { label: "세트",     value: spec.setName },
              { label: "카드 번호", value: `${spec.number} / ${spec.setTotal}` },
              { label: "레어도",   value: spec.rarity },
              { label: "발매일",   value: spec.releaseDate },
              { label: "HP",      value: spec.hp },
              { label: "타입",     value: spec.types.map(t => `${TYPE_EMOJI[t] ?? ""} ${t}`).join(", ") },
              { label: "진화 전",  value: spec.evolvesFrom ?? "-" },
              { label: "약점",     value: spec.weaknesses.map(w => `${TYPE_EMOJI[w.type] ?? ""} ${w.type} ${w.value}`).join(", ") || "-" },
              { label: "후퇴 비용", value: `${spec.retreatCost}개` },
              { label: "레귤레이션", value: spec.regulationMark },
              { label: "일러스트", value: spec.artist },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 w-24 shrink-0" style={{ fontWeight: 500 }}>{label}</span>
                <span className="text-xs text-gray-800 text-right" style={{ fontWeight: 400 }}>{value}</span>
              </div>
            ))}

            {/* 기술 */}
            {spec.attacks.length > 0 && (
              <div className="pt-3">
                <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>기술</p>
                {spec.attacks.map((atk, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {atk.cost.slice(0, 4).map((c, j) => (
                          <span key={j} className="text-xs">{TYPE_EMOJI[c] ?? "⭐"}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{atk.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: PRIMARY, fontWeight: 700 }}>{atk.damage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-3">스펙 정보를 불러올 수 없어요</p>
        )}
      </div>

      {/* 시세 차트 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>최근 시세 흐름</p>
        <div className="flex items-end gap-1.5 h-14 mb-2">
          {card.priceHistory.map((price, i) => {
            const pct = ((price - minPrice) / (maxPrice - minPrice || 1)) * 100;
            const isLast = i === card.priceHistory.length - 1;
            return (
              <div key={i} className="flex-1 rounded-t-md transition-all"
                style={{ height: `${Math.max(pct, 15)}%`, minHeight: 8, background: isLast ? PRIMARY : "#FED7D7" }} />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>1개월 전</span><span>현재</span>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>최저 {minPrice.toLocaleString()}원</span>
          <span className="text-xs" style={{ color: PRIMARY, fontWeight: 600 }}>현재 {card.price.toLocaleString()}원</span>
        </div>
      </div>

      {/* 판매자 설명 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 700 }}>판매자 설명</p>
        <p className="text-sm text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{card.desc}</p>
      </div>

      {/* 판매자 정보 */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
            style={{ background: PRIMARY, fontWeight: 700 }}>
            {card.seller[0]}
          </div>
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{card.seller}</p>
            <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>
              {card.sellerGrade} · 거래 {card.sellerTrades}회
            </p>
          </div>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-xl border"
          style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 600 }}>
          판매자 보기
        </button>
      </div>

      {/* 비슷한 카드 */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>비슷한 카드</p>
          <button className="text-gray-400 text-sm">›</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2">
          {SIMILAR.map((c) => (
            <button key={c.id} onClick={() => router.push(`/card/${c.id}`)} className="shrink-0 w-24 text-left">
              <div className="bg-white rounded-xl h-24 flex items-center justify-center mb-1.5 border border-gray-100">
                <div className="w-12 h-[66px] rounded-lg bg-gray-50 flex flex-col overflow-hidden border border-gray-100">
                  <div className="h-1 w-full" style={{ background: PRIMARY }} />
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[8px] text-gray-200 select-none" style={{ fontWeight: 700 }}>TCG</span>
                  </div>
                  <div className="h-4 bg-gray-100 flex items-center justify-center">
                    <span className="text-[7px] text-gray-400" style={{ fontWeight: 600 }}>{c.grade}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{c.name}</p>
              <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>{c.grade}</p>
              <p className="text-xs mt-0.5" style={{ fontWeight: 700 }}>{c.price.toLocaleString()}원</p>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => router.push(`/exchange/propose?cardId=${id}&cardName=${encodeURIComponent(card.nameKo)}`)}
            className="flex-1 py-3 rounded-2xl border text-sm"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontWeight: 600 }}
          >
            ⇄ 교환 제안
          </button>
          <button className="flex-1 py-3 rounded-2xl border text-sm"
            style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 700 }}>
            채팅하기
          </button>
        </div>
        <button className="w-full py-3.5 rounded-2xl text-white text-sm"
          style={{ background: PRIMARY, fontWeight: 700 }}>
          바로 구매
        </button>
      </div>
    </div>
  );
}
