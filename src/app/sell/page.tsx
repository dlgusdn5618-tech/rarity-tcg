"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Truck, Users, ShieldCheck, Search, Info, Camera, CheckCircle2, X, Sparkles, type LucideIcon } from "lucide-react";
import { type ScanResult } from "@/lib/scanner";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";

const PRIMARY = "#D62828";

const CONDITION_OPTIONS = [
  { key: "S",  label: "S급", desc: "완전 민트 · 개봉 직후 수준", color: "#D69E2E", bg: "#FFFFF0" },
  { key: "A",  label: "A급", desc: "상태 양호 · 미세 흠집 가능", color: "#3182CE", bg: "#EBF8FF" },
  { key: "B",  label: "B급", desc: "사용감 있음 · 흠집 있음",    color: "#718096", bg: "#F7FAFC" },
];

const TRADE_OPTIONS: { key: TradeKey; label: string; Icon: LucideIcon; sub: string }[] = [
  { key: "parcel", label: "택배",    Icon: Package,    sub: "일반 택배사" },
  { key: "half",   label: "반값택배", Icon: Truck,      sub: "편의점 접수" },
  { key: "direct", label: "직거래",  Icon: Users,      sub: "직접 만남" },
  { key: "safe",   label: "안전거래", Icon: ShieldCheck, sub: "레어리티 보호" },
];

