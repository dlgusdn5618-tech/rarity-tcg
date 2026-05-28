// ── Types ─────────────────────────────────────────────────────────────────────
// Replace service functions with Supabase/API calls when backend is ready.

export type SignalType = "price" | "newListing" | "trade" | "seller" | "wishlist" | "rare";

export type Signal = {
  id: number;
  type: SignalType;
  title: string;
  description: string;
  cardName: string;
  rarity: string;
  previousPrice?: number;
  currentPrice?: number;
  changePercent?: number;
  fitPercent?: number;
  extraCash?: string;
  chips: string[];
  actionLabel: string;
  actionHref: string;
  timeAgo: string;
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const SIGNALS: Signal[] = [
  {
    id: 1,
    type: "price",
    title: "피카츄 ex SAR이 목표가 이하로 내려갔어요",
    description: "찜한 카드의 새 매물이 설정가보다 낮게 등록됐어요.",
    cardName: "피카츄 ex",
    rarity: "SAR",
    previousPrice: 280000,
    currentPrice: 249000,
    changePercent: -11,
    chips: ["사진 인증", "안전거래"],
    actionLabel: "매물 보기",
    actionHref: "/card/1",
    timeAgo: "방금",
  },
  {
    id: 2,
    type: "newListing",
    title: "최근 본 리자몽 ex와 같은 카드가 등록됐어요",
    description: "Card Passport가 등록된 새 매물이에요.",
    cardName: "리자몽 ex",
    rarity: "SR",
    currentPrice: 85000,
    chips: ["Card Passport", "사진 인증"],
    actionLabel: "확인하기",
    actionHref: "/card/1",
    timeAgo: "3분 전",
  },
  {
    id: 3,
    type: "trade",
    title: "교환 적정도 87%인 매물이 있어요",
    description: "내 꼬부기 ex SR과 피카츄 ex SAR 교환 조건이 잘 맞아요.",
    cardName: "피카츄 ex",
    rarity: "SAR",
    fitPercent: 87,
    extraCash: "5,000원 내외",
    chips: ["교환 가능", "안전교환"],
    actionLabel: "교환 보기",
    actionHref: "/exchange/1",
    timeAgo: "12분 전",
  },
  {
    id: 4,
    type: "seller",
    title: "포켓마스터가 PSA 10 매물을 등록했어요",
    description: "팔로우한 셀러의 새 등록 카드입니다.",
    cardName: "뮤츠 ex",
    rarity: "UR",
    currentPrice: 210000,
    chips: ["PSA 10", "팔로우 셀러"],
    actionLabel: "셀러 보기",
    actionHref: "/mypage/shop?seller=pocketmaster",
    timeAgo: "28분 전",
  },
  {
    id: 5,
    type: "wishlist",
    title: "찜한 카드의 안전거래 매물이 추가됐어요",
    description: "이제 안전거래로 구매 가능한 매물이 있어요.",
    cardName: "에이스",
    rarity: "UR",
    currentPrice: 130000,
    chips: ["안전거래", "원피스"],
    actionLabel: "매물 보기",
    actionHref: "/card/2",
    timeAgo: "1시간 전",
  },
  {
    id: 6,
    type: "rare",
    title: "관심 태그 'SAR' 카드가 새로 등록됐어요",
    description: "저장한 관심 태그와 일치하는 희귀 매물이에요.",
    cardName: "뮤 ex",
    rarity: "SAR",
    currentPrice: 320000,
    chips: ["SAR", "일본판", "사진 인증"],
    actionLabel: "매물 보기",
    actionHref: "/card/2",
    timeAgo: "2시간 전",
  },
];

// ── Service functions ──────────────────────────────────────────────────────────

export function getFeedSignals(): Signal[] {
  return SIGNALS;
}
