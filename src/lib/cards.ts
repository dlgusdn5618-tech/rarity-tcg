// ── Types ─────────────────────────────────────────────────────────────────────
// Replace service functions with Supabase/API calls when backend is ready.

export type PassportData = {
  tcg: string; rarity: string; language: string; distribution: string;
  condition: string; grade: string; photoVerified: boolean; safeTrade: boolean;
  pricePosition: string; scarcity: string; cardId: string;
  photoSlots: Record<string, boolean>;
};

export type CardDetail = {
  apiId: string; name: string; nameKo: string; price: number;
  condition: string; category: string; views: number; likes: number;
  seller: string; sellerGrade: string; sellerTrades: number;
  sellerId?: string;
  desc: string; priceHistory: number[];
  tradeType: "parcel" | "half" | "direct" | "safe";
  avgPrice30d: number; sellerResponseTime: string;
  passport: PassportData;
};

export type SimilarCard = {
  id: number; name: string; grade: string; price: number;
};

export type CardEntry = {
  id: number; name: string; series: string; rarity: string;
  category: "포켓몬" | "원피스"; listings: number;
  minPrice: number; avgPrice: number; gradedCount: number;
  langDist: { lang: string; count: number }[];
  safeTrade: boolean; trend: number[];
  wishCount: number;
  createdAt: number;
  grades: string[];
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const CARD_DB: Record<string, CardDetail> = {
  "1": {
    apiId: "sv3pt5-183", nameKo: "리자몽 ex", name: "Charizard ex",
    price: 85000, condition: "S급", category: "포켓몬",
    views: 1240, likes: 320,
    seller: "포켓마스터", sellerGrade: "⭐ 우수판매자", sellerTrades: 247, sellerId: "pocketmaster",
    desc: "구입 후 슬리브 보관. 모서리·표면 흠집 전혀 없음. 직거래 가능(강남).",
    priceHistory: [72000, 75000, 78000, 76000, 82000, 85000],
    tradeType: "safe",
    avgPrice30d: 90500, sellerResponseTime: "보통 30분 내",
    passport: {
      tcg: "Pokemon", rarity: "SAR", language: "Japanese", distribution: "Booster Set",
      condition: "Near Mint", grade: "PSA 10", photoVerified: true, safeTrade: true,
      pricePosition: "30D Top 18%", scarcity: "Grail", cardId: "SV3pt5-183",
      photoSlots: { front: true, back: true, corner: true, glare: true, slab: true, slabnum: true },
    },
  },
  "2": {
    apiId: "sv3pt5-173", nameKo: "피카츄 ex", name: "Pikachu",
    price: 42000, condition: "A급", category: "포켓몬",
    views: 980, likes: 210,
    seller: "카드킹", sellerGrade: "⭐ 우수판매자", sellerTrades: 182, sellerId: "cardking",
    desc: "개봉 직후 슬리브 보관. 아주 미세한 표면 광택 차이 있으나 육안으로 식별 어려움.",
    priceHistory: [38000, 39000, 40000, 41000, 40000, 42000],
    tradeType: "parcel",
    avgPrice30d: 40000, sellerResponseTime: "보통 2시간 내",
    passport: {
      tcg: "Pokemon", rarity: "SAR", language: "English", distribution: "Booster Set",
      condition: "Excellent", grade: "Ungraded", photoVerified: false, safeTrade: false,
      pricePosition: "Fair Price", scarcity: "High", cardId: "SV3pt5-173",
      photoSlots: { front: true, back: true },
    },
  },
  "3": {
    apiId: "sv3pt5-205", nameKo: "뮤츠 ex", name: "Mew ex",
    price: 120000, condition: "S급", category: "포켓몬",
    views: 870, likes: 180,
    seller: "레어헌터", sellerGrade: "🔥 파워판매자", sellerTrades: 503, sellerId: "rarehunter",
    desc: "PSA 9 등급 상당 컨디션. 완전 민트. 하드케이스 보관 중.",
    priceHistory: [105000, 108000, 112000, 110000, 118000, 120000],
    tradeType: "safe",
    avgPrice30d: 115000, sellerResponseTime: "보통 1시간 내",
    passport: {
      tcg: "Pokemon", rarity: "UR", language: "Japanese", distribution: "Booster Set",
      condition: "Near Mint", grade: "Ungraded", photoVerified: true, safeTrade: true,
      pricePosition: "30D Top 5%", scarcity: "Grail", cardId: "SV3pt5-205",
      photoSlots: { front: true, back: true, corner: true },
    },
  },
};

const SIMILAR: SimilarCard[] = [
  { id: 2, name: "피카츄 ex", grade: "SAR", price: 42000  },
  { id: 3, name: "뮤츠 ex",   grade: "UR",  price: 120000 },
  { id: 5, name: "꼬부기 ex", grade: "SR",  price: 55000  },
];

const CARD_ENTRIES: CardEntry[] = [
  { id: 1,  name: "리자몽 ex",    series: "151",            rarity: "SAR", category: "포켓몬", listings: 12, minPrice: 85000,  avgPrice: 90500,  gradedCount: 2, langDist: [{ lang: "일본", count: 8  }, { lang: "한글", count: 4 }], safeTrade: true,  trend: [78, 82, 80, 88, 85], wishCount: 87, createdAt: 58, grades: ["PSA 10", "PSA 9"]            },
  { id: 2,  name: "피카츄 ex",    series: "151",            rarity: "SAR", category: "포켓몬", listings: 7,  minPrice: 42000,  avgPrice: 45000,  gradedCount: 0, langDist: [{ lang: "영어", count: 5  }, { lang: "일본", count: 2 }], safeTrade: false, trend: [46, 44, 43, 41, 42], wishCount: 63, createdAt: 33, grades: []                             },
  { id: 3,  name: "뮤츠 ex",      series: "151",            rarity: "UR",  category: "포켓몬", listings: 5,  minPrice: 120000, avgPrice: 115000, gradedCount: 1, langDist: [{ lang: "일본", count: 5  }],                            safeTrade: true,  trend: [110,112,118,116,120], wishCount: 45, createdAt: 27, grades: ["PSA 9"]                      },
  { id: 4,  name: "이상해꽃 ex",  series: "151",            rarity: "SR",  category: "포켓몬", listings: 9,  minPrice: 38000,  avgPrice: 41000,  gradedCount: 0, langDist: [{ lang: "한글", count: 6  }, { lang: "일본", count: 3 }], safeTrade: false, trend: [42, 40, 39, 38, 38], wishCount: 28, createdAt: 17, grades: []                             },
  { id: 5,  name: "꼬부기 ex",    series: "151",            rarity: "SR",  category: "포켓몬", listings: 6,  minPrice: 55000,  avgPrice: 58000,  gradedCount: 0, langDist: [{ lang: "일본", count: 4  }, { lang: "한글", count: 2 }], safeTrade: true,  trend: [51, 53, 54, 54, 55], wishCount: 31, createdAt: 21, grades: []                             },
  { id: 6,  name: "잠만보 ex",    series: "스칼렛·바이올렛", rarity: "SAR", category: "포켓몬", listings: 4,  minPrice: 67000,  avgPrice: 70000,  gradedCount: 1, langDist: [{ lang: "일본", count: 4  }],                            safeTrade: true,  trend: [62, 64, 66, 65, 67], wishCount: 19, createdAt: 11, grades: ["BGS 9.5"]                    },
  { id: 12, name: "뮤 ex",        series: "페어리킹덤",      rarity: "SAR", category: "포켓몬", listings: 8,  minPrice: 88000,  avgPrice: 92000,  gradedCount: 2, langDist: [{ lang: "일본", count: 6  }, { lang: "한글", count: 2 }], safeTrade: true,  trend: [84, 86, 90, 88, 88], wishCount: 52, createdAt: 14, grades: ["PSA 10", "BGS 9.5"]          },
  { id: 7,  name: "몽키 D. 루피", series: "OP-01",          rarity: "SAR", category: "원피스", listings: 15, minPrice: 95000,  avgPrice: 102000, gradedCount: 3, langDist: [{ lang: "일본", count: 10 }, { lang: "한글", count: 5 }], safeTrade: true,  trend: [88, 92, 96, 94, 95], wishCount: 94, createdAt: 47, grades: ["PSA 10", "PSA 9", "BGS 9.5"] },
  { id: 8,  name: "롤로노아 조로", series: "OP-01",          rarity: "SR",  category: "원피스", listings: 8,  minPrice: 67000,  avgPrice: 71000,  gradedCount: 1, langDist: [{ lang: "일본", count: 6  }, { lang: "한글", count: 2 }], safeTrade: false, trend: [64, 66, 64, 68, 67], wishCount: 37, createdAt: 40, grades: ["PSA 9"]                      },
  { id: 9,  name: "나미",          series: "OP-02",          rarity: "SR",  category: "원피스", listings: 5,  minPrice: 45000,  avgPrice: 47000,  gradedCount: 0, langDist: [{ lang: "일본", count: 3  }, { lang: "한글", count: 2 }], safeTrade: false, trend: [44, 45, 46, 45, 45], wishCount: 22, createdAt:  7, grades: []                             },
  { id: 10, name: "에이스",        series: "OP-02",          rarity: "UR",  category: "원피스", listings: 6,  minPrice: 130000, avgPrice: 128000, gradedCount: 2, langDist: [{ lang: "일본", count: 5  }, { lang: "한글", count: 1 }], safeTrade: true,  trend: [118,122,126,128,130], wishCount: 71, createdAt:  4, grades: ["PSA 10", "PSA 9"]            },
  { id: 11, name: "상디",          series: "OP-07",          rarity: "R",   category: "원피스", listings: 3,  minPrice: 22000,  avgPrice: 24000,  gradedCount: 0, langDist: [{ lang: "한글", count: 3  }],                            safeTrade: false, trend: [24, 23, 23, 22, 22], wishCount: 12, createdAt:  1, grades: []                             },
];

// ── Service functions ──────────────────────────────────────────────────────────

export function getCardById(id: string): CardDetail {
  return CARD_DB[id] ?? CARD_DB["1"];
}

export function getExploreCards(): CardEntry[] {
  return CARD_ENTRIES;
}

// _cardId reserved for future per-card similar items from API
export function getSimilarCards(_cardId: string): SimilarCard[] {
  return SIMILAR;
}

// ── Rarity Rankings ────────────────────────────────────────────────────────────

export type RankingCard = {
  id: number;
  rank: number;
  name: string;
  rarity: string;
  score: number;
  price: number;
  reason: string;
};

const RARITY_RANKINGS: RankingCard[] = [
  { id: 1, rank: 1, name: "리자몽 ex",    rarity: "SAR", score: 94, price: 85000,  reason: "희소성 높음 · 찜 급상승"   },
  { id: 7, rank: 2, name: "몽키 D. 루피", rarity: "SAR", score: 91, price: 95000,  reason: "매물 부족 · 거래량 증가"   },
  { id: 3, rank: 3, name: "뮤츠 ex",      rarity: "UR",  score: 88, price: 120000, reason: "가격 신뢰도 높음"          },
  { id: 2, rank: 4, name: "피카츄 ex",    rarity: "SAR", score: 82, price: 42000,  reason: "안전거래 비율 높음"        },
  { id: 4, rank: 5, name: "이상해꽃 ex",  rarity: "SR",  score: 76, price: 38000,  reason: "꾸준한 거래 신뢰"          },
];

// TODO: Replace with Supabase: supabase.from("rarity_rankings").select("*").order("rank").limit(10)
export function getRarityRankings(): RankingCard[] {
  return RARITY_RANKINGS;
}
