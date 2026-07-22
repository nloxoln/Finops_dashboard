// slack-notifier — 비용 이상 알림을 Slack Incoming Webhook 으로 전송
// 심각도(severity)에 따라 색상/이모지를 달리해 한눈에 구분되게 한다.
//   - CRITICAL : 🔴 빨강 (4σ 초과 ≈ 상위 0.003%)
//   - WARNING  : 🟠 주황 (2σ 초과 ≈ 상위 2.3%)
//   - CREATE   : 🟢 초록 (리소스 생성 감지)
//   - MODIFY   : 🟣 보라 (리소스 사양 변경 감지)
//   - (그 외)  : 🔵 파랑 (테스트/정보)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SEVERITY_STYLE = {
  CRITICAL: { color: '#E01E5A', emoji: '🔴', label: '심각(CRITICAL)' },
  WARNING: { color: '#F5A623', emoji: '🟠', label: '경고(WARNING)' },
  CREATE: { color: '#2EB67D', emoji: '🟢', label: '리소스 생성 감지' },
  MODIFY: { color: '#611F69', emoji: '🟣', label: '리소스 사양 변경 감지' },
  INFO: { color: '#4A90E2', emoji: '🔵', label: '정보' },
};

const resp = (statusCode, obj) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

export const handler = async (event) => {
  // CORS preflight
  if (event?.requestContext?.http?.method === 'OPTIONS' || event?.httpMethod === 'OPTIONS') {
    return resp(200, {});
  }

  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    return resp(500, { success: false, error: 'SLACK_WEBHOOK_URL not configured' });
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const {
      company = '올리브영',
      severity, // 'CRITICAL' | 'WARNING' | 'CREATE' | 'MODIFY' | undefined
      service,
      rawData,
      summary,
      cause,
      actionRequired,
      metric, // { expected, actual, z }
      detectedAt,
      hourUTC,
      // ---- 신규(선택) 필드. 안 보내면 기존 동작 그대로 (하위호환) ----
      title, // 커스텀 제목. 주면 "[company 비용 이상탐지] label" 대신 이걸 사용
      hideActionRequired, // true 면 '조치 필요' 필드 숨김
    } = body;

    const style = SEVERITY_STYLE[severity] || SEVERITY_STYLE.INFO;

    // ---- 헤더 라인 ----
    // title 이 오면 커스텀 제목 사용, 없으면 기존 포맷 유지
    const headerText = title
      ? `${style.emoji} [${company}] ${title}${service ? ` · ${service}` : ''}`
      : `${style.emoji} [${company} 비용 이상탐지] ${style.label}${service ? ` · ${service}` : ''}`;

    // ---- 상세 필드 (Block Kit) ----
    const fields = [];
    if (metric && (metric.expected != null || metric.actual != null)) {
      fields.push({
        type: 'mrkdwn',
        text: `*예상 영향*\n평소 $${metric.expected} → *$${metric.actual}*${metric.z != null ? ` (${metric.z}σ)` : ''}`,
      });
    }
    if (hourUTC) fields.push({ type: 'mrkdwn', text: `*대상 시각(UTC)*\n${hourUTC}` });
    if (detectedAt) fields.push({ type: 'mrkdwn', text: `*탐지 시각*\n${detectedAt}` });
    if (!hideActionRequired) {
      fields.push({ type: 'mrkdwn', text: `*조치 필요*\n${actionRequired ? ':exclamation: 예' : '아니요'}` });
    }

    const blocks = [
      { type: 'header', text: { type: 'plain_text', text: headerText, emoji: true } },
    ];
    if (fields.length) blocks.push({ type: 'section', fields: fields.slice(0, 10) });
    if (summary) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*요약*\n${summary}` } });
    if (cause) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*추정 원인*\n${cause}` } });
    if (rawData) blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `탐지 데이터: ${rawData}` }] });

    // attachments 의 color 로 심각도 색상 바를 표시 (Block Kit 만으로는 색상바 불가)
    const message = {
      text: headerText, // 알림 미리보기/폴백 텍스트
      attachments: [{ color: style.color, blocks }],
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

    return resp(200, { success: true });
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return resp(500, { success: false, error: error.message });
  }
};
