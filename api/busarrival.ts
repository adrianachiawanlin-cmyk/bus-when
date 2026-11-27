interface ApiRequest {
  method?: string;
  query?: Record<string, unknown>;
  url?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const LTA_BUS_ARRIVAL_V3_URL =
  'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

function getSingleQueryParam(
  req: ApiRequest,
  key: string
): string | undefined {
  const fromQuery = req.query?.[key];
  if (typeof fromQuery === 'string') {
    return fromQuery;
  }
  if (Array.isArray(fromQuery) && typeof fromQuery[0] === 'string') {
    return fromQuery[0];
  }
  if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      return parsed.searchParams.get(key) ?? undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const rawBusStopCode = getSingleQueryParam(req, 'BusStopCode')?.trim() ?? '';
  if (!/^\d{5}$/.test(rawBusStopCode)) {
    res.status(400).json({
      error: 'INVALID_BUS_STOP_CODE',
      message: 'BusStopCode must be a 5-digit Singapore bus stop code.',
    });
    return;
  }

  const rawServiceNo = getSingleQueryParam(req, 'ServiceNo')?.trim();
  if (rawServiceNo && !/^[A-Za-z0-9]{1,6}$/.test(rawServiceNo)) {
    res.status(400).json({
      error: 'INVALID_SERVICE_NO',
      message: 'ServiceNo must be an alphanumeric bus service number.',
    });
    return;
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY?.trim();
  if (!accountKey) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({
      error: 'LTA_ACCOUNT_KEY_NOT_CONFIGURED',
      message:
        'Server environment variable LTA_ACCOUNT_KEY is not configured.',
    });
    return;
  }

  const upstreamUrl = new URL(LTA_BUS_ARRIVAL_V3_URL);
  upstreamUrl.searchParams.set('BusStopCode', rawBusStopCode);
  if (rawServiceNo) {
    upstreamUrl.searchParams.set('ServiceNo', rawServiceNo);
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstreamResponse.ok) {
      const status =
        upstreamResponse.status === 401 || upstreamResponse.status === 403
          ? 502
          : upstreamResponse.status >= 500
          ? 502
          : upstreamResponse.status;

      res.setHeader('Cache-Control', 'no-store');
      res.status(status).json({
        error: 'LTA_UPSTREAM_ERROR',
        upstreamStatus: upstreamResponse.status,
        message: 'Failed to retrieve bus arrivals from LTA DataMall.',
      });
      return;
    }

    const payload = await upstreamResponse.json();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json(payload);
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');

    res.setHeader('Cache-Control', 'no-store');
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? 'LTA_UPSTREAM_TIMEOUT' : 'LTA_NETWORK_ERROR',
      message: isTimeout
        ? 'LTA DataMall request timed out.'
        : 'Unable to reach LTA DataMall service.',
    });
  }
}
