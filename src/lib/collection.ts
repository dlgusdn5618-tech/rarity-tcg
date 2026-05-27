/**
 * 내 컬렉션 금고 — 자산 관리 · 추천 로직
 *
 * 현재는 mock 데이터 기반. 실 서비스 연동 시 교체 포인트:
 *   - MOCK_COLLECTION  → Supabase "user_collection" 테이블 조회
 *   - currentPrice     → 실시간 시세 API (eBay, PSA 등)
 *   - getTradeMatches()→ 유저 매칭 API (상대방 교환 희망 카드)
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type CollectionCard = {
  /** DB id (Supabase row id 예정) */
  id: number;
  /** 카드 영문명 */
  name: string;
  /** 카드 한글명 */
  nameKo: string;
  /** 레어도 코드: "SAR" | "UR" | "SR" | "R" 등 */
  rarity: string;
  /** 상태: "S급" | "A급" | "B급" */
  condition: string;
  /** TCG 종류 */
  category: "포켓몬" | "원피스";
  /** 시리즈명 */
  series: string;
  /** 취득가 (구매 당시 가격) */
  acquiredPrice: number;
  /** 현재 시세 (실시간 API로 교체 예정) */
  currentPrice: number;
  /** 보유 수량 */
  quantity: number;
  /** 감정 여부 */
  isGraded: boolean;
  /** 감정 정보 (예: "PSA 10") — isGraded true 일 때만 */
  gradingInfo?: string;
  /** 판매 의사 */
  isForSale: boolean;
  /** 교환 의사 */
  isForTrade: boolean;
};

export type TradeMatch = {
  myCard: CollectionCard;
  /** 교환 희망 상대 카드명 */
  targetCardName: string;
  /** 상대 카드 레어도 */
  targetRarity: string;
  /** 교환 적정도 0–100 */
  matchScore: number;
  /** 내 카드 현재가 - 상대 카드 평균가 (양수 = 내가 더 비쌈) */
  priceDiff: number;
  /** 매칭된 상대 유저 핸들 */
  matchedUserHandle: string;
};

export type SellRecommendation = {
  card: CollectionCard;
  /** 판매 추천 이유 */
  reason: string;
  /** 추천 판매가 */
  suggestedPrice: number;
};

export type CollectionStats = {
  /** 총 현재가치 */
  totalValue: number;
  /** 총 취득가 */
  totalCost: number;
  /** 미실현 손익 (totalValue - totalCost) */
  unrealizedGain: number;
  /** 손익률 (%) — 소수점 1자리 */
  unrealizedGainPct: number;
  /** 보유 카드 총 수량 */
  cardCount: number;
  /** 고유 카드 종류 수 */
  uniqueCardCount: number;
  /** 수익률 1위 카드 */
  topGainer: CollectionCard | null;
  /** 손실률 1위 카드 */
  topLoser: CollectionCard | null;
};

// ── Mock 데이터 ───────────────────────────────────────────────────────────────

export const MOCK_COLLECTION: CollectionCard[] = [
  {
    id: 1,
    name: "Charizard ex",    nameKo: "리자몽 ex",
    rarity: "SAR", condition: "S급", category: "포켓몬", series: "151",
    acquiredPrice: 72000,  currentPrice: 85000,
    quantity: 2, isGraded: false, isForSale: true,  isForTrade: false,
  },
  {
    id: 2,
    name: "Pikachu ex",      nameKo: "피카츄 ex",
    rarity: "SAR", condition: "A급", category: "포켓몬", series: "151",
    acquiredPrice: 38000,  currentPrice: 42000,
    quantity: 1, isGraded: false, isForSale: false, isForTrade: true,
  },
  {
    id: 3,
    name: "Mewtwo ex",       nameKo: "뮤츠 ex",
    rarity: "UR",  condition: "S급", category: "포켓몬", series: "151",
    acquiredPrice: 120000, currentPrice: 120000,
    quantity: 1, isGraded: false, isForSale: false, isForTrade: false,
  },
  {
    id: 4,
    name: "Ace",             nameKo: "에이스",
    rarity: "UR",  condition: "S급", category: "원피스", series: "OP-02",
    acquiredPrice: 110000, currentPrice: 130000,
    quantity: 1, isGraded: false, isForSale: true,  isForTrade: false,
  },
  {
    id: 5,
    name: "Bulbasaur ex",    nameKo: "이상해꽃 ex",
    rarity: "SR",  condition: "B급", category: "포켓몬", series: "151",
    acquiredPrice: 45000,  currentPrice: 38000,
    quantity: 1, isGraded: false, isForSale: false, isForTrade: true,
  },
  {
    id: 6,
    name: "Monkey D. Luffy", nameKo: "몽키 D. 루피",
    rarity: "SAR", condition: "S급", category: "원피스", series: "OP-01",
    acquiredPrice: 88000,  currentPrice: 95000,
    quantity: 1, isGraded: false, isForSale: false, isForTrade: false,
  },
  {
    id: 7,
    name: "Squirtle ex",     nameKo: "꼬부기 ex",
    rarity: "SR",  condition: "A급", category: "포켓몬", series: "151",
    acquiredPrice: 58000,  currentPrice: 55000,
    quantity: 1, isGraded: false, isForSale: false, isForTrade: true,
  },
  {
    id: 8,
    name: "Mew ex",          nameKo: "뮤 ex",
    rarity: "SAR", condition: "S급", category: "포켓몬", series: "페어리킹덤",
    acquiredPrice: 78000,  currentPrice: 92000,
    quantity: 1, isGraded: true, gradingInfo: "PSA 10",
    isForSale: true, isForTrade: false,
  },
];

