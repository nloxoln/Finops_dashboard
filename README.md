# O'CLOUD FinOps 플랫폼

AWS 계열사별 클라우드 비용 관리를 위한 FinOps 플랫폼입니다.

## 주요 기능

- 📊 **대시보드**: 계열사별 비용 요약 및 추이 분석
- 📈 **리소스별 분석**: EC2, RDS, Lambda 등 리소스별 상세 비용 추이
- 🔔 **이상 탐지**: 비용 급증 및 이상 패턴 자동 탐지
- 📄 **종합 보고서**: 월별 비용 분석 보고서 생성 및 PDF 다운로드
- 💬 **Slack 연동**: 실시간 비용 이상 알림 (Incoming Webhook)

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router v6
- **Backend**: AWS Lambda + API Gateway
- **Notifications**: Slack Incoming Webhook

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- AWS 계정 (Lambda 및 API Gateway 배포용, 선택사항)
- Slack 워크스페이스 (알림 기능 사용 시, 선택사항)

### 설치

```bash
# 의존성 설치
npm install
```

### 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```bash
# Slack API 엔드포인트 (선택사항)
VITE_SLACK_API_ENDPOINT=https://your-api-gateway-url.execute-api.region.amazonaws.com/slack/notify
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 프로젝트 구조

```
finops_dev/
├── public/                 # 정적 파일
├── src/
│   ├── assets/            # 이미지, 폰트 등
│   ├── components/        # React 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── common/       # 공통 컴포넌트
│   │   ├── cards/        # 카드 컴포넌트
│   │   ├── charts/       # 차트 컴포넌트
│   │   └── tables/       # 테이블 컴포넌트
│   ├── contexts/          # React Context
│   ├── hooks/             # 커스텀 훅
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # API 서비스
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   ├── mockData/          # Mock 데이터
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── main.tsx           # 엔트리 포인트
│   └── index.css          # 글로벌 스타일
├── slack-notifier/        # Lambda 함수
│   ├── index.mjs         # Lambda 핸들러
│   ├── package.json      # Lambda 의존성
│   └── README.md         # Lambda 배포 가이드
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 페이지 구성

### 1. 로그인 페이지 (`/login`)
- 계열사(Payer) 선택
- Mock 인증 (실제 인증 없음)

### 2. 메인 대시보드 (`/dashboard`)
- 계정 전체 합산 비용 (저번달/평균/이번달)
- 계정 비용 추이 그래프
- 리소스별 비용 카드

### 3. 리소스 상세 (`/dashboard/resource/:id`)
- 리소스별 상세 비용 추이
- 기간 선택 (1일/1주일/1달/3달/1년)
- 이상 탐지 내역 테이블

### 4. 종합보고서 (`/reports`)
- 월별 보고서 목록
- PDF 다운로드 (Mock)

### 5. 보고서 상세 (`/reports/:id`)
- 보고서 내용 표시
- PDF 다운로드 버튼

### 6. 마이페이지 (`/mypage`)
- 계정 정보
- 슬랙 연동 상태
- 테스트 알림 보내기

## Slack 연동 설정

슬랙 알림 기능을 사용하려면 다음 단계를 따르세요:

1. **Slack Incoming Webhook 생성**
   - [Slack API 앱 생성](https://api.slack.com/apps)
   - Incoming Webhooks 활성화
   - Webhook URL 복사

2. **Lambda 함수 배포**
   - `slack-notifier/README.md` 참고
   - AWS Lambda에 함수 배포
   - 환경변수에 Webhook URL 설정

3. **API Gateway 설정**
   - HTTP API 생성
   - Lambda 통합
   - CORS 설정

4. **프론트엔드 환경변수**
   - `.env` 파일에 API Gateway URL 설정

자세한 내용은 [`slack-notifier/README.md`](./slack-notifier/README.md)를 참고하세요.

## Mock 데이터

현재 버전은 Mock 데이터를 사용합니다:

- **계열사**: CJ대한통운, CJ제일제당, CJ ENM
- **리소스**: EC2, RDS, Lambda, S3, CloudFront, DynamoDB
- **비용 추이**: 최근 1개월 데이터
- **이상 탐지**: 4건의 샘플 이상 탐지 내역
- **보고서**: 5개의 월별 보고서

실제 AWS Cost Explorer API 연동 시 `src/services/api.ts`를 수정하세요.

## 디자인 시스템

### 색상
- **Primary**: `#5B4FFF` (보라색)
- **Blue**: `#4A90E2` (저번달 비용)
- **Green**: `#50E3C2` (평균 비용)
- **Orange**: `#F5A623` (이번달 비용)

### 폰트
- Pretendard (한글)
- Inter (영문)

### 레이아웃
- 데스크톱 전용 (최소 너비 1280px)
- 고정 사이드바 (왼쪽 240px)
- 상단 헤더 (64px)

## 주의사항

- **인증**: 현재 Mock 구현 (실제 Payer 권한 인증 필요)
- **PDF 다운로드**: 프론트엔드에서는 버튼만 구현 (백엔드 PDF 생성 필요)
- **데이터**: Mock 데이터 사용 (실제 AWS API 연동 필요)
- **반응형**: 데스크톱 전용 (모바일 미지원)

## 개발 가이드

### 새로운 페이지 추가

1. `src/pages/` 에 페이지 컴포넌트 생성
2. `src/App.tsx` 에 라우트 추가
3. 필요시 `src/components/layout/Sidebar.tsx` 에 메뉴 추가

### 새로운 Mock 데이터 추가

1. `src/mockData/` 에 JSON 파일 생성
2. `src/services/api.ts` 에 fetch 함수 추가
3. `src/types/index.ts` 에 타입 정의 추가

### 스타일 커스터마이징

- 색상: `tailwind.config.js` 수정
- 글로벌 스타일: `src/index.css` 수정
- 컴포넌트 스타일: Tailwind CSS 유틸리티 클래스 사용

## 라이선스

This project is licensed under the MIT License.


