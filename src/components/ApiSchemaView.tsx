import { API_INTEGRATION_CONFIG } from '../services/busApi';

const SAMPLE_LTA_PAYLOAD = `{
  "BusStopCode": "09047",
  "Services": [
    {
      "ServiceNo": "65",
      "Operator": "SBST",
      "NextBus": {
        "EstimatedArrival": "2026-11-26T17:45:10+08:00",
        "Load": "SEA",
        "Feature": "WAB",
        "Type": "DD"
      },
      "NextBus2": {
        "EstimatedArrival": "2026-11-26T17:52:40+08:00",
        "Load": "SDA",
        "Feature": "WAB",
        "Type": "SD"
      }
    }
  ]
}`;

export function ApiSchemaView() {
  return (
    <section aria-label="API integration guide" className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          LTA DataMall API Integration Contract
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          This frontend is structured around Singapore&apos;s LTA DataMall <span className="font-mono text-slate-800">BusArrivalv2</span> response model so you can attach your backend proxy without rewriting UI components.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Current Mode</p>
            <p className="mt-1 font-semibold text-slate-900">
              {API_INTEGRATION_CONFIG.provider}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Target Proxy Route</p>
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

        <div className="p-5 sm:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Field Mapping Reference
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
            Expected JSON Payload (LTA BusArrivalv2)
          </h2>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{SAMPLE_LTA_PAYLOAD}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
