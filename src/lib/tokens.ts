/**
 * Rarity TCG — Design Tokens
 * 단일 소스. 색상/반경/그림자는 여기서만 정의한다.
 * 페이지에서는 이 파일을 import하거나, globals.css의 CSS 변수를 참조한다.
 */

// ── Brand ─────────────────────────────────────────────────────────────────────

/** 메인 액션 컬러 — carmine red. 전 페이지 PRIMARY 상수의 원천. */
export const PRIMARY        = "#D62828";
/** 프레스/호버 상태 */
export const PRIMARY_DARK   = "#B01C1C";
/** 레드 계열 배경 틴트 */
export const PRIMARY_SURFACE = "#FFF1F1";

// ── Accent (포인트 강조 — 골드 #F6C90E 대체) ──────────────────────────────────
/** 숫자 강조, 랭킹 #1 배지, 최상위 점수 등 포인트 강조 */
export const ACCENT_BLACK    = "#111111";
/** 다크 컨테이너, 배너 배경 등 강한 대비 강조 */
export const ACCENT_CHARCOAL = "#1F2937";
/** 보조 버튼 텍스트, 보조 강조 */
export const ACCENT_MUTED    = "#374151";

// ── Rarity chips (bg + foreground text + border) ──────────────────────────────
// bg: 칩 배경, color: 텍스트, border: 위계 표현(크기 아닌 선명도로만)
// 모든 칩은 font-size·height·padding 동일. 위계는 border alpha로만 구분.

export const RARITY_CHIP: Record<string, { bg: string; color: string; border: string }> = {
  // ── Tier A: 최상위 — border alpha 55 (~33%) ────────────────────────────────
  TROPHY: { bg: "#111111", color: "#E5E7EB", border: "1px solid #374151"    },  // 다크 반전
  SAR:    { bg: "#FFFBEB", color: "#92400E", border: "1px solid #92400E55"  },  // 앰버 골드
  HR:     { bg: "#FFF8F0", color: "#C05621", border: "1px solid #C0562155"  },  // 딥 오렌지
  SEC:    { bg: "#FFFBEB", color: "#92400E", border: "1px solid #92400E55"  },  // 원피스 최상위
  // ── Tier B: 상위 — border alpha 38 (~22%) ─────────────────────────────────
  UR:     { bg: "#F3EEFF", color: "#6D28D9", border: "1px solid #6D28D938"  },  // 딥 바이올렛
  AR:     { bg: "#F0F4FF", color: "#3730A3", border: "1px solid #3730A338"  },  // 인디고
  CHR:    { bg: "#FCF4FF", color: "#7E22CE", border: "1px solid #7E22CE38"  },  // 바이올렛
  CSR:    { bg: "#FDF4FF", color: "#86198F", border: "1px solid #86198F38"  },  // 퍼플핑크
  SR:     { bg: "#FFF0F0", color: "#B91C1C", border: "1px solid #B91C1C38"  },  // 크림슨
  L:      { bg: "#F0F4FF", color: "#3730A3", border: "1px solid #3730A338"  },  // 원피스 리더
  // ── Tier C: 중간 — border alpha 25 (~15%) ─────────────────────────────────
  IR:     { bg: "#F0FDFA", color: "#0D9488", border: "1px solid #0D948825"  },  // 틸
  PROMO:  { bg: "#EFF6FF", color: "#1D4ED8", border: "1px solid #1D4ED825"  },  // 로얄 블루
  P:      { bg: "#EFF6FF", color: "#1D4ED8", border: "1px solid #1D4ED825"  },  // 원피스 프로모
  RR:     { bg: "#F8FAFC", color: "#475569", border: "1px solid #47556925"  },  // 슬레이트
  // ── Tier D: 기본 — border 중립 회색 고정 ──────────────────────────────────
  R:      { bg: "#F0F9FF", color: "#0369A1", border: "1px solid #E4E4E7"    },  // 스카이 블루
  U:      { bg: "#F9FAFB", color: "#6B7280", border: "1px solid #E4E4E7"    },  // 중립 회색
  C:      { bg: "#F9FAFB", color: "#9CA3AF", border: "1px solid #E4E4E7"    },  // 연회색
  UC:     { bg: "#F9FAFB", color: "#9CA3AF", border: "1px solid #E4E4E7"    },  // 원피스 언커먼
};

// ── Rarity stroke (TCG 카드 프레임 border/accent 색) ──────────────────────────

export const RARITY_STROKE: Record<string, string> = {
  SAR: "#B7791F",   // 앰버
  UR:  "#6D28D9",   // 딥 바이올렛
  SR:  "#B91C1C",   // 크림슨
  R:   "#1D4ED8",   // 블루
};

// ── Scarcity ──────────────────────────────────────────────────────────────────

export const SCARCITY_COLOR: Record<string, string> = {
  Grail:  "#92400E",   // 딥 앰버
  High:   "#1D4ED8",   // 블루
  Rare:   "#0D9488",   // 틸
  Common: "#9CA3AF",   // 그레이
};

// ── Semantic ──────────────────────────────────────────────────────────────────

export const SEMANTIC = {
  success:       "#10B981",
  successBg:     "#F0FDF4",
  successBorder: "#A7F3D0",
  warning:       "#D97706",
  warningBg:     "#FFFBEB",
  error:         "#EF4444",
  errorBg:       "#FEF2F2",
  info:          "#3B82F6",
  infoBg:        "#EFF6FF",
} as const;

// ── Neutrals ──────────────────────────────────────────────────────────────────

export const NEUTRAL = {
  /** 앱 최외곽 배경 (body) */
  bg:           "#FAFAFA",
  /** 카드/패널 표면 */
  surface:      "#FFFFFF",
  /** 섹션 구분 배경 */
  surfaceAlt:   "#F4F4F5",
  /** 기본 구분선 */
  border:       "#E4E4E7",
  /** 헤어라인 구분선 */
  borderMuted:  "#F4F4F5",

  textTitle:     "#18181B",   // 제목 (≈ gray-900 + 쿨톤)
  textBody:      "#3F3F46",   // 본문
  textSecondary: "#71717A",   // 보조
  textMuted:     "#A1A1AA",   // 플레이스홀더
} as const;

// ── Radius ────────────────────────────────────────────────────────────────────
// 일관된 radius 사용 기준:
//   xs(4px) — 태그/뱃지
//   sm(8px) — 인풋, 작은 버튼
//   md(12px) — 미니 카드, 칩 그룹
//   lg(16px) — 주요 카드/패널
//   xl(20px) — 바텀 시트, 모달
//   full     — 알약형 버튼/칩

export const RADIUS = {
  xs:   "4px",
  sm:   "8px",
  md:   "12px",
  lg:   "16px",
  xl:   "20px",
  full: "9999px",
} as const;

// ── Shadow ────────────────────────────────────────────────────────────────────
// 과한 그림자 대신 아주 얇은 border + subtle shadow 조합을 기본으로 한다.

export const SHADOW = {
  /** 거의 없는 그림자 — 카드 내부 구분 */
  subtle: "0 1px 2px rgba(0,0,0,0.05)",
  /** 카드 기본 그림자 */
  card:   "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  /** 플로팅 요소 */
  float:  "0 4px 12px rgba(0,0,0,0.08)",
  /** 바텀 시트 */
  sheet:  "0 -4px 16px rgba(0,0,0,0.10)",
} as const;
