# 청약 공고 크롤러 가이드

청약홈·민간임대 공고를 **크롤링 → JSON 적재 → 텔레그램 알림**.  
지금은 **로컬 수동 실행**이고, 순수 함수 + env 기반이라 나중에 스케줄러(Windows 작업 스케줄러 · GitHub Actions)에 그대로 얹을 수 있다.

## 구성

| 부분 | 위치 |
|------|------|
| 청약홈 오픈 API 매핑 | `src/lib/crawl/applyhome.ts` |
| 민간임대 사이트 크롤 (프레임워크) | `src/lib/crawl/private-rental.ts` |
| 텔레그램 전송 | `src/lib/crawl/telegram.ts` |
| 적재·dedup·정렬 | `src/lib/crawl/store.ts` |
| 실행 스크립트 | `scripts/crawl-subscriptions.ts` |
| 적재 파일 | `src/content/finance/property-listings.json` |
| 화면 | `/finance/listings` ("청약 공고" 섹션) |

## 준비 (한 번만)

`.env.local` 에 채운다 (`.env.example` 참고):

```
APPLYHOME_SERVICE_KEY=...   # data.go.kr 서비스 키
TELEGRAM_BOT_TOKEN=...       # BotFather 봇 토큰
TELEGRAM_CHAT_ID=...         # 알림 받을 chat id
# CRAWL_REGIONS=서울,경기      # (선택) 지역 필터
# CRAWL_SINCE_NOTICE_DATE=2026-01-01  # (선택) 이 날짜 이후 공고만
```

### 1) data.go.kr 서비스 키
1. [공공데이터포털](https://www.data.go.kr) 가입
2. **"한국부동산원_청약홈 분양정보 조회 서비스"**(data.go.kr/data/15098547) 활용신청
3. 마이페이지 → 발급된 **일반 인증키(Encoding)** 를 `APPLYHOME_SERVICE_KEY` 에

### 2) 텔레그램 봇
1. 텔레그램에서 **@BotFather** → `/newbot` → 토큰 발급 → `TELEGRAM_BOT_TOKEN`
2. 만든 봇과 대화 시작(아무 메시지) 후, `https://api.telegram.org/bot<토큰>/getUpdates` 열어 `chat.id` 확인 → `TELEGRAM_CHAT_ID`

## 실행

```bash
npm run crawl:subscriptions
```

- 청약홈 API에서 APT + 오피스텔/민간임대 공고를 받아 적재
- 기존과 비교해 **신규 공고만** 텔레그램으로 알림 (한 번 알린 건 다시 안 보냄)
- 키가 없으면 그 소스는 건너뛰고 안전하게 종료

## 민간임대 사이트 (개별 크롤)

청약홈 API에 안 잡히는 자체 분양 사이트는 `src/lib/crawl/private-rental.ts` 의
`PRIVATE_RENTAL_SOURCES` 에 `{ slug, label, url, parse }` 로 하나씩 추가한다.
(URL·페이지 구조가 확정돼야 파서를 채울 수 있음)

## 나중에: 스케줄 등록

- **Windows 작업 스케줄러**: 매일 지정 시각에 `npm run crawl:subscriptions` 실행
- **GitHub Actions**: cron 워크플로에서 실행 후 `property-listings.json` 변경을 커밋

동작·env 로딩이 스크립트에 자립적으로 들어있어 두 경우 모두 추가 코드 없이 얹을 수 있다.
