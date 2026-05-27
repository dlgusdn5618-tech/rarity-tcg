@AGENTS.md

# 레어리티 (Rarity) — 프로젝트 진행 현황

## 앱 개요
- 포켓몬 + 원피스 트레이딩 카드 거래 플랫폼
- GitHub: https://github.com/dlgusdn5618-tech/rarity-tcg
- 스택: Next.js + TypeScript + Tailwind CSS
- 수익 모델: 거래 수수료 7% + 안전거래 수수료 3%

## 컬러 / 디자인
- Primary: #E53E3E (포켓몬 레드)
- Accent: #F6C90E (피카츄 옐로우)
- 폰트: Noto Sans KR (300~900)
- 하단 네비 활성: #111111 (검정), 비활성: #9ca3af (회색)
- 하단 네비 아이콘: lucide-react (Home, Search, Sparkles, MessageCircle, User)

## 완료된 화면 ✅
1. **홈 (/)** — 탭(홈/포켓몬/원피스), 랭킹 마퀴, 히어로 배너, 최근 카드, 카드 소식
2. **탐색 (/explore)** — 검색, 최근검색, 인기검색, 카테고리/필터/정렬, 카드 그리드
3. **카드 상세 (/card/[id])** — 카드 이미지, 거래방식 2×2, 시세 차트, 판매자 정보
4. **카드 등록 (/sell)** — 4단계 플로우
5. **채팅 목록 (/chat)** — 전체/구매/판매 필터, ⚙️ 드롭다운 설정(알림토글·전체읽음·채팅방나가기 선택모드)
6. **채팅방 (/chat/[id])** — 메시지 버블, 거래 제안 모달, ⋮ 드롭다운(나가기 확인 다이얼로그)
7. **마이페이지 (/mypage)** — 프로필·팔로워·버튼2개, 아이콘 그리드 6개(lucide 아이콘), 메뉴 리스트 3섹션
8. **쿠폰함 (/mypage/coupons)** — 사용가능/완료 탭, 쿠폰 카드 UI
9. **포인트 (/mypage/points)** — 잔액 카드, 적립/사용 내역
10. **알림 설정 (/mypage/notifications)** — 전체토글 + 거래·마케팅 섹션별 토글 (localStorage)
11. **공지사항 (/mypage/notices)** — 목록+상세 인라인 전환, NEW 뱃지
12. **판매내역 (/mypage/sales)** — 상태별 탭, 채팅·재판매 버튼
13. **구매내역 (/mypage/purchases)** — 상태별 탭, 리뷰쓰기·재구매 버튼
14. **교환내역 (/mypage/trades)** — 내카드⇄상대카드 시각화, 가격차액 표시
15. **찜한 카드 (/mypage/wishlist)** — 카드 그리드, 카테고리 필터, 가격 정렬, 찜 해제
16. **최근 본 카드 (/mypage/recent)** — 리스트, 카테고리 필터, 개별삭제·전체삭제, 찜하기
17. **가격제안 (/mypage/offers)** — 받은/보낸 탭, 수락·거절·취소 인터랙션, 할인율 표시
18. **하단 네비게이션 리디자인** — 이모지 제거, lucide 아이콘, 검정 강조 (A안) 전체 페이지 적용
19. **마이페이지 거래 신뢰 지표** — 팔로워/팔로잉 → 거래완료·응답시간·안전결제·최근접속 4칸 그리드, 감정 카드 경험 태그
20. **카드 등록 컬렉터 감성 강화** — Step 0 키워드 힌트(PSA/PROMO/SAR/Trophy), Step 2 PSA 등급 토글, 완료 화면 컬렉터 마켓 감성
21. **Card Passport** — 카드 상세에 여권 형태 카드 정보 섹션 추가 (TCG·희귀도·언어·등급·시장위치·희소성 표시, 한글판 카드는 한글명 표시)
22. **교환 기능** — 직거래·보증금 안전교환 2가지 방식, 3단계 제안 플로우 (/exchange/propose), 교환 진행 추적 페이지 (/exchange/[id]), 카드 상세 하단에 ⇄ 교환 제안 버튼 추가, 안전교환 정책 예시 및 분쟁 처리 지원 안내 삽입
23. **교환 조건 확정서** (/exchange/[id]/agreement) — DRAFT→PENDING_CONFIRMATION→CONFIRMED→CHANGE_REQUESTED·CANCELLED·DISPUTED 6가지 상태, 카드 비교 테이블(내카드/상대카드), 교환 조건 항목(추가금·배송·보증금·검수·분쟁처리), 양측 서명란, 확정 시 "고정됨" 잠금 칩, 정식 약관 확정 전 안내 문구로 완화
24. **교환 밸런스 보드** (src/components/ExchangeBalanceBoard.tsx) — TCG 교환 전용 가치 비교 UI, 시세 밸런스 바(내 카드 vs 상대 카드 비율), 차액·추가금 추천·희소성·상태 비교 분석, 교환 적정도 % 칩, /mypage/trades에서 진행중/대기중 교환 아이템에 "밸런스 분석" 버튼으로 인라인 확장
25. **이모지 UI 1차 제거 (20~30대 컬렉터 마켓 톤)** — 주요 거래 화면 중심으로 이모지 → lucide 아이콘·TCG 카드 프레임 교체 (1차): 홈(Bell/Search·뉴스 MapPin/Package/Star/RefreshCw·카드 썸네일 TCG 프레임), 카드 상세(Share2·Heart·Eye·Package/Store/Users/ShieldCheck 거래방식·비슷한카드 프레임), 채팅목록(Settings·초성 아바타·MessageCircle 빈상태), 채팅방(초성 아바타·TCG 프레임·CreditCard/Ban/LogOut·Package/Truck/Users/Lock 거래제안), 교환내역(등급 배지 카드 썸네일)
26. **법적/에스크로 문구 안전 표현으로 교체** — 교환 제안·교환 진행·교환 확정서 화면에서 "법적 책임 부인", "자동 몰수", "토스페이먼츠", "전자상거래법" 등 단정 표현을 "운영정책에 따라 검토", "PG 연동 예정", "분쟁 처리 지원" 등 신중한 표현으로 완화 (프로토타입 단계 안전 처리)
27. **이모지 추가 정리 + Next.js 16 params 수정** — /mypage(🔔→Bell, ⚙️→Settings, 🎴→이니셜 아바타, ✏️→Pencil), /explore(🔍→Search, ⚙️→SlidersHorizontal, 카드 그리드→TCG 프레임), /sell(카테고리·TRADE_OPTIONS·검색힌트·완료화면 이모지 전부 아이콘/TCG 프레임으로), /exchange/propose·[id](교환방식 버튼·카드 프리뷰→lucide+TCG 프레임), /chat/[id] Next.js 16 params Promise 패턴 적용
28. **카드 등록 사진 가이드 (판매자)** — /sell Step 1에 named 슬롯 그리드 추가: BASE(앞면/뒷면/모서리/반사 필수 4개) + 감정카드 ON 시 GRADED(감정케이스/감정번호) + 미개봉 ON 시 SEALED(박스앞뒤/봉인씰/모서리) 조건부 슬롯; Camera 아이콘 플레이스홀더, 슬롯별 사진 촬영 후 체크마크·삭제 버튼, 충족 카운터, 미개봉 토글; 슬롯키 기반 Record<string,string> 상태로 교체
29. **사진 인증 섹션 (구매자)** — /card/[id] Card Passport 아래에 PhotoCertSection 추가: 슬롯별 충족률 %, 색상 분기 진행 바(100%=초록/75~99%=황색/미만=빨강), 2열 체크리스트(CheckCircle2/AlertCircle + 필수 뱃지), 감정카드 여부에 따라 감정 슬롯 조건부 표시, 누락 시 추가 사진 요청 버튼(탭 후 완료 상태 전환), "거래 확정 후 상태 분쟁 시 기준 자료" 안내 문구
30. **구매 확신 스택 (구매 전 확인)** — /card/[id] 판매자 정보 다음에 TrustStackSection 추가: ① 카드 정체성(Card Passport 확인/레어도·언어·배포/감정등급) ② 가격 판단(TrendingDown/Up 아이콘, 30일 평균 대비 ±% + 평균가 표시) ③ 판매자 신뢰(사진인증 n/n, 안전거래 가능, 거래 완료 n회, 응답 시간 — CheckCircle2 / 회색 빈 원으로 ok 여부 구분); 하단 고정 CTA 위에 "사진 인증됨 · 안전거래 가능 · 평균가 대비 -6%" 한 줄 신뢰 요약; CARD_DB에 avgPrice30d·sellerResponseTime mock 데이터 추가

