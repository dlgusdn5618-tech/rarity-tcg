/**
 * AI 카드 패스포트 스캐너 서비스
 *
 * 현재는 mock 구현. 실제 AI/OCR API로 교체할 때는
 *   callScannerAPI() 함수 내부만 수정하면 된다.
 * ScanInput / ScanResult 타입과 scanCard() 시그니처는 유지.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ScanSlotKey = "front" | "back" | "corner" | "glare" | "slab" | "slabnum";

/** scanCard()에 전달하는 입력. 각 슬롯은 data URL 또는 Blob URL. */
export type ScanInput = {
  slots: Partial<Record<ScanSlotKey, string>>;
};

export type ConditionEstimate =
  | "Near Mint"
  | "Excellent"
  | "Light Played"
  | "Played"
  | "Poor";

export type LanguageEstimate = "Japanese" | "Korean" | "English";

export type DistributionEstimate =
  | "Booster Set"
  | "Promo"
  | "Tournament Prize"
  | "Starter Deck"
  | "Special Set";

/** 스캐너가 반환하는 분석 결과 */
export type ScanResult = {
  /** 분석 신뢰도 0–100. 70 미만이면 수동 확인 안내 */
  confidence: number;
  /** 카드 영문명 */
  name: string;
  /** 카드 한글명 */
  nameKo: string;
  /** TCG 종류 */
  tcg: "Pokemon" | "One Piece";
  /** 시리즈명 */
  series: string;
  /** 공식 카드 ID (예: "SV3pt5-183") */
  cardId: string;
  /** 레어도 코드 */
  rarity: string;
  /** 언어판 */
  language: LanguageEstimate;
  /** 배포 방식 */
  distribution: DistributionEstimate;
  /** 상태 추정 */
  condition: ConditionEstimate;
  /** 감정카드 여부 */
  isGraded: boolean;
  /** 감정 회사 (isGraded === true 일 때만) */
  gradingCompany?: "PSA" | "BGS" | "CGC" | "ACE";
  /** 감정 등급 (isGraded === true 일 때만) */
  grade?: string;
  /** 각 슬롯의 분석 완료 여부 */
  photoSlots: Record<ScanSlotKey, boolean>;
  /** 이슈/개선 제안 메시지 목록 */
  warnings: string[];
  /** 자동 생성된 판매 설명 초안 */
  descDraft: string;
};

// ── 공개 API ──────────────────────────────────────────────────────────────────

/**
 * 카드 이미지를 분석해 ScanResult를 반환한다.
 *
 * @throws 슬롯이 하나도 없으면 Error
 *
 * 실제 AI API 연동 시 교체 포인트:
 *   callScannerAPI() 내부를 fetch("/api/scan", ...) 호출로 교체한다.
 */
export async function scanCard(input: ScanInput): Promise<ScanResult> {
  if (Object.keys(input.slots).length === 0) {
    throw new Error("스캔하려면 최소 1장의 사진이 필요합니다.");
  }
  // 실제 AI 처리 시간 시뮬레이션
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  return callScannerAPI(input);
}

// ── 유틸리티 ──────────────────────────────────────────────────────────────────

/** 신뢰도 숫자를 레이블 문자열로 변환 */
export function confidenceLabel(score: number): string {
  if (score >= 90) return "매우 높음";
  if (score >= 75) return "높음";
  if (score >= 60) return "보통";
  return "낮음 — 수동 확인 권장";
}

/** ConditionEstimate → 레어리티 앱 표기 (S/A/B급) */
export function conditionToGrade(c: ConditionEstimate): "S급" | "A급" | "B급" {
  if (c === "Near Mint")    return "S급";
  if (c === "Excellent")    return "A급";
  return "B급";
}

// ── AI API 교체 포인트 ────────────────────────────────────────────────────────
// 이 함수를 실제 Vision API 호출로 교체한다.
// 예시:
//   const res = await fetch("/api/scan", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(input),
//   });
//   return (await res.json()) as ScanResult;

async function callScannerAPI(input: ScanInput): Promise<ScanResult> {
  return buildMockResult(input);
}

// ── Mock 구현 ─────────────────────────────────────────────────────────────────

type CardTemplate = Omit<
  ScanResult,
  "confidence" | "photoSlots" | "warnings" | "descDraft"
  | "isGraded" | "gradingCompany" | "grade"
> & { descTemplate: string };

