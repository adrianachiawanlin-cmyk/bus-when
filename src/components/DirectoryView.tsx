import { useMemo, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusStops';
import type { BusStop, SingaporeRegion } from '../types/bus';

interface DirectoryViewProps {
  isFavorite: (busStopCode: string) => boolean;
  onToggleFavorite: (stop: BusStop) => void;
  onOpenStop: (busStopCode: string) => void;
}

const REGIONS: ('All' | SingaporeRegion)[] = [
  'All',
  'Central',
  'East',
  'West',
  'North',
  'North-East',
];

export function DirectoryView({
  isFavorite,
  onToggleFavorite,
  onOpenStop,
}: DirectoryViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<'All' | SingaporeRegion>('All');

  const filteredStops = useMemo(() => {
    if (selectedRegion === 'All') return SINGAPORE_BUS_STOPS;
    return SINGAPORE_BUS_STOPS.filter((s) => s.region === selectedRegion);
  }, [selectedRegion]);

  return (
    <section aria-label="Singapore bus stop directory" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Singapore Bus Stop Directory
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select any major MRT interchange or corridor stop to check live arrival countdowns or save it for quick access.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter stops by Singapore region"
          className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto self-start md:self-auto"
        >
          {REGIONS.map((region) => {
            const active = selectedRegion === region;
            return (
              <button
                key={region}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50/70">
                <th className="py-3 pl-5 sm:pl-6 pr-3 w-28">Stop Code</th>
                <th className="py-3 px-3">Stop Name & Road</th>
                <th className="py-3 px-3 hidden md:table-cell">Services</th>
                <th className="py-3 pl-3 pr-5 sm:pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStops.map((stop) => {
                const starred = isFavorite(stop.busStopCode);
                return (
                  <tr
                    key={stop.busStopCode}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 pl-5 sm:pl-6 pr-3 align-middle">
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {stop.busStopCode}
                      </span>
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <p className="text-sm font-semibold text-slate-900">
                        {stop.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {stop.roadName} · {stop.region}
                        {stop.mrtNearby ? ` · ${stop.mrtNearby}` : ''}
                      </p>
                    </td>
                    <td className="py-4 px-3 align-middle hidden md:table-cell">
                      <p className="font-mono text-xs text-slate-600">
                        {stop.services.map((s) => s.serviceNo).join(', ')}
                      </p>
                    </td>
                    <td className="py-4 pl-3 pr-5 sm:pr-6 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(stop)}
                          aria-label={
                            starred
                              ? `Remove ${stop.description} from favorites`
                              : `Save ${stop.description} to favorites`
                          }
                          className={`min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                            starred
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${starred ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenStop(stop.busStopCode)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Arrivals</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