32. **교환 상태판 (교환 진행 UX 강화)** — /exchange/[id]에 StatusBoard 컴포넌트 추가: getBoardState(step, isFace)로 직거래 5단계·보증금 6단계별 상태 데이터 정의; 내가 할 일 / 상대방 할 일 2열 체크리스트(완료=취소선+초록 아이콘, 미완=빈 원), 필요한 증빙(Camera 아이콘), 기한 칩(urgent=빨강/일반=회색), AlertTriangle 경고 문구, 다음 단계 안내; 상태판을 카드 요약 바로 아래 배치; 단순 진행률 % 바 섹션 제거(타임라인으로 대체)
31. **탐색 페이지 카드 도감형 개선** — /explore 카드 리스트를 "카드 도감 + 매물 요약" 구조로 개편: CARD_ENTRIES(카드명/시리즈/레어도/매물수/최저가/평균가/PSA수/언어분포/안전거래) mock 데이터로 재구성; 필터 "상태" → "레어도(SAR/UR/SR/R)" 칩 필터; 정렬 "매물 많은 순·최저가 순·최신등록"; 2열 그리드 → 단일열 리스트 (TCG 카드 프레임 + 카드명/시리즈·카테고리 / 매물N개 최저 X원 평균 X원 / PSA N개·언어분포·안전거래 태그행); 총N개 → 카드N종

