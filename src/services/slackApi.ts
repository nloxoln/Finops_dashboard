import type { SlackNotification } from '../types';

const SLACK_API_ENDPOINT = import.meta.env.VITE_SLACK_API_ENDPOINT;

export const sendSlackNotification = async (data: SlackNotification): Promise<{ success: boolean }> => {
  if (!SLACK_API_ENDPOINT) {
    console.warn('SLACK_API_ENDPOINT is not configured');
    throw new Error('슬랙 API 엔드포인트가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  try {
    const response = await fetch(SLACK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    throw new Error('슬랙 알림 전송에 실패했습니다.');
  }
};
