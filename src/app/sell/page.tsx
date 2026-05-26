"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#E53E3E";

const CONDITION_OPTIONS = [
  { key: "S",  label: "S급", desc: "완전 민트 · 개봉 직후 수준", color: "#D69E2E", bg: "#FFFFF0" },
  { key: "A",  label: "A급", desc: "상태 양호 · 미세 흠집 가능", color: "#3182CE", bg: "#EBF8FF" },
  { key: "B",  label: "B급", desc: "사용감 있음 · 흠집 있음",    color: "#718096", bg: "#F7FAFC" },
];

const TRADE_OPTIONS = [
  { key: "parcel", label: "택배",    icon: "📦", sub: "일반 택배사" },
  { key: "half",   label: "반값택배", icon: "🏪", sub: "편의점 접수" },
  { key: "direct", label: "직거래",  icon: "🤝", sub: "직접 만남" },
  { key: "safe",   label: "안전거래", icon: "🛡️", sub: "레어리티 보호" },
] as const;

const RARITY_KO: Record<string, string> = {
  "Common": "C", "Uncommon": "U", "Rare": "R", "Double Rare": "RR",
  "Ultra Rare": "SR", "Illustration Rare": "IR",
  "Special Illustration Rare": "SAR", "Hyper Rare": "UR",
};

type ApiCard = {
  id: string; name: string; number: string;
  setName: string; setTotal: number; rarity: string;
  hp?: string; types?: string[]; artist?: string; releaseDate?: string;
  image?: string;
};

type TradeKey = "parcel" | "half" | "direct" | "safe";

