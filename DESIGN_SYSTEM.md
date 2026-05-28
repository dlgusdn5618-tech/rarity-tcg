# Rarity TCG — 디자인 시스템 v1

> 1단계 기반 정리 (2026-05). 전면 리디자인이 아니라 공통 토큰·유틸리티 클래스 기반을 만드는 작업이다.

---

## 브랜드 포인트 컬러

| 역할 | 값 | 사용 위치 |
|---|---|---|
| 메인 CTA / 강조 | `#D62828` (`--primary`) | 버튼, 배지, 선택 상태 |
| 포인트 강조 — 블랙 | `#111111` (`--accent`) | 최상위 점수, 랭킹 #1, 숫자 강조 |
| 포인트 강조 — 차콜 | `#1F2937` (`--accent-charcoal`) | 다크 컨테이너 |
| 포인트 강조 — 뮤트 | `#374151` (`--accent-muted`) | 보조 텍스트 강조 |

> **골드 `#F6C90E` 는 앱 포인트 컬러로 사용하지 않는다.**
> TROPHY 레어도 칩 텍스트처럼 레어도 의미를 가진 예외 케이스만 허용.

---

## 토큰 참조

- TypeScript: `import { PRIMARY, ACCENT_BLACK, RARITY_CHIP, SHADOW, NEUTRAL } from "@/lib/tokens"`
- CSS 변수: `var(--primary)`, `var(--accent)`, `var(--border)`, etc. (→ `globals.css :root`)

---

## rr-* 유틸리티 클래스 (globals.css)

Tailwind 대체가 아니라 반복되는 패턴을 줄이는 용도. `rr-` prefix 고정.

### 카드
| 클래스 | 설명 |
|---|---|
| `.rr-card` | 흰 표면, 1px border `#E4E4E7`, radius 16px, card shadow |
| `.rr-card-compact` | 동일하지만 radius 12px, subtle shadow |

### 섹션 헤더
| 클래스 | 설명 |
|---|---|
| `.rr-section-header` | flex, space-between, px-16px, mb-12px |
| `.rr-section-title` | 15px / 700 / `#18181B` |
| `.rr-section-subtitle` | 10px / 400 / `#A1A1AA`, mt-2px |

### 버튼
| 클래스 | 설명 |
|---|---|
| `.rr-button-primary` | 레드 CTA, w-full, py-14px, radius 16px, active opacity |
| `.rr-button-secondary` | 아웃라인 버튼, w-full, py-12px, radius 16px |
| `.rr-button-ghost` | 텍스트만, gray-400, 더보기 링크 용도 |

### 숫자 (tabular-nums 공통)
| 클래스 | 설명 |
|---|---|
| `.rr-price` | 가격 — fw 800, letter-spacing -0.3px |
| `.rr-score` | 점수 — fw 800, letter-spacing 0 |
| `.rr-metric` | 일반 지표 — fw 800, letter-spacing 0 |

### 배지
| 클래스 | 설명 |
|---|---|
| `.rr-badge` | 10px, fw 700, px-8px, radius 4px |
| `.rr-badge-rarity` | 9px, fw 700, px-6px, radius 4px |

---

## 반경 기준

| 값 | 용도 |
|---|---|
| 4px | 태그, 뱃지 |
| 8px | 인풋, 작은 버튼 |
| 12px | 미니 카드 (rr-card-compact) |
| 16px | 주요 카드, 버튼 (rr-card, rr-button-primary) |
| 20px | 바텀 시트, 모달 |
| 9999px | 알약형 버튼/칩 |

---

## 그림자 기준

| 값 | 용도 |
|---|---|
| `SHADOW.subtle` | 카드 내부 구분 |
| `SHADOW.card` | 카드 기본 (rr-card) |
| `SHADOW.float` | 플로팅 버튼 |
| `SHADOW.sheet` | 바텀 시트 |

---

## 레어도 칩 (변경 금지)

`RARITY_CHIP` — SAR/UR/SR/R 등 레어도별 bg+fg 색상은 고유 의미가 있으므로 디자인 시스템 작업에서 변경하지 않는다.

---

## 다른 페이지 적용 원칙

1. 섹션 헤더 → `.rr-section-header` + `.rr-section-title` 로 교체
2. 카드 형태 반복 컴포넌트 → `.rr-card` 또는 `.rr-card-compact`로 inline style 제거
3. 주요 CTA 버튼 → `.rr-button-primary`, 보조 → `.rr-button-secondary`
4. 가격/점수 숫자 → `.rr-price` / `.rr-score` / `.rr-metric`
5. 골드(`#F6C90E`) 발견 시 → `#111111` 또는 `var(--accent)`로 교체
6. 레이아웃 구조, 라우팅, mock 데이터, 기능 로직은 건드리지 않는다
