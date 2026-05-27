/**
 * 레어리티 인덱스 — 카드 희귀도 · 가격 신뢰도 점수 계산
 *
 * 현재는 규칙 기반 mock 계산. 실거래 API 연동 시 교체 포인트:
 *   calcRarityIndex() 내부에서 실시간 매물/체결 API를 호출하여
 *   listings, recentVolume, avgDiffPct를 실제 값으로 교체한다.
 */

// ── 입력 타입 ─────────────────────────────────────────────────────────────────

/**
 * calcRarityIndex에 필요한 최소 카드 데이터.
 * 기존 CARD_DB 엔트리에서 이 필드들만 pick해서 전달하면 된다.
 */
export type CardInputForScore = {
  /** 현재 판매 가격 */
  price: number;
  /** 30일 평균 시세 */
  avgPrice30d: number;
  /** 최근 가격 히스토리 (오래된 순 → 최신 순) */
  priceHistory: number[];
  passport: {
    /** 레어도 코드: "SAR" | "UR" | "SR" | "R" | "IR" | "RR" | "PROMO" | "TROPHY" */
    rarity: string;
    /** 희소성: "Grail" | "High" | "Rare" | "Common" */
    scarcity: string;
    /** 감정 등급: "PSA 10" | "PSA 9" | "BGS 9.5" | "Ungraded" 등 */
    grade: string;
    /** 사진 인증 여부 */
    photoVerified: boolean;
  };
  /** 현재 활성 매물 수 (없으면 8로 가정) */
  listings?: number;
};

// ── 출력 타입 ─────────────────────────────────────────────────────────────────

export type ScoreBreakdownItem = {
  /** 짧은 요인 이름 (예: "SAR 등급") */
  label: string;
  /** UI에 표시할 설명 문장 */
  reason: string;
  /** 이 요인의 기여 점수 (양수 = 가산, 음수 = 감산) */
  score: number;
  /** true면 긍정 아이콘, false면 주의 아이콘 */
  positive: boolean;
};

export type RarityIndexData = {
  /** 종합 레어리티 점수 0–100 */
  rarityScore: number;
  /** 가격 신뢰도 0–100. 거래량이 충분할수록 높아진다 */
  priceConfidence: number;
  /** 30일 추정 거래량 (체결 건수) */
  recentVolume: number;
  /** 현재가 vs 30일 평균 차이 (%). 음수 = 평균보다 저렴 */
  avgDiffPct: number;
  /** 시세 위치 한글 레이블 */
  pricePositionLabel: string;
  /** 점수 산출 근거 (최대 5개) */
  breakdown: ScoreBreakdownItem[];
};

// ── 점수 룩업 테이블 ───────────────────────────────────────────────────────────

const RARITY_BASE: Record<string, number> = {
  TROPHY: 40, SAR: 35, UR: 30, IR: 25,
  SR: 20, PROMO: 18, RR: 14, R: 10,
};

const RARITY_REASON: Record<string, string> = {
  TROPHY: "TROPHY 등급 — 국내 최상위 희귀도, 거의 시장에 등장하지 않음",
  SAR:    "SAR 등급 — 동일 세트 내 상위 2% 희귀도",
  UR:     "UR 등급 — 동일 세트 내 상위 5% 희귀도",
  IR:     "IR 등급 — Illustration Rare, 아트 희귀도 상위권",
  SR:     "SR 등급 — Super Rare, 인기 수집 대상",
  PROMO:  "PROMO — 이벤트·대회 한정 배포, 시장 유통량 제한",
  RR:     "RR 등급 — Double Rare",
  R:      "R 등급 — 일반 희귀",
};

const SCARCITY_BASE: Record<string, number> = {
  Grail: 25, High: 15, Rare: 10, Common: 3,
};

const SCARCITY_REASON: Record<string, string> = {
  Grail:  "Grail 희소성 — 시장에서 극히 드문 매물, 컬렉터 최상위 수요",
  High:   "High 희소성 — 매물 수가 제한적, 수요 대비 공급 부족",
  Rare:   "Rare 희소성 — 간헐적으로 거래되는 희귀 카드",
  Common: "Common 희소성 — 시장에 충분한 매물이 있어 구매 대기 불필요",
};

// ── 메인 계산 함수 ────────────────────────────────────────────────────────────

