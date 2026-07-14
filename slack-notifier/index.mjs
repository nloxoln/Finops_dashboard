export const handler = async (event) => {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

  if (!SLACK_WEBHOOK_URL) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: false,
        error: 'SLACK_WEBHOOK_URL not configured',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { company, rawData, summary, cause, actionRequired } = body;

    const message = {
      text: `[${company} 비용 이상 탐지]\n- 탐지된 raw 데이터: ${rawData}\n- Raw 데이터의 요약: ${summary}\n- 이를 바탕으로 분석된 원인: ${cause}\n- 조치 필요 여부: ${actionRequired ? '예' : '아니요'}`,
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error sending Slack notification:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
