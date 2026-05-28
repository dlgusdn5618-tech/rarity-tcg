// ── Types ─────────────────────────────────────────────────────────────────────
// Replace service functions with Supabase/API calls when backend is ready.

export type SellerInfo = {
  name: string; handle: string; rating: number;
  reviewCount: number; tradeCount: number; responseTime: string;
};

export type Listing = {
  id: number; nameKo: string; rarity: string; condition: string;
  price: number; series: string; hasPhotoCert: boolean;
  hasSafeTrade: boolean; gradingInfo?: string;
};

export type SoldItem = {
  nameKo: string; rarity: string; price: number; ago: string; review: string;
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const SELLER_MAP: Record<string, SellerInfo> = {
  "rarity_user": { name: "레어리티유저", handle: "@rarity_user",   rating: 4.8, reviewCount: 23,  tradeCount: 18,  responseTime: "~30분"  },
  "pocketmaster": { name: "포켓마스터",  handle: "@pokemonmaster", rating: 4.9, reviewCount: 87,  tradeCount: 247, responseTime: "~30분"  },
  "cardking":     { name: "카드킹",      handle: "@cardking",      rating: 4.7, reviewCount: 45,  tradeCount: 182, responseTime: "~2시간" },
  "rarehunter":   { name: "레어헌터",    handle: "@rarehunter",    rating: 4.9, reviewCount: 120, tradeCount: 503, responseTime: "~1시간" },
};

const LISTINGS: Listing[] = [
  { id: 1, nameKo: "리자몽 ex",    rarity: "SAR", condition: "S급", price: 82000,  series: "151",        hasPhotoCert: true,  hasSafeTrade: true  },
  { id: 2, nameKo: "에이스",        rarity: "UR",  condition: "S급", price: 126000, series: "OP-02",      hasPhotoCert: true,  hasSafeTrade: true  },
  { id: 3, nameKo: "뮤 ex",        rarity: "SAR", condition: "S급", price: 89000,  series: "페어리킹덤",  hasPhotoCert: true,  hasSafeTrade: true, gradingInfo: "PSA 10" },
  { id: 4, nameKo: "피카츄 ex",    rarity: "SAR", condition: "A급", price: 40000,  series: "151",        hasPhotoCert: true,  hasSafeTrade: false },
  { id: 5, nameKo: "몽키 D. 루피", rarity: "SAR", condition: "S급", price: 92000,  series: "OP-01",      hasPhotoCert: true,  hasSafeTrade: true  },
];

const SOLD: SoldItem[] = [
  { nameKo: "뮤츠 ex",     rarity: "UR", price: 118000, ago: "3일 전",   review: "포장이 꼼꼼했어요"       },
  { nameKo: "꼬부기 ex",   rarity: "SR", price: 53000,  ago: "1주일 전", review: "설명과 동일한 상태였어요" },
  { nameKo: "이상해꽃 ex", rarity: "SR", price: 37000,  ago: "2주일 전", review: "상태 설명과 동일했어요"   },
];

// ── Service functions ──────────────────────────────────────────────────────────

export function getSellerById(sellerId: string): SellerInfo {
  return SELLER_MAP[sellerId] ?? SELLER_MAP["rarity_user"];
}

// _sellerId reserved for future per-seller listing queries from API
export function getSellerListings(_sellerId: string): Listing[] {
  return LISTINGS;
}

export function getSellerSoldItems(_sellerId: string): SoldItem[] {
  return SOLD;
}
