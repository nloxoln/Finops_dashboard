# Slack Notifier Lambda Function

이 Lambda 함수는 FinOps 플랫폼에서 Slack으로 비용 이상 탐지 알림을 보내는 역할을 합니다.

## 배포 방법

### 1. Slack Incoming Webhook URL 생성

1. Slack 워크스페이스에서 [https://api.slack.com/apps](https://api.slack.com/apps)로 이동
2. "Create New App" 클릭 → "From scratch" 선택
3. App 이름 입력 (예: FinOps Alerts) 및 워크스페이스 선택
4. 좌측 메뉴에서 "Incoming Webhooks" 클릭
5. "Activate Incoming Webhooks" 토글을 ON으로 설정
6. "Add New Webhook to Workspace" 클릭
7. 알림을 받을 채널 선택 (예: #cost-alerts)
8. Webhook URL 복사 (형식: `https://hooks.slack.com/services/T.../B.../...`)

### 2. Lambda 함수 생성

1. AWS Lambda 콘솔로 이동
2. "함수 생성" 클릭
3. "새로 작성" 선택
4. 함수 이름: `finops-slack-notifier`
5. 런타임: Node.js 20.x (또는 최신 버전)
6. 아키텍처: x86_64
7. "함수 생성" 클릭

### 3. 함수 코드 업로드

**방법 1: 직접 복사**
1. Lambda 함수 페이지에서 "코드" 탭으로 이동
2. `index.mjs` 파일의 내용을 복사하여 Lambda 편집기에 붙여넣기
3. "Deploy" 클릭

**방법 2: ZIP 파일 업로드**
```bash
cd slack-notifier
zip slack-notifier.zip index.mjs package.json
```
Lambda 콘솔에서 "Upload from" → ".zip file" 선택 후 업로드

### 4. 환경변수 설정

1. Lambda 함수 페이지에서 "구성" 탭 → "환경 변수" 클릭
2. "편집" 클릭
3. "환경 변수 추가" 클릭
4. 키: `SLACK_WEBHOOK_URL`
5. 값: (1단계에서 복사한 Slack Webhook URL)
6. "저장" 클릭

### 5. API Gateway 생성

1. API Gateway 콘솔로 이동
2. "API 생성" 클릭
3. "HTTP API" 선택 → "구축" 클릭
4. "통합 추가" 클릭
   - 통합 유형: Lambda
   - Lambda 함수: `finops-slack-notifier` 선택
   - API 이름: `finops-slack-api`
5. "다음" 클릭
6. 경로 구성:
   - 메서드: POST
   - 리소스 경로: `/slack/notify`
7. "다음" → "다음" → "생성" 클릭

### 6. CORS 설정

1. API Gateway 콘솔에서 생성한 API 선택
2. "CORS" 탭으로 이동
3. "구성" 클릭
4. 다음 설정 입력:
   - Access-Control-Allow-Origin: `*` (또는 프론트엔드 도메인)
   - Access-Control-Allow-Headers: `Content-Type`
   - Access-Control-Allow-Methods: `POST, OPTIONS`
5. "저장" 클릭

### 7. API Gateway URL 확인

1. API Gateway 콘솔에서 "단계" 탭으로 이동
2. "URL 호출" 복사 (형식: `https://xxxxx.execute-api.region.amazonaws.com`)
3. 최종 엔드포인트: `{URL}/slack/notify`

### 8. 프론트엔드 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```
VITE_SLACK_API_ENDPOINT=https://xxxxx.execute-api.region.amazonaws.com/slack/notify
```

## 테스트

### Lambda 함수 직접 테스트

1. Lambda 함수 페이지에서 "테스트" 탭으로 이동
2. 새 이벤트 생성:

```json
{
  "body": "{\"company\":\"CJ대한통운\",\"rawData\":\"테스트 데이터\",\"summary\":\"테스트 요약\",\"cause\":\"테스트 원인\",\"actionRequired\":true}"
}
```

3. "테스트" 클릭
4. Slack 채널에 메시지가 도착하는지 확인

### 프론트엔드에서 테스트

1. 프론트엔드 개발 서버 실행: `npm run dev`
2. 로그인 후 "마이페이지" 이동
3. "테스트 알림 보내기" 버튼 클릭
4. Slack 채널에 메시지 도착 확인

## 메시지 포맷

```
[계열사명 비용 이상 탐지]
- 탐지된 raw 데이터: ...
- Raw 데이터의 요약: ...
- 이를 바탕으로 분석된 원인: ...
- 조치 필요 여부: 예/아니요
```

## 트러블슈팅

### Slack에 메시지가 도착하지 않는 경우

1. Lambda 환경변수 `SLACK_WEBHOOK_URL`이 올바르게 설정되어 있는지 확인
2. Slack Webhook URL이 유효한지 확인 (만료되지 않았는지)
3. Lambda 함수의 CloudWatch Logs에서 에러 메시지 확인

### CORS 에러가 발생하는 경우

1. API Gateway에서 CORS 설정이 올바르게 되어 있는지 확인
2. Lambda 함수의 응답 헤더에 CORS 헤더가 포함되어 있는지 확인

### 프론트엔드에서 404 에러가 발생하는 경우

1. `.env` 파일의 `VITE_SLACK_API_ENDPOINT`가 올바른지 확인
2. API Gateway 엔드포인트 URL과 경로가 일치하는지 확인

## 비용

- Lambda: 월 100만 요청까지 무료, 이후 $0.20/100만 요청
- API Gateway: 월 100만 요청까지 무료, 이후 $1.00/100만 요청
- 예상 월 비용: 대부분의 경우 무료 티어 내에서 사용 가능

## 보안 고려사항

1. Slack Webhook URL은 Lambda 환경변수에 저장 (코드에 하드코딩하지 않음)
2. API Gateway에 필요시 API Key 또는 Cognito 인증 추가 가능
3. CORS 설정 시 프로덕션 환경에서는 `*` 대신 특정 도메인 지정 권장
