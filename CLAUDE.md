@AGENTS.md

# 레어리티 (Rarity) — 프로젝트 진행 현황

## 앱 개요
- 포켓몬 + 원피스 트레이딩 카드 거래 플랫폼
- GitHub: https://github.com/dlgusdn5618-tech/rarity-tcg
- Vercel: https://pokemon-trade-xi.vercel.app
- 스택: Next.js + TypeScript + Tailwind CSS
- 수익 모델: 거래 수수료 7% + 안전거래 수수료 3%

## 컬러 / 디자인
- Primary: #D62828 (carmine red)
- Accent: #111111 (블랙 — 골드 #F6C90E 대체, 2026-05 디자인 시스템 1단계)
- 폰트: **Pretendard Variable** (next/font/local, woff2 로컬, fallback: Noto Sans KR)
- 하단 네비 활성: #111111 (검정), 비활성: #9ca3af (회색)
- 하단 네비 아이콘: lucide-react (Home, Search, Sparkles, MessageCircle, User)
- 디자인 토큰: src/lib/tokens.ts (PRIMARY, ACCENT_BLACK, RARITY_CHIP, SHADOW, NEUTRAL 등)
- CSS 유틸리티: globals.css rr-* 클래스 (rr-card, rr-button-primary, rr-price 등)

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

40. **scanner→sell 플로우 버그 수정** — `void searchPokemonCard()` 제거, ScanResult로 syntheticCard 즉시 세팅해 canNext[1] 외부 API 없이 즉시 충족; result.photoSlots 루프로 slotPhotos에 `"scanner"` 마커 삽입(uploadedCount 4/4 충족); setTotal===0 시 "/0" 미표시 처리; src 3방향 렌더링(data:/http: 실제 이미지 / `"scanner"` 초록 AI 플레이스홀더 / 빈 슬롯)

41. **컬렉션 금고 UX 전면 개선** — 상단 요약 단순화(총 자산 숫자 1개 크게 + 현재 가치 변동 서브 + 보유N장·팔아볼N장·교환후보N장 한 줄); topGainer/topLoser 카드·4칸 통계 그리드 제거; "지금 볼 것" 인사이트 섹션 신설(판매/교환/중복 기반 2~3개 자동 생성); 탭명 변경(판매 추천→팔아볼 카드 / 교환 추천→교환 후보 / 중복 보유→중복 카드); 카드 행 3컬럼 가격 박스 → 현재가 우측 크게 + "내 기준가 XX원" 작은 텍스트; 금융 언어 완화(미실현 손익→현재 가치 변동, 수익 1위→가치가 오른 카드, 손실 1위→잠시 보류할 카드); 데스크톱 max-width 430px 가운데 정렬

42. **공개 셀러샵 (/mypage/shop)** — 신규 생성: 헤더에 "공개 프로필 미리보기" 부제; 프로필 카드(이니셜 아바타·닉네임·핸들·평점/리뷰수·인증완료/안전결제 뱃지·거래신뢰 4칸 그리드·태그 pill); 샵 신뢰 요약 2×2(사진인증률/안전거래매물/평균응답/거래만족도 컬러 카드); 판매 중 5장(TCG 썸네일+카드명/레어도/가격/사진인증·안전거래 뱃지); 최근 판매 완료 3건(거래일·구매자 한마디 인용); 샵 공유하기·프로필 편집 버튼; /mypage "내 샵 보기" → router.push("/mypage/shop") 연결; 데스크톱 max-width 430px