const CARD_TEMPLATES: CardTemplate[] = [
  {
    name: "Charizard ex",
    nameKo: "리자몽 ex",
    tcg: "Pokemon",
    series: "151",
    cardId: "SV3pt5-183",
    rarity: "SAR",
    language: "Japanese",
    distribution: "Booster Set",
    condition: "Near Mint",
    descTemplate:
      "구입 후 슬리브 보관. 모서리·표면 흠집 없음. 센터링 양호. 직거래 가능(강남/판교).",
  },
  {
    name: "Mew ex",
    nameKo: "뮤 ex",
    tcg: "Pokemon",
    series: "페어리킹덤",
    cardId: "SV6pt5-076",
    rarity: "SAR",
    language: "Japanese",
    distribution: "Booster Set",
    condition: "Near Mint",
    descTemplate:
      "미개봉 박스 뜯기 직후 슬리브 보관. 센터링 매우 양호. PSA 제출 예정.",
  },
  {
    name: "Mewtwo ex",
    nameKo: "뮤츠 ex",
    tcg: "Pokemon",
    series: "151",
    cardId: "SV3pt5-205",
    rarity: "UR",
    language: "Japanese",
    distribution: "Booster Set",
    condition: "Excellent",
    descTemplate:
      "개봉 후 하드케이스 보관. 표면 미세 광택 차이 있으나 육안 식별 어려움. NM 수준.",
  },
  {
    name: "Monkey D. Luffy",
    nameKo: "몽키 D. 루피",
    tcg: "One Piece",
    series: "OP-01",
    cardId: "OP01-060",
    rarity: "SAR",
    language: "Japanese",
    distribution: "Booster Set",
    condition: "Near Mint",
    descTemplate:
      "직수입 박스 오픈. 슬리브 즉시 보관. 표면·센터링 최상급. 안전거래 가능.",
  },
  {
    name: "Pikachu ex",
    nameKo: "피카츄 ex",
    tcg: "Pokemon",
    series: "151",
    cardId: "SV3pt5-173",
    rarity: "SAR",
    language: "English",
    distribution: "Booster Set",
    condition: "Excellent",
    descTemplate:
      "개봉 즉시 슬리브 보관. 아주 미세한 광택 차이 있음. 모서리 상태 양호.",
  },
];

function buildMockResult(input: ScanInput): ScanResult {
  const providedSlots = new Set(Object.keys(input.slots) as ScanSlotKey[]);
  const REQUIRED: ScanSlotKey[] = ["front", "back", "corner", "glare"];
  const coveredCount = REQUIRED.filter((s) => providedSlots.has(s)).length;

  // 신뢰도: 필수 슬롯 커버리지 비율에 따라 계산
  const confidence = Math.round(62 + (coveredCount / REQUIRED.length) * 26);

  // 감정 사진 여부
  const hasGraded = providedSlots.has("slab") || providedSlots.has("slabnum");

  // 앞면 사진이 있으면 첫 번째 템플릿(리자몽), 없으면 다른 카드로 시뮬레이션
  const templateIdx = providedSlots.has("front") ? 0 : 2;
  const template = CARD_TEMPLATES[templateIdx];

  const photoSlots: Record<ScanSlotKey, boolean> = {
    front:   providedSlots.has("front"),
    back:    providedSlots.has("back"),
    corner:  providedSlots.has("corner"),
    glare:   providedSlots.has("glare"),
    slab:    providedSlots.has("slab"),
    slabnum: providedSlots.has("slabnum"),
  };

  // 경고 메시지 생성 (누락 슬롯 기반)
  const warnings: string[] = [];
  if (!photoSlots.back)
    warnings.push("뒷면 사진이 없으면 구매자 신뢰도가 낮아질 수 있습니다.");
  if (!photoSlots.corner)
    warnings.push("모서리 사진이 없으면 정확한 상태 추정이 어렵습니다.");
  if (!photoSlots.glare)
    warnings.push("빛 반사 사진이 없어 표면 스크래치 여부를 확인할 수 없습니다.");
  if (confidence < 75)
    warnings.push("분석 신뢰도가 낮습니다. 카드 정보를 직접 확인해 주세요.");

  return {
    confidence,
    name:          template.name,
    nameKo:        template.nameKo,
    tcg:           template.tcg,
    series:        template.series,
    cardId:        template.cardId,
    rarity:        template.rarity,
    language:      template.language,
    distribution:  template.distribution,
    condition:     template.condition,
    isGraded:      hasGraded,
    gradingCompany: hasGraded ? "PSA" : undefined,
    grade:          hasGraded ? "PSA 10" : undefined,
    photoSlots,
    warnings,
    descDraft:     template.descTemplate,
  };
}
