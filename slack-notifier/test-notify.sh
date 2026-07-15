#!/usr/bin/env bash
# slack-notifier 수동 테스트 — 비용 데이터 없이 슬랙 알림 렌더링(심각도 색상/레이아웃) 검증용.
# 사용법:  bash test-notify.sh [critical|warning|info|all]
#   예)   bash test-notify.sh all
#
# 엔드포인트는 finops_dev/.env 의 VITE_SLACK_API_ENDPOINT 와 동일해야 함.

set -euo pipefail

ENDPOINT="${SLACK_API_ENDPOINT:-https://2k9ab45gr5.execute-api.ap-northeast-2.amazonaws.com/slack/notify}"
KIND="${1:-all}"

send() {
  local payload="$1"
  echo "── POST ($(echo "$payload" | grep -o '"severity":"[^"]*"')) ──"
  curl -sS -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$payload"
  echo
}

CRITICAL='{
  "company": "올리브영",
  "severity": "CRITICAL",
  "service": "cloudfront",
  "rawData": "cloudfront 시간당 추정 $11.82 (baseline 평균 $3.21, seasonal, n=4)",
  "summary": "cloudfront 추정비용이 평소 대비 4.7σ 상승",
  "cause": "CloudFront 요청/전송량 급증 — 캐시 미스율 상승(롱테일/스크래핑) 의심",
  "actionRequired": true,
  "metric": { "expected": 3.21, "actual": 11.82, "z": 4.7 },
  "detectedAt": "2026-07-20T14:10:00+09:00",
  "hourUTC": "2026-07-20T05"
}'

WARNING='{
  "company": "올리브영",
  "severity": "WARNING",
  "service": "rds",
  "rawData": "rds 시간당 추정 $0.28 (baseline 평균 $0.19, seasonal, n=4)",
  "summary": "rds 추정비용이 평소 대비 2.4σ 상승",
  "cause": "RDS I/O·CPU 급증 — 쓰기 폭주(RDS_WRITE 유형) 의심",
  "actionRequired": false,
  "metric": { "expected": 0.19, "actual": 0.28, "z": 2.4 },
  "detectedAt": "2026-07-20T14:10:00+09:00",
  "hourUTC": "2026-07-20T05"
}'

INFO='{
  "company": "올리브영",
  "service": "test",
  "rawData": "연동 테스트 페이로드",
  "summary": "슬랙 연동 확인용 정보성 알림",
  "cause": "테스트",
  "actionRequired": false
}'

case "$KIND" in
  critical) send "$CRITICAL" ;;
  warning)  send "$WARNING" ;;
  info)     send "$INFO" ;;
  all)      send "$CRITICAL"; send "$WARNING"; send "$INFO" ;;
  *) echo "사용법: bash test-notify.sh [critical|warning|info|all]"; exit 1 ;;
esac

echo "완료 — 슬랙 채널에서 색상(🔴빨강/🟠주황/🔵파랑)과 레이아웃을 확인하세요."
