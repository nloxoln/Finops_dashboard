import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { sendSlackNotification } from '../services/slackApi';

export const MyPage: React.FC = () => {
  const { selectedPayer } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTestNotification = async () => {
    setSending(true);
    setMessage(null);

    try {
      await sendSlackNotification({
        company: selectedPayer?.name || '테스트 계열사',
        rawData: 'ap-northeast-2 리전 t3.large 인스턴스 5대 추가 기동 (14:20-16:45), 일일 비용 $412.50 → $789.32',
        summary: '서울 리전 t3.large 인스턴스 5대 추가 기동으로 비용 91% 증가',
        cause: '예상치 못한 트래픽 급증으로 인한 Auto Scaling 자동 스케일아웃 발생. 트래픽 소스 분석 필요',
        actionRequired: true,
      });

      setMessage({
        type: 'success',
        text: '슬랙 알림이 성공적으로 전송되었습니다!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '슬랙 알림 전송에 실패했습니다.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">계정 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">계열사</label>
              <p className="text-base text-gray-900">{selectedPayer?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">담당자</label>
              <p className="text-base text-gray-900">임정연</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">담당자 ID</label>
              <p className="text-base text-gray-900">jy_lim</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">슬랙 연동</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                연동 상태
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_SLACK_API_ENDPOINT ? 'bg-green' : 'bg-gray-100'}`}></div>
                  <span className="text-sm text-gray-900">
                    {import.meta.env.VITE_SLACK_API_ENDPOINT ? '연동됨' : '미연동'}
                  </span>
                </div>
              </div>
            </div>

            {import.meta.env.VITE_SLACK_API_ENDPOINT && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  연동된 슬랙 정보
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 mb-1">
                    <span className="font-medium">워크스페이스:</span> CJ FinOps
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">채널:</span> #cost-alerts
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-4">
                슬랙 연동 설정은 Lambda 환경변수에서 관리됩니다.
                <br />
                API Gateway 엔드포인트를 .env 파일의 VITE_SLACK_API_ENDPOINT에 설정하세요.
              </p>

              <Button
                onClick={handleTestNotification}
                disabled={sending || !import.meta.env.VITE_SLACK_API_ENDPOINT}
                className="flex items-center gap-2"
              >
                <Bell size={20} />
                <span>{sending ? '전송 중...' : '테스트 알림 보내기'}</span>
              </Button>

              {!import.meta.env.VITE_SLACK_API_ENDPOINT && (
                <p className="text-sm text-orange mt-3">
                  슬랙 API 엔드포인트가 설정되지 않았습니다. .env 파일을 확인해주세요.
                </p>
              )}
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green/10 text-green'
                    : 'bg-orange/10 text-orange'
                }`}
              >
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