36. **디자인 시스템 토큰 정리** — 전역 색상/반경/그림자 토큰 단일화: ① src/lib/tokens.ts 생성 (PRIMARY·RARITY_CHIP·RARITY_STROKE·SCARCITY_COLOR·SEMANTIC·NEUTRAL·RADIUS·SHADOW 전체 정의) ② globals.css 전면 개편 (다크모드 오버라이드 제거, CSS 변수 확장, body 기본 폰트/배경/letter-spacing 정리, @theme inline 등록) ③ PRIMARY 색상 전체 페이지 일괄 수정 #E53E3E→#D62828 (carmine red, 더 세련된 톤) ④ RARITY_CHIP 정제 — card/[id]·explore: SAR(#fff8e6/#b45309→#FFFBEB/#92400E 앰버골드), UR(#f3e8ff/#7c3aed→#F3EEFF/#6D28D9 딥바이올렛), SR(#fff5f5/#dc2626→#FFF0F0/#B91C1C 크림슨), R(#f8fafc/#475569→#F0F9FF/#0369A1 스카이블루) ⑤ GRADE_COLORS 정제 — wishlist·feed: SAR→#B7791F, UR→#6D28D9, SR→#B91C1C, R→#1D4ED8 ⑥ feed CHIP_META PSA 10 색상 보라→파랑(#1D4ED8, PSA 브랜드 블루) ⑦ layout.tsx body에 --bg 변수 적용 ⑧ formatScarcity 색상 토큰과 동기화

39. **QA — 3개 신규 기능 문구·코드 정리** — 전체 빌드·타입 점검(tsc --noEmit, next build 오류 없음); RarityIndex.tsx에서 선언만 되고 본문에서 미사용인 defaultCollapsed prop 제거; collection.ts 판매 추천 이유 문구 완화("지금이 매도 적기" → "판매를 고려해볼 수 있는 시점", "이익 실현을 고려해보세요" → "거래 참고 정보로만 활용해 주세요") — AI 확정 판정·투자 조언 표현 제거

38. **AI 카드 패스포트 스캐너 → 판매 등록 연결 (Phase 4)** — /sell/scanner 결과를 /sell에 자동 반영: sell/page.tsx에 useEffect로 sessionStorage scanResult 읽기 추가(마운트 시 1회, removeItem으로 중복 방지); ScanResult → 기존 state 어댑터(tcg→category, cardId→searchQuery+자동검색, isGraded/gradingCompany/grade→감정 state, condition→S/A/B, descDraft→desc); Step 1 상단에 "사진으로 카드 찾기" 다크 배너 CTA 추가(router.push("/sell/scanner")); 스캔 결과 반영 시 파란 안내 배너 표시(dismiss 가능)

37. **AI 카드 패스포트 스캐너 독립 화면 (Phase 3)** — /sell/scanner 신규 생성: 필수 슬롯 4개(앞면/뒷면/모서리/빛반사) + 감정 카드 토글 시 슬롯 2개 추가; 슬롯 클릭 → mock 채움(실제 file input 교체 포인트 주석 명시); 신뢰도 프리뷰 바(필수 슬롯 충족률 기반); 필수 4개 미충족 시 스캔 버튼 비활성; scanCard() 호출 → 1.2초 로딩 → ScanResult 화면; 결과: 신뢰도%, 슬롯 커버리지 도트, 경고 목록, 카드 정보, Card Passport 초안, 판매 설명 초안; "이 정보로 등록 계속하기" → sessionStorage.setItem("scanResult", ...) + router.push("/sell"); AI 확정 판정 표현 금지 — "추정", "감지됨", "확인 필요" 톤 유지

