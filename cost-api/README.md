# Cost API Lambda Function

이 Lambda 함수는 FinOps 플랫폼에서 **AWS Cost Explorer** 로부터 실제 비용 데이터를
가져와 프론트엔드가 바로 쓸 수 있는 형태(요약 / 일별 추이 / 서비스별 추이)로 가공합니다.

프론트엔드의 아래 3개 데이터가 이 API 하나로 채워집니다.

- **평균/저번달/이번달 비용** (`CostSummary`)
- **계정 전체 일별 비용 추이** (`CostTrendData[]`)
- **서비스(EC2/RDS/Lambda/S3/CloudFront/DynamoDB)별 비용 추이** (`Resource[]`)

> 이상 탐지 / 종합 보고서는 이 API 범위가 아닙니다. (아직 Mock 데이터 사용)

## 응답 형식

```
GET {endpoint}?accountId=123456789013

{
  "summary":   { "lastMonth": 1234.56, "avgCost": 1100.00, "thisMonth": 987.65 },
  "trend":     [ { "date": "2026-06-15", "cost": 40.12 }, ... ],
  "resources": [ { "id": "ec2", "name": "서버", "type": "EC2", "costTrend": [...] }, ... ]
}
```

`accountId` 쿼리 파라미터는 AWS Organizations 의 Linked Account 필터(`LINKED_ACCOUNT`)로
사용됩니다. 생략하면 호출 계정 전체 비용을 반환합니다.

## 배포 방법

### 1. Cost Explorer 활성화

1. AWS 콘솔에서 **Billing and Cost Management** → **Cost Explorer** 로 이동
2. "Cost Explorer 활성화" 클릭 (최초 1회, 데이터 준비에 최대 24시간 소요)
3. Cost Explorer API 는 **us-east-1** 리전 전용입니다. (코드도 us-east-1 로 고정)

### 2. Lambda 함수 생성

1. AWS Lambda 콘솔 → "함수 생성" → "새로 작성"
2. 함수 이름: `finops-cost-api`
3. 런타임: Node.js 20.x
4. 아키텍처: x86_64
5. "함수 생성" 클릭

> `@aws-sdk/client-cost-explorer` 는 Node.js 20.x 런타임에 기본 포함되어 있어
> 코드만 붙여넣어도 동작합니다. 로컬 테스트용으로는 `npm install` 후 사용하세요.

### 3. 함수 코드 업로드

**방법 1: 직접 복사**
1. "코드" 탭에서 `index.mjs` 내용을 붙여넣고 "Deploy"

**방법 2: ZIP 업로드 (의존성 포함)**
```bash
cd cost-api
npm install
zip -r cost-api.zip index.mjs package.json node_modules
```
Lambda 콘솔 → "Upload from" → ".zip file"

### 4. IAM 권한 추가 (중요)

1. Lambda 함수 → "구성" 탭 → "권한" → 실행 역할 클릭
2. 해당 역할에 다음 정책을 추가(인라인 정책):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5. 환경변수 설정 (선택)

- 키: `DEFAULT_ACCOUNT_ID` / 값: 실습 계정 ID (쿼리 파라미터가 없을 때 기본값)
- 타임아웃을 넉넉히(예: 15초) 설정하는 것을 권장합니다.

### 6. API Gateway 생성

1. API Gateway 콘솔 → "API 생성" → "HTTP API" → "구축"
2. 통합: Lambda → `finops-cost-api`
3. API 이름: `finops-cost-api`
4. 경로 구성:
   - 메서드: **GET**
   - 리소스 경로: `/cost`
5. "다음" → "생성"

### 7. CORS 설정

1. API Gateway → 생성한 API → "CORS" → "구성"
   - Access-Control-Allow-Origin: `*` (또는 프론트엔드 도메인)
   - Access-Control-Allow-Headers: `Content-Type`
   - Access-Control-Allow-Methods: `GET, OPTIONS`
2. "저장"

### 8. 프론트엔드 환경변수 설정

프로젝트 루트 `.env`:

```
VITE_COST_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/cost
VITE_REAL_ACCOUNT_ID=123456789013
```

- `VITE_REAL_ACCOUNT_ID` 는 실제 데이터를 사용할 계정(예: 올리브영 실습 계정)의 ID이며,
  `src/mockData/payers.json` 의 해당 계열사 `accountId` 와 **일치**해야 합니다.
- 이 계정으로 로그인했을 때만 실제 API 를 호출하고, 나머지 계열사는 Mock 데이터를 씁니다.

## 테스트

### Lambda 직접 테스트

"테스트" 탭에서 새 이벤트 생성:

```json
{
  "queryStringParameters": { "accountId": "123456789013" }
}
```

정상이면 `summary` / `trend` / `resources` 를 담은 JSON 이 반환됩니다.

### 프론트엔드에서 테스트

1. `.env` 설정 후 `npm run dev`
2. 로그인 화면에서 **실습 계정에 해당하는 계열사** 선택
3. 대시보드에 실제 비용 데이터가 표시되는지 확인

## 트러블슈팅

- **AccessDeniedException**: IAM 역할에 `ce:GetCostAndUsage` 권한이 없음 (4단계)
- **DataUnavailableException / 빈 데이터**: Cost Explorer 활성화 직후라 데이터가 아직 준비 중
- **리전 오류**: Cost Explorer API 는 us-east-1 전용 — 코드/엔드포인트 리전 확인
- **CORS 에러**: API Gateway CORS 설정과 Lambda 응답 헤더 확인
- **금액이 0 / 서비스가 안 보임**: 실습 계정에 과금 내역이 거의 없을 수 있음. 최근 30일
  기준이며, 비용 0인 날/서비스는 응답에서 제외됩니다.

## 비용

- Cost Explorer API: **요청당 $0.01** (GetCostAndUsage) — 이 함수는 호출당 2회 요청
- Lambda / API Gateway: 대부분 무료 티어 내
- 프론트엔드에는 5초 캐시가 있어 대시보드 1회 로드 시 API 호출은 1회입니다.
