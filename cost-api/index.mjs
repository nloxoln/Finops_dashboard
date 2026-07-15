import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer';

const client = new CostExplorerClient({ region: 'us-east-1' });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

// Cost Explorer 의 서비스 이름을 프론트엔드 리소스 카드에 맞게 매핑
// (매핑되지 않은 서비스는 'others' 로 합산)
const SERVICE_MAP = [
  { match: /Elastic Compute Cloud|EC2/i, id: 'ec2', name: '서버', type: 'EC2' },
  { match: /Relational Database/i, id: 'rds', name: 'RDS', type: 'RDS' },
  { match: /Lambda/i, id: 'lambda', name: '람다', type: 'Lambda' },
  { match: /Simple Storage Service|(^|\W)S3(\W|$)/i, id: 's3', name: 'S3', type: 'S3' },
  { match: /CloudFront/i, id: 'cloudfront', name: 'CloudFront', type: 'CloudFront' },
  { match: /DynamoDB/i, id: 'dynamodb', name: 'DynamoDB', type: 'DynamoDB' },
];

const classifyService = (serviceName) => {
  const found = SERVICE_MAP.find((s) => s.match.test(serviceName));
  return found || { id: 'others', name: '기타', type: 'Others' };
};

// YYYY-MM-DD (UTC) 포맷
const toDateStr = (date) => date.toISOString().slice(0, 10);

// n개월 전 1일 ~ 오늘까지 (MONTHLY 는 End 가 exclusive 라 다음달 1일까지 요청)
const buildMonthlyRange = (monthsBack) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: toDateStr(start), end: toDateStr(end) };
};

const buildDailyRange = (daysBack) => {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - daysBack);
  return { start: toDateStr(start), end: toDateStr(end) };
};

const round2 = (n) => Math.round(n * 100) / 100;

export const handler = async (event) => {
  // CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const accountId =
    event.queryStringParameters?.accountId ||
    process.env.DEFAULT_ACCOUNT_ID ||
    null;

  // 특정 linked account 로 필터 (Organizations 사용 시). accountId 없으면 계정 전체.
  const filter = accountId
    ? { Dimensions: { Key: 'LINKED_ACCOUNT', Values: [accountId] } }
    : undefined;

  try {
    const monthly = buildMonthlyRange(2); // 이번달 포함 최근 3개월
    const daily = buildDailyRange(30);

    const [monthlyRes, dailyRes] = await Promise.all([
      client.send(
        new GetCostAndUsageCommand({
          TimePeriod: { Start: monthly.start, End: monthly.end },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
          ...(filter ? { Filter: filter } : {}),
        })
      ),
      client.send(
        new GetCostAndUsageCommand({
          TimePeriod: { Start: daily.start, End: daily.end },
          Granularity: 'DAILY',
          Metrics: ['UnblendedCost'],
          GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
          ...(filter ? { Filter: filter } : {}),
        })
      ),
    ]);

    // ── 1) CostSummary: 월별 합계 → 저번달/이번달/평균 ──
    const monthlyTotals = (monthlyRes.ResultsByTime || []).map((r) =>
      parseFloat(r.Total?.UnblendedCost?.Amount || '0')
    );
    const thisMonth = monthlyTotals[monthlyTotals.length - 1] || 0;
    const lastMonth = monthlyTotals[monthlyTotals.length - 2] || 0;
    const avgCost =
      monthlyTotals.length > 0
        ? monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
        : 0;

    const summary = {
      lastMonth: round2(lastMonth),
      avgCost: round2(avgCost),
      thisMonth: round2(thisMonth),
    };

    // ── 2) 일별 데이터 → 전체 추이 + 서비스별 추이 ──
    const trendByDate = {}; // date -> total
    const resourceMap = {}; // id -> { meta, trend: { date -> cost } }

    for (const day of dailyRes.ResultsByTime || []) {
      const date = day.TimePeriod?.Start;
      for (const group of day.Groups || []) {
        const serviceName = group.Keys?.[0] || '';
        const cost = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
        if (cost === 0) continue;

        trendByDate[date] = (trendByDate[date] || 0) + cost;

        const svc = classifyService(serviceName);
        if (!resourceMap[svc.id]) {
          resourceMap[svc.id] = { meta: svc, trend: {} };
        }
        resourceMap[svc.id].trend[date] = (resourceMap[svc.id].trend[date] || 0) + cost;
      }
    }

    const trend = Object.entries(trendByDate)
      .map(([date, cost]) => ({ date, cost: round2(cost) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const resources = Object.values(resourceMap)
      .map(({ meta, trend: t }) => ({
        id: meta.id,
        name: meta.name,
        type: meta.type,
        costTrend: Object.entries(t)
          .map(([date, cost]) => ({ date, cost: round2(cost) }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      }))
      // 총 비용이 큰 순서로 정렬
      .sort((a, b) => {
        const sum = (arr) => arr.reduce((s, x) => s + x.cost, 0);
        return sum(b.costTrend) - sum(a.costTrend);
      });

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, trend, resources }),
    };
  } catch (error) {
    console.error('Cost Explorer error:', error);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