36. **컬렉션 금고 / My Vault** — /mypage/collection 신규 생성 + /mypage 진입 버튼 연결: Vault Summary 카드(총 추정 자산가치·손익·손익률·4칸 통계); 수익/손실 1위 카드 2칸 미니 카드; 탭 4개(전체/판매 추천/교환 추천/중복 보유) — client state 전환; 전체 탭: MOCK_COLLECTION 전체, 판매 추천 카드에 액션 버튼 자동 표시; 판매 추천 탭: getSellRecommendations() 결과, 추천 이유·추천 판매가 표시; 교환 추천 탭: getTradeMatches() 결과, 적정도%·예상 가격차·상대 핸들 표시; 중복 보유 탭: getDuplicates() 결과; 빈 상태 EmptyState 컴포넌트; /mypage 컬렉션 섹션에 다크 배너 스타일 "컬렉션 금고" 전 너비 진입 버튼 추가(router.push)

35. **Card Passport 한국어화** — /card/[id] Card Passport 섹션을 한국 유저 중심으로 개선: 표시 변환 헬퍼 6개 추가(formatLanguage·formatDistribution·formatGrade·formatCondition·formatScarcity·formatPricePosition) — 원본 mock 데이터 유지, UI 표시 단계에서만 변환; 헤더 "CARD PASSPORT" → "카드 패스포트" (Korean 대제목 + "Card Passport" 보조 영문) + 우측 "카드 ID"; 라벨 전면 한국어화(Card Name→카드명, Language→언어, Distrib.→배포 방식, Grade→감정 등급, Condition→상태, Market→시세 위치, Scarcity→희소성); 값 한국어화(Japanese→일본판, Booster Set→확장팩 수록, Near Mint→NM+거의 새 상품, 30D Top X%→상위 X%+최근 30일, Grail→Grail+최상급 희귀 등); 태그 "Photo Verified"→"사진 인증 완료", "Safe Trade"→"안전거래 가능"; 일본/영문판 카드는 영문명(기본)+한국명(보조) 병기; 구매 전 확인 섹션도 "Card Passport 확인됨"→"카드 패스포트 확인됨", 배포/언어 값 포맷 적용

34. **피드 탭 — 내 시그널 (/feed)** — 하단 네비 "피드" 탭을 /feed 독립 화면으로 구현 (홈/탐색과 역할 분리): 개인화된 거래 인박스 컨셉, 6가지 시그널 타입(가격 알림·새 매물·교환 기회·셀러·찜 업데이트·희귀 조건), 상단 요약 카드(오늘의 시그널 개수·가격하락·새매물·교환 3칸 통계), segmented 탭 필터(전체/가격/새매물/교환/셀러), 시그널 카드(미니 TCG 프레임·타입칩·시간·제목·설명·가격행·칩+액션 버튼), 빈 상태 UI(탐색·가격알림 설정 버튼); 홈·탐색·채팅·마이페이지 하단 네비 피드 href "/" → "/feed" 일괄 수정

33. **찜한 카드 가격 알림 UX** — /mypage/wishlist에 Bell/BellRing 아이콘 토글 추가: 카드당 Bell 버튼(오른쪽 상단 찜 버튼 아래), 탭 시 바텀 시트로 알림 조건 선택(현재가보다 5% 낮아지면·10만원 이하·PSA 10 등록 시·안전거래 매물 등록 시 / 중복 선택 가능), 조건 선택 후 "알림 설정 완료" 버튼으로 확정; 알림 활성 카드에 BellRing 황색 아이콘 + "알림 ON" 칩(이미지 하단 좌); 이모지 제거 후 TCG 카드 프레임으로 교체; 알림 껐다 켜기: 이미 알림 ON 상태에서 Bell 탭 시 알림·프리셋 즉시 초기화

## 다음 작업 🔜
- **Supabase 연결** — Auth + DB
- **카카오 로그인**
- **토스페이먼츠 결제**

## AI 스캐너 실제 연결 시 교체 포인트
- `src/lib/scanner.ts` `callScannerAPI()` 내부 → `fetch("/api/scan", { method:"POST", body: JSON.stringify(input) })` 교체
- `src/app/sell/scanner/page.tsx` `fillSlot()` 내부 mock 로직 → `slotTargetRef.current = key; fileInputRef.current?.click();` 교체 (hidden input 이미 준비됨)
- `src/lib/collection.ts` `MOCK_COLLECTION` → Supabase `user_collection` 테이블 조회로 교체
- `src/lib/rarity-score.ts` `listings`, `recentVolume` → 실시간 매물/체결 API로 교체

## 백엔드 연결 (UI 완성 후)
- Supabase (DB + Auth)
- 카카오 로그인
- 토스페이먼츠 결제
- eBay API (시세 데이터)
- PSA API (카드 등급 진품 확인)

## 저장 규칙
- 작업 완료마다: `git commit` + 이 파일 업데이트
