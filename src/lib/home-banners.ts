// ── Types ──────────────────────────────────────────────────────────────────────

export type BannerType =
  | "new_drop"      // 신제품 발매 / 재입고
  | "price_signal"  // 가격 급등·급락 시그널
  | "trade_match"   // 교환 매칭 기회
  | "seller_pick"   // 인기 셀러 신규 입고
  | "safe_deal"     // 사진 인증·안전거래 매물 모음
  | "event";        // 플랫폼 이벤트·기획전

export type HomeBanner = {
  id: string;
  type: BannerType;

  // 표시 콘텐츠
  badge: string;           // 배지 라벨 ("NEW DROP", "PRICE SIGNAL" 등)
  title: string;           // 메인 타이틀 (\n 줄바꿈 가능)
  subtitle: string;        // 서브 텍스트

  // 스타일
  accentColor: string;     // 배지·강조 색상 (hex)
  backgroundFrom: string;  // 그라디언트 시작 색 (hex)
  backgroundTo: string;    // 그라디언트 종료 색 (hex)

  // 클릭 이동 경로 (없으면 다음 배너로 넘기기)
  targetHref?: string;

  // 정렬·스케줄링 (백엔드 연결 시 활성화)
  priority: number;        // 숫자 낮을수록 앞에 표시
  startsAt: string;        // ISO 8601 — 이 시각부터 노출
  endsAt: string;          // ISO 8601 — 이 시각 이후 제거

  // 메타
  source: "admin" | "auto"; // "admin": 관리자 등록, "auto": 시스템 자동 생성
  status: "active" | "draft" | "archived";
};

// ── Mock data ───────────────────────────────────────────────────────────────────

const MOCK_BANNERS: HomeBanner[] = [
  {
    id: "banner-001",
    type: "new_drop",
    badge: "NEW DROP",
    title: "151 시리즈\n재입고 확정",
    subtitle: "SAR 5종 포함 · 6월 7일 전국 발매",
    accentColor: "#D62828",
    backgroundFrom: "#1a1a2e",
    backgroundTo: "#0f0f1a",
    targetHref: "/explore?series=151",
    priority: 1,
    startsAt: "2026-05-28T00:00:00Z",
    endsAt: "2026-06-14T23:59:59Z",
    source: "admin",
    status: "active",
  },
  {
    id: "banner-002",
    type: "price_signal",
    badge: "PRICE SIGNAL",
    title: "루피 SAR\n거래량 급증",
    subtitle: "최근 48시간 매물 +32% · 평균가 상회",
    accentColor: "#F6C90E",
    backgroundFrom: "#1c1003",
    backgroundTo: "#100a00",
    targetHref: "/explore?series=OP-01",
    priority: 2,
    startsAt: "2026-05-28T00:00:00Z",
    endsAt: "2026-06-04T23:59:59Z",
    source: "auto",
    status: "active",
  },
  {
    id: "banner-003",
    type: "trade_match",
    badge: "TRADE MATCH",
    title: "내 카드로\n교환 매칭",
    subtitle: "직거래 · 보증금 안전교환",
    accentColor: "#3b82f6",
    backgroundFrom: "#0d1b2a",
    backgroundTo: "#060d14",
    targetHref: "/mypage/trades",
    priority: 3,
    startsAt: "2026-05-28T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    source: "admin",
    status: "active",
  },
  {
    id: "banner-004",
    type: "safe_deal",
    badge: "SAFE DEAL",
    title: "사진 인증\n매물 모음",
    subtitle: "Card Passport 등록 · 안전거래 가능",
    accentColor: "#10B981",
    backgroundFrom: "#061a12",
    backgroundTo: "#020e09",
    targetHref: "/explore",
    priority: 4,
    startsAt: "2026-05-28T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    source: "admin",
    status: "active",
  },
  {
    id: "banner-005",
    type: "seller_pick",
    badge: "SELLER PICK",
    title: "인기 셀러\n신규 입고",
    subtitle: "포켓마스터 · PSA 10 매물 5종 추가",
    accentColor: "#8B5CF6",
    backgroundFrom: "#130b1f",
    backgroundTo: "#0a0612",
    targetHref: "/mypage/shop?seller=pocketmaster",
    priority: 5,
    startsAt: "2026-05-28T00:00:00Z",
    endsAt: "2026-06-07T23:59:59Z",
    source: "auto",
    status: "active",
  },
];

// ── Service functions ────────────────────────────────────────────────────────────
// TODO: Replace with `fetch("/api/home-banners")` or
//       Supabase: `supabase.from("home_banners").select("*").eq("status","active").order("priority")`

export function getHomeBanners(): HomeBanner[] {
  const now = new Date().toISOString();
  return MOCK_BANNERS
    .filter((b) => b.status === "active" && b.startsAt <= now && b.endsAt >= now)
    .sort((a, b) => a.priority - b.priority);
}

// TODO: Replace with personalized query using userId
//       e.g. fetch(`/api/home-banners?userId=${userId}`) — 사용자 관심 태그·찜 카드 기반 필터
export function getPersonalizedHomeBanners(_userId?: string): HomeBanner[] {
  // 현재는 전체 배너와 동일. 백엔드 연결 시 사용자 맞춤 배너 반환으로 교체.
  return getHomeBanners();
}