const BASE_PHOTO_SLOTS = [
  { key: "front",        label: "앞면 전체",        required: true  },
  { key: "back",         label: "뒷면 전체",        required: true  },
  { key: "corner",       label: "네 모서리",        required: true  },
  { key: "glare",        label: "표면 빛 반사",     required: true  },
];
const GRADED_PHOTO_SLOTS = [
  { key: "slab",         label: "감정 케이스 전체",  required: true  },
  { key: "slabnum",      label: "감정번호 클로즈업", required: true  },
];
const SEALED_PHOTO_SLOTS = [
  { key: "boxfront",     label: "박스 앞면",         required: true  },
  { key: "boxback",      label: "박스 뒷면",         required: true  },
  { key: "seal",         label: "봉인씰",             required: true  },
  { key: "sealedcorner", label: "모서리 상태",        required: false },
];

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
  const slotTargetRef = useRef<string | null>(null);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<"포켓몬" | "원피스" | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null);
  const [searching, setSearching] = useState(false);
  const [slotPhotos, setSlotPhotos] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState("");
  const [tradeType, setTradeType] = useState<TradeKey>("parcel");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [isSealedProduct, setIsSealedProduct] = useState(false);
  const [gradingCo, setGradingCo] = useState("");
  const [grade, setGrade] = useState("10");
  const [scanBanner, setScanBanner] = useState(false);

  const GRADES: Record<string, string[]> = {
    PSA: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
    BGS: ["Black Label 10", "Pristine 10", "9.5", "9", "8.5", "8", "7.5", "7", "6.5", "6"],
    CGC: ["Pristine 10", "Gem Mint 10", "9.5", "9", "8.5", "8", "7.5", "7", "6.5", "6"],
    BRG: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
  };

  const handleGradingCo = (co: string) => {
    setGradingCo(co);
    setGrade(GRADES[co][0]);
  };

  const getGradeStyle = (co: string, g: string, selected: boolean) => {
    if (co === "BGS" && g === "Black Label 10") return {
      background: "#111111",
      color: "#F6C90E",
      border: "1.5px solid #111111",
      fontWeight: 700,
    };
    if (g === "Pristine 10") return {
      background: selected ? "#d97706" : "#fef3c7",
      color: selected ? "white" : "#d97706",
      border: "1.5px solid #d97706",
      fontWeight: 700,
    };
    if (co === "CGC" && g === "Gem Mint 10") return {
      background: selected ? "#3b82f6" : "#eff6ff",
      color: selected ? "white" : "#3b82f6",
      border: "1.5px solid #3b82f6",
      fontWeight: 700,
    };
    return {
      background: selected ? PRIMARY : "white",
      color: selected ? "white" : "#374151",
      border: `1.5px solid ${selected ? PRIMARY : "#e5e7eb"}`,
      fontWeight: selected ? 700 : 500,
    };
  };

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

  // ── scanResult sessionStorage 읽기 ──────────────────────────────────────────
  // /sell/scanner → "이 정보로 등록 계속하기" 버튼이 저장한 값을 읽어 상태에 반영
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const raw = sessionStorage.getItem("scanResult");
    if (!raw) return;
    sessionStorage.removeItem("scanResult");
    try {
      const result = JSON.parse(raw) as ScanResult;

      // 카테고리 자동 설정 (tcg → 포켓몬 | 원피스)
      const cat = result.tcg === "Pokemon" ? "포켓몬" : "원피스";
      setCategory(cat);

      // 검색창 표시 (이름만 설정, API 호출 없음)
      setSearchQuery(result.name);

      // 스캔 결과로 카드 초안을 즉시 설정 — 외부 API 의존 없이 canNext[1] 충족
      // setTotal: 0 → 표시 시 "/0" 생략 처리
      const cardNumber = result.cardId.includes("-")
        ? (result.cardId.split("-").pop() ?? result.cardId)
        : result.cardId;
      const syntheticCard: ApiCard = {
        id:      result.cardId,
        name:    result.name,
        number:  cardNumber,
        setName: result.series,
        setTotal: 0,
        rarity:  result.rarity,
      };
      setSelectedCard(syntheticCard);

      // 스캐너에서 채워진 슬롯을 "scanner" 마커로 반영 — uploadedCount 충족
      const filledSlots: Record<string, string> = {};
      for (const [k, v] of Object.entries(result.photoSlots)) {
        if (v) filledSlots[k] = "scanner";
      }
      if (Object.keys(filledSlots).length > 0) setSlotPhotos(filledSlots);

      // 감정 정보 반영
      if (result.isGraded && result.gradingCompany) {
        const supported = ["PSA", "BGS", "CGC", "BRG"];
        const co = supported.includes(result.gradingCompany) ? result.gradingCompany : "PSA";
        setIsGraded(true);
        setGradingCo(co);
        // "PSA 10" → "10", "9.5" → "9.5" 형태로 정규화
        const g = (result.grade ?? "10").replace(/^[A-Za-z]{2,4}\s+/, "").trim();
        setGrade(g || "10");
      }

      // 상태 추정 반영 (ConditionEstimate → "S" | "A" | "B")
      const condMap: Record<string, string> = {
        "Near Mint": "S", "Excellent": "A",
        "Light Played": "B", "Played": "B", "Poor": "B",
      };
      const mappedCond = condMap[result.condition];
      if (mappedCond) setCondition(mappedCond);

      // 설명 초안 반영
      if (result.descDraft) setDesc(result.descDraft);

      // 카테고리가 확정됐으므로 카드 선택 단계로 이동
      setStep(1);
      setScanBanner(true);
    } catch {
      console.warn("[ScanResult] sessionStorage 파싱 실패, 무시");
    }
  }, []);

  const handleSlotClick = (key: string) => {
    slotTargetRef.current = key;
    fileInputRef.current?.click();
  };

  const deleteSlotPhoto = (key: string) => {
    setSlotPhotos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = slotTargetRef.current;
    if (!key) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSlotPhotos((prev) => ({ ...prev, [key]: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

  const photoSlots = [
    ...BASE_PHOTO_SLOTS,
    ...(isGraded ? GRADED_PHOTO_SLOTS : []),
    ...(isSealedProduct ? SEALED_PHOTO_SLOTS : []),
  ];
  const uploadedCount = photoSlots.filter((s) => slotPhotos[s.key]).length;

  // 완료 화면
  if (done) {
    return (
      <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-28 rounded-xl flex flex-col overflow-hidden mx-auto mb-5" style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb" }}>
        <div className="h-3 w-full shrink-0" style={{ background: PRIMARY }} />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-gray-300 select-none" style={{ fontWeight: 700, letterSpacing: "0.1em" }}>TCG</span>
        </div>
      </div>
        <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>매물 등록 완료</h2>
        <p className="text-sm text-gray-500 mb-1" style={{ fontWeight: 400 }}>
          <span style={{ fontWeight: 700, color: "#111" }}>{selectedCard?.name}</span>이(가)<br />레어리티 컬렉터 마켓에 올라갔어요
        </p>
        <p className="text-xs text-gray-400 mb-8" style={{ fontWeight: 400 }}>
          PSA · PROMO · SAR 매물은 상단 노출 우선순위가 높아요
        </p>
        <button onClick={() => router.push("/")}
          className="rr-button-primary">
          홈으로 돌아가기
        </button>
        <button onClick={() => { setDone(false); setStep(0); setCategory(""); setSelectedCard(null); setSlotPhotos({}); setIsSealedProduct(false); setCondition(""); setPrice(""); setDesc(""); setIsGraded(false); setGradingCo(""); setGrade("10"); }}
          className="rr-button-secondary mt-2"
          style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
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
                { key: "포켓몬" as const, badge: "PKM", desc: "포켓몬 트레이딩 카드" },
                { key: "원피스" as const, badge: "OP",  desc: "원피스 카드 게임" },
              ].map((cat) => (
                <button key={cat.key} onClick={() => setCategory(cat.key)}
                  className="flex flex-col items-center py-8 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: category === cat.key ? PRIMARY : "#E5E7EB",
                    background: category === cat.key ? "#FFF5F5" : "white",
                  }}>
                  <div className="w-14 h-20 rounded-lg flex flex-col overflow-hidden mb-3" style={{ border: `1.5px solid ${category === cat.key ? PRIMARY : "#e5e7eb"}`, background: category === cat.key ? "#fff5f5" : "#f9fafb" }}>
                    <div className="h-2 w-full shrink-0" style={{ background: category === cat.key ? PRIMARY : "#e5e7eb" }} />
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs select-none" style={{ fontWeight: 700, color: category === cat.key ? PRIMARY : "#9ca3af", letterSpacing: "0.05em" }}>{cat.badge}</span>
                    </div>
                  </div>
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

            {/* AI 스캔 결과 반영 배너 */}
            {scanBanner && (
              <div
                className="flex items-start gap-2.5 px-3 py-3 rounded-2xl mb-4"
                style={{ background: "#EFF6FF", border: "1px solid #bfdbfe" }}
              >
                <Sparkles size={14} strokeWidth={2} color="#1D4ED8" className="shrink-0 mt-px" />
                <p className="flex-1 text-[11px] leading-relaxed" style={{ color: "#1e40af", fontWeight: 500 }}>
                  AI 스캔 결과가 등록 초안에 반영됐어요. 카드 정보와 상태를 한 번 더 확인해주세요.
                </p>
                <button
                  onClick={() => setScanBanner(false)}
                  className="shrink-0 p-0.5 rounded"
                >
                  <X size={13} strokeWidth={2} color="#93c5fd" />
                </button>
              </div>
            )}

            <p className="text-base text-gray-900 mb-1" style={{ fontWeight: 700 }}>카드를 검색해주세요</p>
            <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>
              이름, 한글명, 카드 품번 모두 검색 가능해요
            </p>

            {/* 사진으로 카드 찾기 CTA */}
            <button
              onClick={() => router.push("/sell/scanner")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-3"
              style={{ background: "#111827" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <Sparkles size={15} strokeWidth={2} color="#F6C90E" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-white" style={{ fontWeight: 700 }}>사진으로 카드 찾기</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.50)", fontWeight: 400 }}>
                    AI가 자동 인식 · 추정값이므로 확인 필요
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(246,201,14,0.15)", color: "#F6C90E", fontWeight: 600 }}>
                NEW
              </span>
            </button>

            {/* 검색 방법 안내 */}
            <div className="bg-gray-50 rounded-2xl p-3 mb-3 flex flex-col gap-1.5">
              {[
                { icon: "Aa", label: "영문 이름",  example: "Charizard ex, Pikachu",     tip: "가장 정확해요" },
                { icon: "가나", label: "한글 이름", example: "리자몽, 피카츄",              tip: "일부 검색 가능" },
                { icon: "#",  label: "카드 품번",  example: "183 · 183/207 · sv3pt5-183", tip: "가장 정확한 방법" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="text-[10px] w-6 text-center text-gray-400 shrink-0" style={{ fontWeight: 700 }}>{row.icon}</span>
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
              <Info size={15} color="#d97706" strokeWidth={1.5} className="shrink-0" />
              <p className="text-xs text-yellow-700" style={{ fontWeight: 400 }}>
                품번은 카드 <span style={{ fontWeight: 700 }}>우측 하단</span>에 적힌 숫자예요
                <span className="text-yellow-500"> (예: 183/207)</span>
              </p>
            </div>

            {/* 검색창 */}
            <div className="flex items-center bg-white rounded-xl px-3 py-3 gap-2 border-2 mb-3"
              style={{ borderColor: searchQuery ? PRIMARY : "#E5E7EB" }}>
              <Search size={16} color="#9ca3af" strokeWidth={1.5} className="shrink-0" />
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
                  {detectSearchMode(searchQuery) === "id" ? "품번 직접 조회" :
                   detectSearchMode(searchQuery) === "number" ? "품번 검색" : "이름 검색"}
                </span>
              </div>
            )}

            {/* 검색 중 스켈레톤 */}
            {searching && searchQuery.length > 0 && !selectedCard && (
              <LoadingState variant="list" rows={3} />
            )}

            {/* 검색 결과 없음 */}
            {!searching && searchResults.length === 0 && searchQuery.length > 1 && !selectedCard && (
              <EmptyState
                icon={<Search size={22} strokeWidth={1.5} color="#a1a1aa" />}
                title="검색 결과가 없어요"
                description="카드명이나 품번을 다시 확인해 주세요."
              />
            )}

            {/* 검색 결과 */}
            {searchResults.length > 0 && !selectedCard && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {searchResults.map((c, i) => (
                  <button key={c.id} onClick={() => { setSelectedCard(c); setSearchResults([]); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${i > 0 ? "border-t border-gray-50" : ""}`}>
                    {c.image
                      ? <img src={c.image} alt={c.name} className="w-10 h-14 object-contain rounded-lg shrink-0" />
                      : <div className="w-10 h-14 bg-gray-100 rounded-lg shrink-0 flex flex-col overflow-hidden">
                          <div className="h-1.5 w-full shrink-0" style={{ background: "#e5e7eb" }} />
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-[8px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
                          </div>
                        </div>
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
                    : <div className="w-14 h-20 bg-gray-100 rounded-xl flex flex-col overflow-hidden shrink-0">
                        <div className="h-2 w-full shrink-0" style={{ background: "#e5e7eb" }} />
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[9px] text-gray-300 select-none" style={{ fontWeight: 700 }}>TCG</span>
                        </div>
                      </div>
                  }
                  <div>
                    <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{selectedCard.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>
                      {selectedCard.setName}{selectedCard.number ? ` · ${selectedCard.number}${selectedCard.setTotal > 0 ? `/${selectedCard.setTotal}` : ""}` : ""}
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
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>카드 사진 가이드</p>
                <span className="text-[11px]" style={{ color: uploadedCount === photoSlots.length ? "#10b981" : "#9ca3af", fontWeight: 600 }}>
                  {uploadedCount} / {photoSlots.length}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>
                각 슬롯을 탭하여 촬영 부위에 맞는 사진을 등록하세요
              </p>

              {/* 미개봉 토글 */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 bg-white mb-3">
                <div>
                  <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>미개봉 상품</p>
                  <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>박스·봉인씰 사진 슬롯이 추가됩니다</p>
                </div>
                <button
                  onClick={() => setIsSealedProduct((v) => !v)}
                  className="w-11 h-6 rounded-full transition-all relative shrink-0"
                  style={{ background: isSealedProduct ? PRIMARY : "#E5E7EB" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: isSealedProduct ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                  />
                </button>
              </div>

              {/* 슬롯 그리드 */}
              <div className="grid grid-cols-2 gap-2">
                {photoSlots.map((slot, idx) => {
                  const src = slotPhotos[slot.key];
                  const isFirst = idx === 0;
                  return (
                    <div key={slot.key} className="relative">
                      {src && (src.startsWith("data:") || src.startsWith("http")) ? (
                        // 실제 업로드 이미지
                        <div className="relative rounded-xl overflow-hidden" style={{ height: 90 }}>
                          <img src={src} alt={slot.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                            <CheckCircle2 size={13} color="white" strokeWidth={2.5} />
                            <span className="text-[9px] text-white" style={{ fontWeight: 700 }}>{slot.label}</span>
                          </div>
                          <button
                            onClick={() => deleteSlotPhoto(slot.key)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                          >
                            <X size={10} color="white" strokeWidth={2.5} />
                          </button>
                          {isFirst && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>대표</span>
                          )}
                        </div>
                      ) : src === "scanner" ? (
                        // AI 스캔 마커 — X 버튼으로 실제 사진으로 교체 가능
                        <div
                          className="relative rounded-xl flex flex-col items-center justify-center gap-1"
                          style={{ height: 90, background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
                        >
                          <CheckCircle2 size={15} color="#16a34a" strokeWidth={2} />
                          <span className="text-[10px]" style={{ color: "#16a34a", fontWeight: 700 }}>{slot.label}</span>
                          <span className="text-[9px]" style={{ color: "#9ca3af", fontWeight: 400 }}>AI 스캔</span>
                          {isFirst && (
                            <span
                              className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}
                            >
                              대표
                            </span>
                          )}
                          <button
                            onClick={() => deleteSlotPhoto(slot.key)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            <X size={10} color="#9ca3af" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        // 빈 슬롯
                        <button
                          onClick={() => handleSlotClick(slot.key)}
                          className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 bg-white transition-all"
                          style={{ height: 90, borderColor: slot.required ? "#fca5a5" : "#e5e7eb" }}
                        >
                          <Camera size={18} color={slot.required ? "#fca5a5" : "#d1d5db"} strokeWidth={1.5} />
                          <span className="text-[10px] text-center leading-tight px-1" style={{ color: slot.required ? "#9ca3af" : "#d1d5db", fontWeight: slot.required ? 600 : 400 }}>
                            {slot.label}
                          </span>
                          {slot.required && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "#fff5f5", color: PRIMARY, fontWeight: 700 }}>필수</span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoAdd} />
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

            {/* 감정 카드 등급 */}
            <div
              className="rounded-2xl border-2 mb-6 overflow-hidden transition-all"
              style={{ borderColor: isGraded && gradingCo ? PRIMARY : "#E5E7EB", background: isGraded ? "#FFF5F5" : "white" }}
            >
              {/* 토글 행 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>감정 카드</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#fefce8", color: "#d97706", fontWeight: 600 }}>선택</span>
                  </div>
                  <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>PSA · BGS · CGC · BRG 슬랩 카드</span>
                </div>
                <button
                  onClick={() => { setIsGraded((v) => !v); setGradingCo(""); }}
                  className="w-11 h-6 rounded-full transition-all relative shrink-0"
                  style={{ background: isGraded ? PRIMARY : "#E5E7EB" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: isGraded ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                  />
                </button>
              </div>

              {/* 감정사 + 등급 (토글 ON 시) */}
              {isGraded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-red-100">
                  <p className="text-[11px] text-gray-400 mt-3" style={{ fontWeight: 500 }}>감정사 선택</p>
                  <div className="flex gap-2">
                    {["PSA", "BGS", "CGC", "BRG"].map((co) => (
                      <button
                        key={co}
                        onClick={() => handleGradingCo(co)}
                        className="flex-1 py-2 rounded-xl text-xs transition-all"
                        style={{
                          background: gradingCo === co ? PRIMARY : "white",
                          color: gradingCo === co ? "white" : "#374151",
                          border: `1.5px solid ${gradingCo === co ? PRIMARY : "#e5e7eb"}`,
                          fontWeight: gradingCo === co ? 700 : 500,
                        }}
                      >
                        {co}
                      </button>
                    ))}
                  </div>

                  {gradingCo && (
                    <>
                      <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>등급 선택</p>
                      <div className="flex flex-wrap gap-1.5">
                        {GRADES[gradingCo].map((g) => (
                          <button
                            key={g}
                            onClick={() => setGrade(g)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-all"
                            style={getGradeStyle(gradingCo, g, grade === g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-center py-2 rounded-xl" style={{ background: "white" }}>
                        <span className="text-sm" style={{ color: PRIMARY, fontWeight: 800 }}>{gradingCo} {grade}</span>
                        <span className="text-xs text-gray-400 ml-1.5" style={{ fontWeight: 400 }}>로 등록됩니다</span>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                  <opt.Icon size={22} strokeWidth={1.5} color={tradeType === opt.key ? PRIMARY : "#374151"} className="mb-1.5" />
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
                  <Package size={18} strokeWidth={1.5} color="#2563eb" className="shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                    발송 전 카드를 <span style={{ fontWeight: 700 }}>여러 각도로 촬영</span>해두세요.
                    하드케이스·뽁뽁이로 꼼꼼히 포장하고, 운송장 번호를 구매자에게 공유해주세요.
                  </p>
                </div>
              ),
              half: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2 bg-indigo-50">
                  <Truck size={18} strokeWidth={1.5} color="#4f46e5" className="shrink-0 mt-0.5" />
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
                  <Users size={18} strokeWidth={1.5} color="#16a34a" className="shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                    <span style={{ fontWeight: 700 }}>공공장소(카페, 편의점 등)</span>에서 만나 거래하세요.
                    구매자가 실물을 직접 확인 후 결제하는 가장 안전한 방법이에요.
                  </p>
                </div>
              ),
              safe: (
                <div className="mt-3 rounded-2xl p-3 flex items-start gap-2" style={{ background: "#FFF5F5" }}>
                  <ShieldCheck size={18} strokeWidth={1.5} color={PRIMARY} className="shrink-0 mt-0.5" />
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
                ["감정 등급", isGraded && gradingCo ? `${gradingCo} ${grade}` : "-"],
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
            className="rr-button-primary"
            style={{ opacity: canNext[step] ? 1 : 0.4 }}>
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canNext[3]}
            className="rr-button-primary"
            style={{ opacity: canNext[3] ? 1 : 0.4 }}>
            {submitting ? "등록 중..." : "카드 등록하기"}
          </button>
        )}
      </div>
    </div>
  );
}
