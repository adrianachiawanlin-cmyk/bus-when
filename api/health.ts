interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const ltaConfigured = Boolean(process.env.LTA_ACCOUNT_KEY?.trim());

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'nextbus-sg-api',
    endpointVersion: 'v3',
    ltaConfigured,
    refreshIntervalSeconds: 20,
    timestamp: new Date().toISOString(),
  });
}
