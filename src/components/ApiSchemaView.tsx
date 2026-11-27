import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { API_INTEGRATION_CONFIG, fetchApiHealth } from '../services/busApi';
import type { ApiHealthStatus } from '../types/bus';

const SAMPLE_LTA_V3_PAYLOAD = `{
  "BusStopCode": "04121",
  "Services": [
    {
      "ServiceNo": "51",
      "Operator": "SBST",
      "NextBus": {
        "OriginCode": "64009",
        "DestinationCode": "28009",
        "EstimatedArrival": "2026-11-26T18:14:10+08:00",
        "Monitored": 1,
        "Load": "SEA",
        "Feature": "WAB",
        "Type": "DD"
      },
      "NextBus2": {
        "EstimatedArrival": "2026-11-26T18:22:40+08:00",
        "Monitored": 1,
        "Load": "SDA",
        "Feature": "WAB",
        "Type": "SD"
      }
    }
  ]
}`;

export function ApiSchemaView() {
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const result = await fetchApiHealth();
      setHealth(result);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void checkHealth();
  }, []);

  return (
    <section aria-label="API integration guide" className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            LTA DataMall v3 Serverless Integration
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Serverless endpoints in <span className="font-mono text-slate-800">/api/health.ts</span> and{' '}
            <span className="font-mono text-slate-800">/api/busarrival.ts</span> proxy requests to LTA DataMall v3 using your server-side{' '}
            <span className="font-mono text-slate-800">LTA_ACCOUNT_KEY</span> secret.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void checkHealth()}
          disabled={checking}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>Check /api/health</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Health Endpoint</p>
            <p className="mt-1 font-mono text-xs font-semibold text-slate-900">
              {health ? (health.ok ? '200 OK' : 'Unavailable') : 'Checking...'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">LTA_ACCOUNT_KEY</p>
            <p
              className={`mt-1 text-xs font-semibold ${
                health?.ltaConfigured ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {health
                ? health.ltaConfigured
                  ? 'Configured on server'
                  : 'Not set (Preview fallback)'
                : 'Checking...'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Proxy Route</p>
            <p className="mt-1 font-mono text-xs font-semibold text-blue-700 break-all">
              {API_INTEGRATION_CONFIG.expectedEndpoint}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sync Interval</p>
            <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
              Every {API_INTEGRATION_CONFIG.refreshIntervalSeconds}s
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-2 text-xs text-slate-600">
          <h2 className="text-sm font-semibold text-slate-900">
            Upstream LTA Endpoints
          </h2>
          <p className="font-mono text-slate-800 break-all">
            GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
          </p>
          <p className="font-mono text-slate-600 break-all">
            Optional filter: &amp;ServiceNo=7 · Header: AccountKey: &lt;LTA_ACCOUNT_KEY&gt;
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Field Mapping Reference (LTA v3)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-semibold">LTA Field</th>
                  <th className="py-2 px-4 font-semibold">Values</th>
                  <th className="py-2 pl-4 font-semibold">UI Rendering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold">Load</td>
                  <td className="py-2.5 px-4 font-mono">SEA · SDA · LSD</td>
                  <td className="py-2.5 pl-4">Seats · Standing · Limited</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold">Type</td>
                  <td className="py-2.5 px-4 font-mono">SD · DD · BD</td>
                  <td className="py-2.5 pl-4">Single · Double · Bendy</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold">Feature</td>
                  <td className="py-2.5 px-4 font-mono">WAB</td>
                  <td className="py-2.5 pl-4">Wheelchair Accessible indicator</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold">Monitored</td>
                  <td className="py-2.5 px-4 font-mono">1 · 0</td>
                  <td className="py-2.5 pl-4">Live GPS vs Scheduled estimate</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold">Operator</td>
                  <td className="py-2.5 px-4 font-mono">SBST · SMRT · TTS · GAS</td>
                  <td className="py-2.5 pl-4">Displayed beside service number</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-2.5">
          <h2 className="text-sm font-semibold text-slate-900">
            Expected JSON Payload (LTA v3 BusArrival)
          </h2>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{SAMPLE_LTA_V3_PAYLOAD}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