// ── 계산 함수 ─────────────────────────────────────────────────────────────────

/**
 * 컬렉션 전체 통계를 계산한다.
 *
 * 실거래 API 연동 시 교체 포인트:
 *   cards 파라미터를 Supabase 조회 결과로 교체하고,
 *   currentPrice를 실시간 시세 API 값으로 채운다.
 */
export function getCollectionStats(
  cards: CollectionCard[] = MOCK_COLLECTION,
): CollectionStats {
  const totalValue = cards.reduce((s, c) => s + c.currentPrice * c.quantity, 0);
  const totalCost  = cards.reduce((s, c) => s + c.acquiredPrice * c.quantity, 0);
  const unrealizedGain    = totalValue - totalCost;
  const unrealizedGainPct =
    totalCost > 0
      ? Math.round((unrealizedGain / totalCost) * 1000) / 10  // 소수점 1자리
      : 0;

  const cardCount       = cards.reduce((s, c) => s + c.quantity, 0);
  const uniqueCardCount = cards.length;

  const sortedByGain = [...cards].sort(
    (a, b) => gainRatio(b) - gainRatio(a),
  );

  return {
    totalValue,
    totalCost,
    unrealizedGain,
    unrealizedGainPct,
    cardCount,
    uniqueCardCount,
    topGainer: sortedByGain[0] ?? null,
    topLoser:  sortedByGain[sortedByGain.length - 1] ?? null,
  };
}

/**
 * 판매 추천 카드 목록 (수익률 15% 이상, 수익률 내림차순).
 *
 * 실거래 API 연동 시: 현재 활성 매물 가격 + 시장 트렌드를 반영해 임계값을 조정한다.
 */
export function getSellRecommendations(
  cards: CollectionCard[] = MOCK_COLLECTION,
): SellRecommendation[] {
  return cards
    .filter((c) => gainRatio(c) >= 0.15)
    .sort((a, b) => gainRatio(b) - gainRatio(a))
    .map((card) => {
      const ratio    = gainRatio(card);
      const pct      = Math.round(ratio * 100);
      const suggested = Math.round(card.currentPrice * 0.97);  // 시세 -3%로 빠른 판매
      return {
        card,
        reason:
          pct >= 25
            ? `취득가 대비 +${pct}% 상승. 지금이 매도 적기입니다.`
            : `취득가 대비 +${pct}% 상승. 이익 실현을 고려해보세요.`,
        suggestedPrice: suggested,
      };
    });
}

/**
 * 중복 보유 카드 (quantity > 1).
 * 실 서비스에서는 동일 카드명 + 레어도가 같은 항목을 묶어서 처리한다.
 */
export function getDuplicates(
  cards: CollectionCard[] = MOCK_COLLECTION,
): CollectionCard[] {
  return cards.filter((c) => c.quantity > 1);
}

/**
 * 교환 추천 매칭 목록.
 *
 * 실거래 API 연동 시 교체 포인트:
 *   /api/trade-match?cardIds=... 를 호출해 실제 유저 매칭 결과를 가져온다.
 */
export function getTradeMatches(
  cards: CollectionCard[] = MOCK_COLLECTION,
): TradeMatch[] {
  const tradeable = cards.filter((c) => c.isForTrade);

  const MOCK_MATCH_TABLE: Record<
    number,
    Omit<TradeMatch, "myCard">
  > = {
    2: {
      targetCardName:    "리자몽 ex SAR",
      targetRarity:      "SAR",
      matchScore:        92,
      priceDiff:         -43000,
      matchedUserHandle: "@포켓마스터",
    },
    5: {
      targetCardName:    "꼬부기 ex SR",
      targetRarity:      "SR",
      matchScore:        87,
      priceDiff:         17000,
      matchedUserHandle: "@불꽃트레이너",
    },
    7: {
      targetCardName:    "이상해꽃 ex SR",
      targetRarity:      "SR",
      matchScore:        83,
      priceDiff:         -17000,
      matchedUserHandle: "@카드킹덤",
    },
  };

  return tradeable.reduce<TradeMatch[]>((acc, card) => {
    const match = MOCK_MATCH_TABLE[card.id];
    if (match) acc.push({ myCard: card, ...match });
    return acc;
  }, []);
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

/** 카드 1장의 손익률 (0.18 = +18%) */
export function gainRatio(card: CollectionCard): number {
  if (card.acquiredPrice === 0) return 0;
  return (card.currentPrice - card.acquiredPrice) / card.acquiredPrice;
}

/** 카드 1장의 손익률을 % 정수로 (18 = +18%) */
export function gainPct(card: CollectionCard): number {
  return Math.round(gainRatio(card) * 100);
}

/** 카드 1장의 평가 손익 절대값 (quantity 포함) */
export function gainAbs(card: CollectionCard): number {
  return (card.currentPrice - card.acquiredPrice) * card.quantity;
}