43. **탐색 정렬 개선 + 감정 등급 필터** — 정렬 4종 변경(매물 많은 순/최저가 순/최신등록 → 인기순[기본]/최신순/낮은 가격순/높은 가격순); CardEntry에 wishCount(인기순 기준)·createdAt(최신순 기준)·grades(감정 등급 배열) 필드 추가; 필터 패널에 "감정 등급" 섹션 신설 — 프리셋 칩 5개(전체/PSA 10[파랑]/PSA 9+/BGS 9.5+[보라]/감정 없음); 필터 활성 시 SlidersHorizontal 버튼 검정 강조 포함; 카드 태그 표시 "PSA N" 개수 → "PSA 10 +1" 최고 등급+추가 수량 형식; BGS는 보라(#6D28D9)로 PSA와 색 구분

44. **판매자 보기 + 채팅하기 카드 상세 연결** — CARD_DB 타입에 `sellerId?: string` 추가(카드1→pocketmaster, 카드2→cardking, 카드3→rarehunter); "판매자 보기" 버튼 → `router.push("/mypage/shop?seller=${card.sellerId ?? "rarity_user"}")`; "채팅하기" 버튼 → `router.push("/chat?fromCard=${id}")`; /mypage/shop 동적화(SELLER_MAP 4개 셀러·useSearchParams·Suspense 래퍼·isOwner 플래그로 "프로필 편집" 조건부 표시·헤더 부제 분기); 피드 셀러 시그널 actionHref "/mypage" → "/mypage/shop?seller=pocketmaster"

45. **구매 바텀시트 (PurchaseBottomSheet)** — src/components/PurchaseBottomSheet.tsx 신규 생성; 카드 상세 "바로 구매" 버튼 → `setShowPurchase(true)`로 시트 열기; 시트 구성: ① 카드 정보(카드명/레어도칩/상태배지/가격·판매자/사진인증/안전거래 뱃지) ② 배송 방식 3칸 선택(택배[기본]/반값택배/직거래, 선택 시 PRIMARY 레드 강조) ③ 예상 결제금액(카드가격+안전거래수수료3%, 직거래 선택 시 "수수료 없음·현장 결제") ④ 구매 전 확인 체크리스트(카드패스포트/사진인증/상태설명 초록 체크 3개) ⑤ "구매 요청하기" CTA → 완료 상태 전환("구매 요청이 판매자에게 전송됐어요"), "판매자에게 문의" → 시트 닫고 /chat으로 이동; 배경 클릭·X 버튼으로 닫기, 완료 후 "확인"으로 닫기; max-h-[88vh] + overflow-y-auto 스크롤; 실제 결제 API 미연결

46. **홈 레어리티 TOP 랭킹 섹션** — 히어로 배너 바로 아래, 판매 유도 스트립 위에 삽입; 가로 스크롤 5장 카드(112~116px); 각 카드: 랭크 뱃지(#1=블랙/#2=실버/#3=브론즈), TCG 카드 프레임 목업, 카드명, 레어도 칩, Rarity Score(90+=블랙/80+=레드/else=슬레이트), 가격, 한 줄 이유; 클릭 → /card/${id}; "전체" → /explore; mock 데이터는 src/lib/cards.ts `getRarityRankings()` 함수로 분리

47. **mock 데이터 서비스 분리** — 화면 컴포넌트 내 하드코딩된 데이터를 lib/*.ts 서비스 파일로 분리: `src/lib/cards.ts`(CardDetail·CardEntry·SimilarCard·RankingCard + 서비스 함수 4개), `src/lib/sellers.ts`(SellerInfo·Listing·SoldItem + 서비스 함수 3개), `src/lib/feed-signals.ts`(Signal·SignalType + getFeedSignals), `src/lib/home-banners.ts`(HomeBanner·BannerType + getHomeBanners·getPersonalizedHomeBanners); 각 함수에 TODO 주석으로 Supabase 교체 포인트 명시

48. **카드 상세 시그널 알림** — SignalAlertSheet 신규 생성(src/components/SignalAlertSheet.tsx); Bell/BellRing 토글 버튼으로 바텀시트 열기; 설정 항목: 목표가 입력(현재가의 92% 기본값, 현재가 대비 % 표시), 5가지 알림 조건 토글(목표가 도달·가격 하락·새 매물·안전거래 매물·교환 후보); localStorage 저장(STORAGE_KEY="rarity_watch_signals"); 완료 후 피드 바로가기 제공

49. **Pretendard Variable 폰트 교체** — Noto Sans KR → Pretendard Variable 최종 교체; next/font/local + PretendardVariable.woff2(2MB, src/app/fonts/); Noto Sans KR fallback 유지; THIRD_PARTY_NOTICES.md 라이선스 고지 추가(SIL OFL 1.1)

50. **디자인 시스템 1단계** — 공통 토큰·유틸리티 클래스 기반 정리: ① tokens.ts에 ACCENT_BLACK·ACCENT_CHARCOAL·ACCENT_MUTED 추가 ② globals.css --accent #F6C90E→#111111 변경 + rr-* 유틸리티 14개 클래스 추가(rr-card·rr-card-compact·rr-section-header·rr-section-title·rr-section-subtitle·rr-button-primary·rr-button-secondary·rr-button-ghost·rr-badge·rr-badge-rarity·rr-metric·rr-price·rr-score·rr-bottom-cta) ③ 홈·RarityIndex·PurchaseBottomSheet에 rr-* 클래스 적용 ④ 골드(#F6C90E) 포인트 컬러 → 블랙(#111111)으로 전면 교체 ⑤ DESIGN_SYSTEM.md 문서 신규 생성

52. **디자인 시스템 3단계** — 빈/로딩/실패 상태 UI 정돈: ① globals.css에 rr-skeleton(shimmer 애니메이션)·rr-state-title·rr-state-description 유틸리티 추가 ② src/components/EmptyState.tsx 신규 생성(icon/eyebrow/title/description/action props, rr-button-secondary 기반) ③ src/components/LoadingState.tsx 신규 생성(list=rr-card 스켈레톤 3종/card/scanner variant, Sparkles 애니메이션+진행바) ④ explore 빈 결과→EmptyState+"전체 카드 보기" 필터 리셋 액션 ⑤ collection 탭별 EmptyState 텍스트 spec 반영 ⑥ sell Step1 검색중→LoadingState list·결과없음→EmptyState ⑦ sell/scanner 스캔중→LoadingState scanner 전체화면 ⑧ chat 빈목록→EmptyState+"카드 탐색하기"→/explore; 기능 로직·라우팅·mock 데이터 무변경

53. **홈 히트 티커 수직 슬롯머신** — 가로 marquee 애니메이션 → 수직 슬롯머신 롤링으로 전면 교체: 흰 배경(bg-white border-b border-gray-100), 블랙 pill 뱃지(#111111) + 빨간 blink 도트(PRIMARY 색, rr-blink 키프레임), 40px 고정 높이 롤링 윈도우; useRef/setInterval(2000ms)/double-rAF 심리스 루프(마지막→처음 전환 시 transition:none+rAF×2로 점프 없는 리셋); 각 행: rr-badge-rarity 등급칩 + 카드명(700w truncate) + 변동률(NEW=파랑/up=초록/down=빨강) + HOT 뱃지; globals.css에 rr-blink 키프레임 추가; 미사용 Flame import·tickerIdx state 제거

51. **디자인 시스템 2단계** — rr-* 클래스를 explore/sell/collection 3개 페이지에 적용: ① explore: 카드 엔트리 래퍼→rr-card, 최저가→rr-price, 매물수 숫자→rr-metric, 등급배지→rr-badge-rarity, 안전·HOT 배지→rr-badge ② sell: 완료화면 기본/보조 버튼 + 하단 다음/등록 CTA→rr-button-primary/rr-button-secondary(opacity 비활성 스타일 유지) ③ collection: CardRow·SellRecRow·TradeMatchRow·자산요약 래퍼→rr-card, 자산가치→rr-price, 변동금·현재가·지표 숫자→rr-metric, SellRecRow CTA→rr-button-primary, TradeMatchRow CTA→rr-button-secondary, InsightCard 링크→rr-button-ghost; step 로직·라우팅·mock 데이터 무변경

54. **디자인 시스템 4단계 — CardVisual 카드 비주얼 시스템** — src/components/CardVisual.tsx 신규 생성: Props(name/rarity/imageUrl/graded/grade/size/variant); size sm(40×58)/md(58×80)/lg(128×176) 3종; 레어도별 accentColor(SAR=#92400E·UR=#6D28D9·SR=#B91C1C·R=#0369A1·PROMO=#1D4ED8 등); 상단 accent 바 + radial gradient artwork 영역 + 하단 레어도 라벨 footer(lg는 카드명); imageUrl 있으면 img(alt="${name} 카드 이미지", onError로 깨진 아이콘 방지); graded=true+grade 비"Ungraded"이면 PSA/BGS slab 프레임(다크 #1f2937 헤더에 company+score, 차콜 1.5px 테두리, 내부 카드); 적용: 홈 랭킹/최근등록카드 썸네일 md, 탐색 리스트 sm, 카드 상세 fallback lg(graded slab 포함)+비슷한카드 md, 컬렉션 CardRow 왼쪽 sm(graded 카드 slab 표시), 구매 바텀시트 카드정보 sm; 기능로직·라우팅·mock 데이터 무변경; tsc·build 전 과정 오류 없음

55. **디자인 시스템 5단계 — 마이크로 인터랙션** — globals.css에 6종 인터랙션 유틸리티 추가: rr-pressable(120ms scale·opacity 터치 피드백)·rr-lift(160ms translateY hover + active, pointer 기기만)·rr-fade-in(160ms 오버레이 등장)·rr-slide-up(220ms cubic-bezier 바텀시트 슬라이드업)·rr-pop(300ms scale-bounce 완료 아이콘)·rr-pulse-soft(1.8s 소프트 pulse AI 상태); rr-button-primary/secondary에 scale(0.985)+opacity active 피드백 통합; prefers-reduced-motion 대응(모든 animation/transition 비활성); 적용: 홈 랭킹·최근카드(rr-lift), 탐색 카드행(rr-pressable), 컬렉션 액션버튼(rr-pressable), PurchaseBottomSheet overlay/sheet/완료아이콘(rr-fade-in/rr-slide-up/rr-pop), SignalAlertSheet 동일, 스캐너 슬롯·스캔버튼(rr-pressable)+로딩인디케이터(rr-pulse-soft); 기능로직·라우팅·mock 데이터 무변경

56. **디자인 시스템 6단계 — 모바일 QA + 화면 마감** — 9개 페이지 모바일 안정화: ① globals.css에 `.rr-pb-safe` (safe-area-inset-bottom) 유틸리티 추가 ② explore·sell·sell/scanner(2경로)·mypage·feed 루트 래퍼에 `w-full overflow-x-hidden` 추가; mypage/collection·sell done-screen도 동일 ③ 하단 네비 6곳에 `rr-pb-safe` 적용(홈/탐색/마이/채팅/피드); card/[id] CTA·sell CTA·chat 선택모드 바에 `max(12px, env(safe-area-inset-bottom))` 인라인 스타일 ④ card/[id] 루트 `pb-28`→`pb-44` (고정 CTA 높이 ~154px + safe-area 34px 대응); 이름+가격 flex에 `gap-2 flex-1 min-w-0 / shrink-0` 추가; h1에 `break-words` ⑤ chat 하단 스페이서 `h-20`→`h-24` ⑥ sell/page.tsx 스캐너 CTA 버튼의 Sparkles·NEW 뱃지 `#F6C90E`→`#ffffff`(dark bg 대응, scanner/page.tsx와 동일 처리); tsc·build 전 과정 오류 없음

57. **디자인 시스템 7단계 — 카피라이팅/문구 톤 정리** — 투자 조언·확정 판정·100% 보장 표현 7건 제거: ① PurchaseBottomSheet.tsx "판매자 확인 후 확정"→"판매자 확인 후 진행" ② sell/page.tsx "AI가 자동 인식 · 추정값이므로"→"AI가 카드 정보를 추정 · 등록 전 확인 필요" ③ sell/page.tsx "가품 판정 시 100% 환불됩니다"→"가품으로 확인 시 환불 절차가 진행돼요" ④ card/[id]/page.tsx 동일 100% 환불 문구 동일 처리 ⑤ sell/scanner/page.tsx "AI 분析 결과는 추정값이므로"→"AI 추정값이므로" ⑥ rarity-score.ts "시세 프리미엄 20~40% 형성"→"시세 프리미엄이 형성되는 경향이 있음" ⑦ rarity-score.ts "낙찰률 향상"→"매물 신뢰도에 긍정적 영향"; collection.ts 판매 추천 이유 문구는 Phase 39에서 이미 완화됨; feed-signals.ts·RarityIndex.tsx 문제 없음; tsc·build 전 과정 오류 없음

58. **페르소나 기반 톤앤매너 2단계 — 홈 내 컬렉션 현황 미니카드** — src/components/HomeCollectionSummary.tsx 신규 생성; getCollectionStats·getSellRecommendations·getTradeMatches(MOCK_COLLECTION) 사용해 742,000원 가치·+61,000원 현재 가치 변동·팔아볼 카드 3장·교환 후보 3건 표시; "컬렉션 보기" 버튼 → router.push("/mypage/collection"); rr-card px-4 py-3.5 compact 구조 (3개 덩어리: 라벨+가치, 변동, 칩+CTA); 홈의 레어리티 TOP 아래·판매 유도 스트립 위에 삽입; 투자 앱 톤 방지를 위해 "수익/매도/급등" 표현 사용하지 않고 "현재 가치 변동/팔아볼 카드/교환 후보" 사용; 320px에서 칩row flex-wrap + min-w-0 적용; tsc·build 전 과정 오류 없음

57. **페르소나 기반 톤앤매너 1단계 — 텍스트 온보딩 정비** — 민재(신규 유저) · 서연(컬렉터) 2개 페르소나 기준 6개 화면 분석 후 텍스트만 수정: ① 홈 SIGNAL 티커 뱃지 "SIGNAL"→"지금 인기", 레어리티 TOP 부제 "희소성·거래 신뢰도 기준"→"희귀도와 거래 신뢰도를 함께 본 순위", 랭킹 점수에 "n점" + "희귀도 점수" 라벨 추가 ② 탐색 검색 placeholder "레어도 검색"→"희귀도 검색", 레어도 필터 섹션 레이블 "레어도"→"희귀도" + 안내 문구("희귀도는 카드의 등급이에요. SAR에 가까울수록 희귀해요.") 추가 ③ 피드 헤더 부제 "관심 카드와 거래 기회를 모아봤어요"→"찜하거나 알림 설정한 카드 소식을 모아봤어요" ④ 카드 상세 TrustStack identityItems "카드 패스포트 확인됨"→"카드 정보 검증됨", "[grade] 감정 카드"→"감정 등급이 확인된 카드 ([grade])", Card Passport 부제 "Card Passport"→"이 카드의 공식 스펙과 거래 기준 정보" ⑤ 컬렉션 금고 SellRecRow 추천 판매가 아래 "가격 정보는 거래 참고용이에요. 실제 거래가는 판매자와 구매자가 결정해요." 참고 문구 추가; 신규 섹션·컴포넌트·라우팅·mock 데이터 변경 없음; tsc·build 전 과정 오류 없음

62. **페르소나 기반 UX 6단계 — 톤앤매너 회귀 QA** — 10개 화면 전체 정적 코드 리뷰; grep으로 금지 표현(수익/급등/매수/매도/보장/확정/F6C90E)·기존 패치 누락 전수 검색; 발견한 실제 문제 1건 수정: mypage/collection/page.tsx buildInsights의 "잠시 기다려보는 게 좋을 수 있어요"(투자 조언 톤) → "현재 거래 참고가가 내려간 상태예요. 가격 흐름을 확인해두면 좋아요"(중립 정보 톤); 수정 안 한 기존 항목: sell page BGS Black Label 10 F6C90E(실제 등급 UI 색상, 적절), home-banners 번호 2 F6C90E(스테이지 1-5 이전 기존), mypage/shop 프로필 별점 F6C90E(기존), exchange 확정서 "확정"(교환 조건 계약 맥락, 가격보장 아님); tsc·build 전 과정 오류 없음

61. **페르소나 기반 UX 5단계 — 피드 "왜 떴나요" + "먼저 볼 것" 추가** — feed-signals.ts Signal 타입에 `reason?: string` · `priorityLabel?: string` 추가; 6개 시그널 mock 각각에 reason 추가(찜/최근 본/교환/팔로우 셀러/안전거래/관심 태그 기준), 시그널1(price)에 priorityLabel 추가("피카츄 ex가 목표가보다 낮게 등록됐어요"); feed/page.tsx ① `topSignal = signals.find(s.priorityLabel)` 변수 추가 ② 요약 카드 하단에 "먼저 볼 것" 1행(border-t 구분선 + label pill + priorityLabel 텍스트) 추가 ③ SignalCard에 description 아래 "왜 떴나요" pill + reason 1줄 추가(reason 없으면 렌더 안 함); 투자 표현 전면 금지, "왜 나에게 뜬 소식인지" 행동 판단 톤 유지; 기존 탭/CTA/actionHref/EmptyState/라우팅 전혀 변경 없음; tsc·build 전 과정 오류 없음

60. **페르소나 기반 UX 4단계 — 카드상세 구매 판단 요약 + 내 컬렉션 기준** — /card/[id]에 2개 섹션 추가: ① CardDecisionSummary(구매 판단 요약) — 시그널 버튼 아래·Card Passport 위에 배치; 가격(priceDiffPct 기준 낮음/비슷/높음, TrendingDown/Up 아이콘), 신뢰(photoCertPct+safeTrade, CheckCircle2/AlertCircle), 비교(시세 n개월 데이터) 3개 체크포인트; "수익/추천/보장" 표현 전면 금지, 참고용 톤 유지; 하단 "위 정보는 거래 참고용이에요" 안내 문구 추가 ② CardCollectionContext(내 컬렉션 기준) — RarityIndex 아래·사진 인증 위에 배치; MOCK_COLLECTION.find(nameKo) 로 보유 여부 판단(보유 중 시 초록 뱃지), 보유 상태·컬렉션 영향·다음 행동 3개 항목 표시, 보유 시 판매/교환 의사 부제 표시, 미보유 시 rarity 기준 SAR/UR→라인업 채우기 / 기타→컬렉션 추가, "시그널 설정하기" 버튼 → 기존 setShowSignal(true) 연결; MOCK_COLLECTION import 추가; 기존 Card Passport/RarityIndex/사진인증/거래방식/판매자정보/구매전확인/하단CTA 전혀 변경 없음; tsc·build 전 과정 오류 없음

59. **페르소나 기반 UX 3단계 — 탐색 추천 관점 세그먼트** — /explore 카테고리 탭 아래에 "추천 관점" 세그먼트 컨트롤 4종 추가: 처음 사기 좋은(safeTrade && 희귀도≤SR) / 인기 급상승(wishCount≥60) / 희귀도 높은(SAR·UR) / 안전거래(safeTrade); 탭 선택 시 해당 조건으로 카드 필터+정렬(인기 급상승→wishCount 내림/희귀도 높은→RARITY_ORDER 내림/나머지→기존 sortType), 재탭 시 해제(null); ViewMode 타입·RARITY_ORDER·WISH_HOT_THRESHOLD 상수·getRecommendLabel() 함수 추가; 카드 행 가격+스파크 행과 태그 행 사이에 추천 라벨 pill 1개(조건 충족 시만 표시); isSearching 시 세그먼트 숨김; 기존 카테고리·정렬·필터·EmptyState 동작 전혀 변경 없음; tsc·build 전 과정 오류 없음

63. **출시 전 QA — overflow + aria-label** — exchange/[id]·exchange/propose(2곳)·chat/[id]·mypage/shop 루트 div에 `overflow-x-hidden` 추가(모바일 레이아웃 안정화); card/[id] Share2 버튼 `aria-label="공유"`, 홈 Bell 버튼 `aria-label="알림"` 추가(접근성); tsc·build 전 과정 오류 없음

64. **Rarity Chip 디자인 개선 — border 위계 + 신규 등급 토큰** — RARITY_CHIP 구조에 `border` 필드 추가(Tier A-D 위계: Tier A alpha 55 / Tier B 38 / Tier C 25 / Tier D 중립 회색); 신규 등급 키 추가(HR·AR·CHR·CSR·U·C·SEC·L·P·UC); TROPHY color `#F6C90E`→`#E5E7EB`(골드 제거); explore·card/[id] 지역 RARITY_CHIP 제거 후 tokens.ts import 통합; 카드 상세 패스포트 헤더 칩 `text-[11px] px-2.5 py-1`→`text-[10px] px-1.5 py-0.5` 크기 축소; 트러스트 섹션 칩 fontWeight 600→700 통일; 모든 칩 font-size·height·padding 동일 유지, 위계는 border 선명도로만 표현; tsc·build 전 과정 오류 없음

65. **홈 page.tsx RARITY_CHIP tokens.ts 통합** — 홈 지역 RARITY_CHIP(4종) 제거, `import { RARITY_CHIP } from "@/lib/tokens"` 추가; 3곳 fallback 객체에 `border` 필드 포함; 레어리티 TOP 랭킹 배지에 `border: chip.border` 적용; 티커 `rr-badge-rarity` 칩은 9px 크기 유지, border 미적용; tsc·build 전 과정 오류 없음

66. **Vercel 배포** — `npx vercel --yes`로 프로젝트 배포 완료; URL: https://pokemon-trade-xi.vercel.app; GitHub 연동(git push 시 자동 재배포); 전 페이지 23개 경로 빌드 성공

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
