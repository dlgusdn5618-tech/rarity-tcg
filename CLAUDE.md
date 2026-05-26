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
22. **교환 기능** — 직거래·보증금 에스크로 2가지 방식, 3단계 제안 플로우 (/exchange/propose), 교환 진행 추적 페이지 (/exchange/[id]), 카드 상세 하단에 ⇄ 교환 제안 버튼 추가, 전자상거래법 기반 P2P 중개 면책 약관 삽입
23. **교환 조건 확정서** (/exchange/[id]/agreement) — DRAFT→PENDING_CONFIRMATION→CONFIRMED→CHANGE_REQUESTED·CANCELLED·DISPUTED 6가지 상태, 카드 비교 테이블(내카드/상대카드), 교환 조건 항목(추가금·배송·보증금·검수·분쟁처리), 양측 서명란, 확정 시 "고정됨" 잠금 칩, 법적 면책 고지 포함
24. **교환 밸런스 보드** (src/components/ExchangeBalanceBoard.tsx) — TCG 교환 전용 가치 비교 UI, 시세 밸런스 바(내 카드 vs 상대 카드 비율), 차액·추가금 추천·희소성·상태 비교 분석, 교환 적정도 % 칩, /mypage/trades에서 진행중/대기중 교환 아이템에 "밸런스 분석" 버튼으로 인라인 확장
25. **이모지 UI 제거 (20~30대 컬렉터 마켓 톤)** — 앱 전체에서 장식용 이모지를 lucide-react 아이콘 및 미니 카드 프레임으로 대체: 홈(Bell/Search 아이콘·뉴스 MapPin/Package/Star/RefreshCw·카드 썸네일 TCG 프레임), 카드 상세(Share2·Heart·Eye·Package/Store/Users/ShieldCheck 거래방식·비슷한카드 프레임), 채팅목록(Settings·초성 원형 아바타·MessageCircle 빈상태), 채팅방(초성 아바타·TCG 카드 프레임·CreditCard/Ban/LogOut 드롭다운·Package/Truck/Users/Lock 거래제안), 교환내역(등급 배지 카드 썸네일)

## 다음 작업 🔜
- **Supabase 연결** — Auth + DB
- **카카오 로그인**
- **토스페이먼츠 결제**

## 백엔드 연결 (UI 완성 후)
- Supabase (DB + Auth)
- 카카오 로그인
- 토스페이먼츠 결제
- eBay API (시세 데이터)
- PSA API (카드 등급 진품 확인)

## 저장 규칙
- 작업 완료마다: `git commit` + 이 파일 업데이트