/**
 * 카드 데이터를 받아 RarityIndexData를 반환한다.
 *
 * 실거래 데이터 연동 시 교체할 부분:
 *   - listings  → 실시간 매물 수 API
 *   - recentVolume → 30일 체결 건수 API
 *   - avgDiffPct  → 실시간 평균가 API 기반 재계산
 */
export function calcRarityIndex(card: CardInputForScore): RarityIndexData {
  const { passport, price, avgPrice30d, priceHistory } = card;
  const listings = card.listings ?? 8;

  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  // ① 레어도 점수
  const rarityPts = RARITY_BASE[passport.rarity] ?? 10;
  breakdown.push({
    label:    `${passport.rarity} 등급`,
    reason:   RARITY_REASON[passport.rarity] ?? `${passport.rarity} 등급 카드`,
    score:    rarityPts,
    positive: true,
  });
  total += rarityPts;

  // ② 희소성 점수
  const scarcityPts = SCARCITY_BASE[passport.scarcity] ?? 5;
  breakdown.push({
    label:    `${passport.scarcity} 희소성`,
    reason:   SCARCITY_REASON[passport.scarcity] ?? "희소성 미분류",
    score:    scarcityPts,
    positive: scarcityPts >= 10,
  });
  total += scarcityPts;

  // ③ 감정 등급 보너스/패널티
  const g = passport.grade.toLowerCase();
  let gradePts = 0;
  if      (g.includes("10") && (g.includes("psa") || g.includes("bgs"))) gradePts = 15;
  else if (g.includes("9.5"))                                              gradePts = 12;
  else if ((g.includes("9") && !g.includes("9.5")) || g.includes("ace")) gradePts = 10;
  else if (g.includes("8"))                                                gradePts = 5;
  else if (g.includes("ungraded"))                                         gradePts = -6;

  if (gradePts !== 0) {
    const isPositive = gradePts > 0;
    breakdown.push({
      label:    isPositive ? passport.grade : "PSA 미등록",
      reason:   isPositive
        ? `${passport.grade} — 감정 등급 카드는 시세 프리미엄 20~40% 형성`
        : "PSA 미등록 — 감정 등록 시 시세 상승 여지 있음",
      score:    gradePts,
      positive: isPositive,
    });
    total += gradePts;
  }

  // ④ 거래량 점수
  const volumePts =
    listings >= 15 ? 8 :
    listings >= 10 ? 6 :
    listings >= 5  ? 4 :
    listings >= 2  ? 2 : 0;

  breakdown.push({
    label:    `매물 ${listings}개`,
    reason:   volumePts >= 6
      ? `매물 ${listings}개 — 활발한 거래로 시세 데이터 신뢰도 높음`
      : `매물 ${listings}개 — 거래량이 적어 시세 파악이 제한적`,
    score:    volumePts,
    positive: volumePts >= 4,
  });
  total += volumePts;

  // ⑤ 사진 인증 보너스
  if (passport.photoVerified) {
    breakdown.push({
      label:    "사진 인증",
      reason:   "사진 인증 완료 — 매물 신뢰도 상승으로 낙찰률 향상",
      score:    5,
      positive: true,
    });
    total += 5;
  }

  // 점수 클램프
  const rarityScore = Math.min(100, Math.max(0, total));

  // 가격 신뢰도: 거래량 + 히스토리 길이 기반 추정
  const priceConfidence = Math.min(98, Math.round(48 + listings * 2.8 + priceHistory.length * 2));

  // 30일 거래량 추정
  const recentVolume = Math.round(listings * 1.8);

  // 평균가 대비 % (현재가 기준)
  const avgDiffPct =
    avgPrice30d > 0
      ? Math.round(((price - avgPrice30d) / avgPrice30d) * 100)
      : 0;

  // 시세 위치 레이블
  const pricePositionLabel =
    avgDiffPct <= -15 ? "매우 저렴" :
    avgDiffPct <= -5  ? "평균 이하" :
    avgDiffPct >= 15  ? "평균 초과" :
    avgDiffPct >= 5   ? "약간 높음" : "평균 수준";

  return {
    rarityScore,
    priceConfidence,
    recentVolume,
    avgDiffPct,
    pricePositionLabel,
    breakdown,
  };
}