const STEPS = ["카테고리", "카드 선택", "상태·거래", "가격·설명"];

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<"포켓몬" | "원피스" | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null);
  const [searching, setSearching] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [tradeType, setTradeType] = useState<TradeKey>("parcel");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [isPsa, setIsPsa] = useState(false);
  const [psaGrade, setPsaGrade] = useState("10");

  // 입력값이 품번인지 감지
  // 품번 형식: "sv3pt5-183" / "183/207" / "183" (순수 숫자)
  const detectSearchMode = (q: string): "id" | "number" | "name" => {
    if (/^[a-z0-9]+-\d+$/i.test(q.trim())) return "id";       // sv3pt5-183
    if (/^\d+\/\d+$/.test(q.trim())) return "number";          // 183/207
    if (/^\d+$/.test(q.trim())) return "number";               // 183
    return "name";
  };

  const parseCard = (c: {
    id: string; name: string; number: string;
    set: { name: string; total: number; releaseDate: string };
    rarity?: string; hp?: string; types?: string[];
    artist?: string; images?: { small?: string };
  }): ApiCard => ({
    id: c.id, name: c.name, number: c.number,
    setName: c.set.name, setTotal: c.set.total,
    rarity: RARITY_KO[c.rarity ?? ""] ?? c.rarity ?? "-",
    hp: c.hp, types: c.types, artist: c.artist,
    releaseDate: c.set.releaseDate?.replace(/\//g, "."),
    image: c.images?.small,
  });

  const searchPokemonCard = async (q: string) => {
    if (q.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const mode = detectSearchMode(q);
      let url = "";

      if (mode === "id") {
        // 직접 ID 조회: sv3pt5-183
        url = `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(q.trim())}`;
        const res = await fetch(url);
        const data = await res.json();
        setSearchResults(data.data ? [parseCard(data.data)] : []);
        return;
      }

      if (mode === "number") {
        // 품번 조회: 183/207 또는 183
        const num = q.trim().split("/")[0];
        url = `https://api.pokemontcg.io/v2/cards?q=number:${num}&pageSize=8&orderBy=-set.releaseDate`;
      } else {
        // 이름 검색
        url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=8&orderBy=-set.releaseDate`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setSearchResults((data.data ?? []).map(parseCard));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target?.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1500);
  };

  const canNext = [
    category !== "",
    selectedCard !== null,
    condition !== "",
    price !== "" && Number(price) > 0,
  ];

  // 완료 화면
  if (done) {
    return (
      <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col items-center justify-center px-8 text-center">
        <div className="text-7xl mb-5">🎴</div>
        <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>매물 등록 완료</h2>
        <p className="text-sm text-gray-500 mb-1" style={{ fontWeight: 400 }}>
          <span style={{ fontWeight: 700, color: "#111" }}>{selectedCard?.name}</span>이(가)<br />레어리티 컬렉터 마켓에 올라갔어요
        </p>
        <p className="text-xs text-gray-400 mb-8" style={{ fontWeight: 400 }}>
          PSA · PROMO · SAR 매물은 상단 노출 우선순위가 높아요
        </p>
        <button onClick={() => router.push("/")}
          className="w-full py-4 rounded-2xl text-white text-sm"
          style={{ background: PRIMARY, fontWeight: 700 }}>
          홈으로 돌아가기
        </button>
        <button onClick={() => { setDone(false); setStep(0); setCategory(""); setSelectedCard(null); setPhotos([]); setCondition(""); setPrice(""); setDesc(""); setIsPsa(false); setPsaGrade("10"); }}
          className="w-full py-4 rounded-2xl border text-sm mt-2"
          style={{ borderColor: PRIMARY, color: PRIMARY, fontWeight: 600 }}>
          매물 추가 등록
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
          className="w-8 h-8 flex items-center justify-center">
          <span className="text-xl text-gray-700">←</span>
        </button>
        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>카드 등록</span>
        <div className="w-8" />
      </header>

      {/* 스텝 인디케이터 */}
      <div className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] mb-1 transition-all"
                  style={{
                    background: i < step ? PRIMARY : i === step ? PRIMARY : "#E5E7EB",
                    color: i <= step ? "white" : "#9CA3AF",
                    fontWeight: 700,
                  }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-[9px] text-center leading-tight"
                  style={{ color: i === step ? PRIMARY : "#9CA3AF", fontWeight: i === step ? 600 : 400 }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 mb-4 transition-all"
                  style={{ background: i < step ? PRIMARY : "#E5E7EB" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-32">

        {/* ── STEP 0: 카테고리 선택 ── */}
        {step === 0 && (
          <div>
            <p className="text-base text-gray-900 mb-1" style={{ fontWeight: 700 }}>매물을 등록할 카드를 선택하세요</p>
            <p className="text-xs text-gray-400 mb-5" style={{ fontWeight: 400 }}>카테고리를 먼저 선택해주세요</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "포켓몬" as const, emoji: "🔥", desc: "포켓몬 트레이딩 카드" },
                { key: "원피스" as const, emoji: "⚔️", desc: "원피스 카드 게임" },
              ].map((cat) => (
                <button key={cat.key} onClick={() => setCategory(cat.key)}
                  className="flex flex-col items-center py-8 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: category === cat.key ? PRIMARY : "#E5E7EB",
                    background: category === cat.key ? "#FFF5F5" : "white",
                  }}>
                  <span className="text-5xl mb-3">{cat.emoji}</span>
                  <span className="text-sm" style={{ fontWeight: 700, color: category === cat.key ? PRIMARY : "#111" }}>
                    {cat.key}
                  </span>
                  <span className="text-xs text-gray-400 mt-1" style={{ fontWeight: 400 }}>{cat.desc}</span>
                </button>
              ))}
            </div>

            {/* 희귀 카드 키워드 힌트 */}
            <div className="mt-4 px-3 py-3 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
              <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>희귀 카드도 모두 등록 가능해요</p>
              <div className="flex flex-wrap gap-1.5">
                {["PSA 10", "PSA 9", "PROMO", "SAR", "UR", "Trophy Card", "미개봉"].map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] px-2 py-0.5 rounded-lg"
                    style={{ background: "white", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 600 }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: 카드 검색 ── */}
        {step === 1 && (
          <div>
            <p className="text-base text-gray-900 mb-1" style={{ fontWeight: 700 }}>카드를 검색해주세요</p>
            <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>
              이름, 한글명, 카드 품번 모두 검색 가능해요
            </p>

            {/* 검색 방법 안내 */}
            <div className="bg-gray-50 rounded-2xl p-3 mb-3 flex flex-col gap-1.5">
              {[
                { icon: "🔤", label: "영문 이름",  example: "Charizard ex, Pikachu",    tip: "가장 정확해요" },
                { icon: "🇰🇷", label: "한글 이름",  example: "리자몽, 피카츄",             tip: "일부 검색 가능" },
                { icon: "🔢", label: "카드 품번",  example: "183 · 183/207 · sv3pt5-183", tip: "가장 정확한 방법" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{row.icon}</span>
                  <span className="text-xs text-gray-500 w-16 shrink-0" style={{ fontWeight: 600 }}>{row.label}</span>
                  <span className="text-xs text-gray-400 flex-1" style={{ fontWeight: 400 }}>{row.example}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: row.tip === "가장 정확한 방법" ? "#FFF5F5" : "#F3F4F6",
                             color: row.tip === "가장 정확한 방법" ? PRIMARY : "#6B7280", fontWeight: 600 }}>
                    {row.tip}
                  </span>
                </div>
              ))}
            </div>

            {/* 품번 위치 안내 이미지 대체 텍스트 */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
              <span className="text-base">💡</span>
              <p className="text-xs text-yellow-700" style={{ fontWeight: 400 }}>
                품번은 카드 <span style={{ fontWeight: 700 }}>우측 하단</span>에 적힌 숫자예요
                <span className="text-yellow-500"> (예: 183/207)</span>
              </p>
            </div>

            {/* 검색창 */}
            <div className="flex items-center bg-white rounded-xl px-3 py-3 gap-2 border-2 mb-3"
              style={{ borderColor: searchQuery ? PRIMARY : "#E5E7EB" }}>
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); searchPokemonCard(e.target.value); }}
                placeholder="이름 또는 품번 입력 (예: 183/207)"
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ fontWeight: 400 }}
              />
              {searching && <span className="text-xs animate-pulse" style={{ color: PRIMARY }}>검색 중...</span>}
              {searchQuery && !searching && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                  <span className="text-gray-300 text-sm">✕</span>
                </button>
              )}
            </div>

            {/* 검색 모드 뱃지 */}
            {searchQuery.length > 0 && !selectedCard && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>검색 방식:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: detectSearchMode(searchQuery) === "name" ? "#EBF8FF" : "#FFF5F5",
                    color: detectSearchMode(searchQuery) === "name" ? "#3182CE" : PRIMARY,
                    fontWeight: 600,
                  }}>
                  {detectSearchMode(searchQuery) === "id" ? "🎯 품번 직접 조회" :
                   detectSearchMode(searchQuery) === "number" ? "🔢 품번 검색" : "🔤 이름 검색"}
                </span>
              </div>
            )}

            {/* 검색 결과 */}
            {searchResults.length > 0 && !selectedCard && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {searchResults.map((c, i) => (
                  <button key={c.id} onClick={() => { setSelectedCard(c); setSearchResults([]); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${i > 0 ? "border-t border-gray-50" : ""}`}>
                    {c.image
                      ? <img src={c.image} alt={c.name} className="w-10 h-14 object-contain rounded-lg shrink-0" />
                      : <div className="w-10 h-14 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-xl">🎴</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                        {c.setName} · {c.number}/{c.setTotal}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg shrink-0"
                      style={{ background: "#FFF5F5", color: PRIMARY, fontWeight: 700 }}>
                      {c.rarity}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 선택된 카드 */}
            {selectedCard && (
              <div className="bg-white rounded-2xl border-2 p-4" style={{ borderColor: PRIMARY }}>
                <div className="flex items-center gap-3 mb-3">
                  {selectedCard.image
                    ? <img src={selectedCard.image} alt={selectedCard.name} className="w-14 h-20 object-contain rounded-xl" />
                    : <div className="w-14 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">🎴</div>
                  }
                  <div>
                    <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{selectedCard.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                      {selectedCard.setName} · {selectedCard.number}/{selectedCard.setTotal}
                    </p>
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: "#FFF5F5", color: PRIMARY, fontWeight: 700 }}>
                      {selectedCard.rarity}
                    </span>
                  </div>
                </div>
                {/* 자동 채워진 스펙 */}
                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-y-1.5">
                  {[
                    ["HP", selectedCard.hp ?? "-"],
                    ["타입", selectedCard.types?.join(", ") ?? "-"],
                    ["발매일", selectedCard.releaseDate ?? "-"],
                    ["일러스트", selectedCard.artist ?? "-"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{k} </span>
                      <span className="text-[10px] text-gray-700" style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setSelectedCard(null); setSearchQuery(""); }}
                  className="mt-2 text-xs text-gray-400 underline" style={{ fontWeight: 400 }}>
                  다시 검색
                </button>
              </div>
            )}

            {/* 사진 업로드 */}
            <div className="mt-4">
              <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                카드 사진 <span className="text-gray-400" style={{ fontWeight: 400 }}>(최대 5장)</span>
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center shrink-0 bg-white">
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-[10px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>사진 추가</span>
                </button>
                {photos.map((src, i) => (
                  <div key={i} className="relative shrink-0">
                    <img src={src} alt="" className="w-20 h-24 object-cover rounded-xl" />
                    <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✕</span>
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 rounded"
                        style={{ fontWeight: 600 }}>대표</span>
                    )}
                  </div>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
            </div>
          </div>
        )}

        {/* ── STEP 2: 상태 · 거래 방식 ── */}
        {step === 2 && (
          <div>
            {/* 카드 상태 */}
            <p className="text-base text-gray-900 mb-1" style={{ fontWeight: 700 }}>카드 상태</p>
            <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>실물 카드 상태를 정직하게 선택해주세요</p>
            <div className="flex flex-col gap-2 mb-6">
              {CONDITION_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => setCondition(opt.key)}
                  className="flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: condition === opt.key ? PRIMARY : "#E5E7EB",
                    background: condition === opt.key ? "#FFF5F5" : "white",
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                      style={{ background: opt.bg, color: opt.color, fontWeight: 800 }}>
                      {opt.label}
                    </span>
                    <span className="text-sm text-gray-500" style={{ fontWeight: 400 }}>{opt.desc}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: condition === opt.key ? PRIMARY : "#D1D5DB",
                      background: condition === opt.key ? PRIMARY : "white",
                    }}>
                    {condition === opt.key && <span className="text-white text-[10px]">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* PSA 등급 카드 */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl border-2 mb-6 transition-all"
              style={{ borderColor: isPsa ? PRIMARY : "#E5E7EB", background: isPsa ? "#FFF5F5" : "white" }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>PSA 등급 카드</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: "#fefce8", color: "#d97706", fontWeight: 600 }}
                  >
                    선택
                  </span>
                </div>
                <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>
                  PSA 슬랩 카드라면 등급을 표기하세요
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isPsa && (
                  <select
                    value={psaGrade}
                    onChange={(e) => setPsaGrade(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none"
                    style={{ border: `1.5px solid ${PRIMARY}`, color: PRIMARY, fontWeight: 700 }}
                  >
                    {["10", "9", "8", "7", "6", "5"].map((g) => (
                      <option key={g} value={g}>PSA {g}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => setIsPsa((v) => !v)}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{ background: isPsa ? PRIMARY : "#E5E7EB" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: isPsa ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                  />
                </button>
              </div>
            </div>

            {/* 거래 방식 */}
            <p className="text-base text-gray-900 mb-3" style={{ fontWeight: 700 }}>거래 방식</p>
            <div className="grid grid-cols-2 gap-2">
              {TRADE_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => setTradeType(opt.key)}
                  className="flex flex-col items-center py-4 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: tradeType === opt.key ? PRIMARY : "#E5E7EB",
                    background: tradeType === opt.key ? "#FFF5F5" : "white",
                  }}>
                  <span className="text-2xl mb-1.5">{opt.icon}</span>
                  <span className="text-xs" style={{ fontWeight: tradeType === opt.key ? 700 : 600, color: tradeType === opt.key ? PRIMARY : "#374151" }}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: tradeType === opt.key ? PRIMARY : "#9CA3AF", fontWeight: 400 }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* 거래 방식 설명 */}
            {{
              parcel: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2 bg-blue-50">
                  <span className="text-lg shrink-0">📦</span>
                  <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                    발송 전 카드를 <span style={{ fontWeight: 700 }}>여러 각도로 촬영</span>해두세요.
                    하드케이스·뽁뽁이로 꼼꼼히 포장하고, 운송장 번호를 구매자에게 공유해주세요.
                  </p>
                </div>
              ),
              half: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2 bg-indigo-50">
                  <span className="text-lg shrink-0">🏪</span>
                  <div>
                    <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 700 }}>CU·GS25 편의점</span>에서 접수하는 반값 배송이에요.
                      일반 택배 대비 <span style={{ fontWeight: 700 }}>약 50% 저렴</span>하고 (약 2,500~3,500원),
                      소액 카드 거래에 적합해요.
                    </p>
                    <p className="text-[10px] text-indigo-400 mt-1.5" style={{ fontWeight: 500 }}>
                      * CJ대한통운 · 로젠 반값택배 이용 가능
                    </p>
                  </div>
                </div>
              ),
              direct: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2 bg-green-50">
                  <span className="text-lg shrink-0">🤝</span>
                  <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                    <span style={{ fontWeight: 700 }}>공공장소(카페, 편의점 등)</span>에서 만나 거래하세요.
                    구매자가 실물을 직접 확인 후 결제하는 가장 안전한 방법이에요.
                  </p>
                </div>
              ),
              safe: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2" style={{ background: "#FFF5F5" }}>
                  <span className="text-lg shrink-0">🛡️</span>
                  <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                    구매자가 카드를 받고 확인한 후 판매자에게 대금이 지급돼요.
                    가품 판정 시 <span style={{ fontWeight: 700 }}>100% 환불</span>됩니다.
                  </p>
                </div>
              ),
            }[tradeType]}
          </div>
        )}

        {/* ── STEP 3: 가격 · 설명 ── */}
        {step === 3 && (
          <div>
            {/* 가격 입력 */}
            <p className="text-base text-gray-900 mb-1" style={{ fontWeight: 700 }}>판매 가격</p>
            <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>희망 판매가를 입력해주세요</p>
            <div className="bg-white rounded-2xl border-2 px-4 py-4 flex items-center gap-2 mb-2"
              style={{ borderColor: price ? PRIMARY : "#E5E7EB" }}>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="flex-1 text-2xl outline-none bg-transparent"
                style={{ fontWeight: 800, color: price ? "#111" : "#9CA3AF" }}
              />
              <span className="text-lg text-gray-500" style={{ fontWeight: 500 }}>원</span>
            </div>
            {price && (
              <p className="text-xs text-right mb-4" style={{ color: PRIMARY, fontWeight: 500 }}>
                수수료 5% 적용 시 실수령 {Math.floor(Number(price) * 0.95).toLocaleString()}원
              </p>
            )}

            {/* 설명 입력 */}
            <p className="text-base text-gray-900 mb-1 mt-5" style={{ fontWeight: 700 }}>카드 설명</p>
            <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>보관 방법, 구입 시기, 직거래 지역 등</p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={"예) 구입 후 슬리브 보관.\n직거래 강남 가능합니다."}
              rows={5}
              className="w-full bg-white rounded-2xl border-2 px-4 py-3 text-sm outline-none resize-none"
              style={{
                borderColor: desc ? PRIMARY : "#E5E7EB",
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            />
            <p className="text-right text-xs text-gray-400 mt-1" style={{ fontWeight: 400 }}>
              {desc.length} / 500자
            </p>

            {/* 등록 전 요약 */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>등록 정보 확인</p>
              {[
                ["카드", selectedCard?.name ?? "-"],
                ["레어도", selectedCard?.rarity ?? "-"],
                ["PSA 등급", isPsa ? `PSA ${psaGrade}` : "-"],
                ["상태", condition ? condition + "급" : "-"],
                ["거래", TRADE_OPTIONS.find(t => t.key === tradeType)?.label ?? "-"],
                ["가격", price ? Number(price).toLocaleString() + "원" : "-"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400" style={{ fontWeight: 500 }}>{k}</span>
                  <span className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-4 py-3">
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext[step]}
            className="w-full py-4 rounded-2xl text-white text-sm transition-opacity"
            style={{
              background: PRIMARY,
              fontWeight: 700,
              opacity: canNext[step] ? 1 : 0.4,
            }}>
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canNext[3]}
            className="w-full py-4 rounded-2xl text-white text-sm transition-opacity"
            style={{
              background: PRIMARY,
              fontWeight: 700,
              opacity: canNext[3] ? 1 : 0.4,
            }}>
            {submitting ? "등록 중..." : "카드 등록하기 🎴"}
          </button>
        )}
      </div>
    </div>
  );
}
