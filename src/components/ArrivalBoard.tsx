import { Fragment, useMemo, useState } from 'react';
import {
  Accessibility,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Pin,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import {
  formatArrivalMinutes,
  formatClockTime,
  getMinutesRemaining,
} from '../services/busApi';
import type {
  BusArrivalBoard,
  BusLoad,
  BusServiceArrival,
  BusType,
  FavoriteStop,
  NextBusEstimate,
} from '../types/bus';

interface ArrivalBoardProps {
  board: BusArrivalBoard | null;
  isLoading: boolean;
  nowMs: number;
  secondsUntilRefresh: number;
  favoriteEntry?: FavoriteStop;
  pinnedServices: string[];
  onToggleFavorite: () => void;
  onTogglePinnedService: (serviceNo: string) => void;
  onRefresh: () => void;
}

type ServiceFilterMode = 'all' | 'soon' | 'wab' | 'dd';

function getLoadMeta(load: BusLoad): { label: string; colorClass: string } {
  switch (load) {
    case 'SEA':
      return { label: 'Seats', colorClass: 'text-emerald-700' };
    case 'SDA':
      return { label: 'Standing', colorClass: 'text-amber-700' };
    case 'LSD':
      return { label: 'Limited', colorClass: 'text-red-700' };
  }
}

function getBusTypeLabel(type: BusType): string {
  switch (type) {
    case 'DD':
      return 'Double';
    case 'BD':
      return 'Bendy';
    case 'SD':
    default:
      return 'Single';
  }
}

function ArrivalCell({
  estimate,
  nowMs,
  isPrimary = false,
}: {
  estimate: NextBusEstimate | null;
  nowMs: number;
  isPrimary?: boolean;
}) {
  if (!estimate) {
    return (
      <div className="text-right text-xs text-slate-400 tabular-nums">—</div>
    );
  }

  const mins = getMinutesRemaining(estimate.estimatedArrival, nowMs);
  const label = formatArrivalMinutes(mins);
  const loadMeta = getLoadMeta(estimate.load);
  const deckLabel = getBusTypeLabel(estimate.type);

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono tabular-nums tracking-tight ${
            isPrimary
              ? mins <= 1
                ? 'text-xl font-bold text-blue-700'
                : 'text-xl font-bold text-slate-900'
              : 'text-sm font-semibold text-slate-800'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] mt-0.5 whitespace-nowrap">
        <span className={`font-semibold ${loadMeta.colorClass}`}>
          {loadMeta.label}
        </span>
        <span className="text-slate-300" aria-hidden="true">
          ·
        </span>
        <span className="text-slate-500">{deckLabel}</span>
        {estimate.feature === 'WAB' && (
          <Accessibility
            className="w-3 h-3 text-slate-500 shrink-0"
            aria-label="Wheelchair accessible"
          />
        )}
      </div>
    </div>
  );
}

export function ArrivalBoard({
  board,
  isLoading,
  nowMs,
  secondsUntilRefresh,
  favoriteEntry,
  pinnedServices,
  onToggleFavorite,
  onTogglePinnedService,
  onRefresh,
}: ArrivalBoardProps) {
  const [filterMode, setFilterMode] = useState<ServiceFilterMode>('all');
  const [serviceQuery, setServiceQuery] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isStarred = Boolean(favoriteEntry);

  const filteredServices = useMemo(() => {
    if (!board) return [];

    const q = serviceQuery.trim().toLowerCase();
    const list = board.services.filter((srv) => {
      if (q && !srv.serviceNo.toLowerCase().includes(q) && !srv.destinationName.toLowerCase().includes(q)) {
        return false;
      }
      if (filterMode === 'soon') {
        return getMinutesRemaining(srv.nextBus.estimatedArrival, nowMs) <= 5;
      }
      if (filterMode === 'wab') {
        return srv.nextBus.feature === 'WAB';
      }
      if (filterMode === 'dd') {
        return srv.nextBus.type === 'DD';
      }
      return true;
    });

    // Sort pinned services to the top while preserving numeric order inside groups
    return [...list].sort((a, b) => {
      const aPinned = pinnedServices.includes(a.serviceNo) ? 0 : 1;
      const bPinned = pinnedServices.includes(b.serviceNo) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      const numA = parseInt(a.serviceNo, 10);
      const numB = parseInt(b.serviceNo, 10);
      if (numA !== numB) return numA - numB;
      return a.serviceNo.localeCompare(b.serviceNo);
    });
  }, [board, filterMode, serviceQuery, nowMs, pinnedServices]);

  const handleCopyCode = () => {
    if (!board) return;
    navigator.clipboard?.writeText(board.busStopCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (isLoading && !board) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-44 bg-slate-200 rounded" />
          <div className="h-8 w-72 bg-slate-200 rounded" />
        </div>
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!board) return null;

  const secondsSinceFetch = Math.max(
    0,
    Math.floor((nowMs - new Date(board.fetchedAt).getTime()) / 1000)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Stop Identity Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Quiet unboxed metadata line */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
              <span className="font-mono font-semibold text-slate-700 tabular-nums">
                Stop {board.busStopCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{board.roadName}</span>
              <span aria-hidden="true">·</span>
              <span>{board.region}</span>
              {board.mrtNearby && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>MRT: {board.mrtNearby}</span>
                </>
              )}
            </div>

            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              {favoriteEntry?.customLabel
                ? `${favoriteEntry.customLabel} — ${board.description}`
                : board.description}
            </h1>

            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
              {board.services.length} active services
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{board.dataSource === 'live' ? 'Live LTA v3' : 'Preview data'}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              Updated {secondsSinceFetch === 0 ? 'just now' : `${secondsSinceFetch}s ago`}
              <span className="mx-1.5" aria-hidden="true">·</span>
              Next sync in {secondsUntilRefresh}s
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                isStarred
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Star
                className={`w-4 h-4 ${isStarred ? 'fill-amber-500 text-amber-600' : 'text-slate-500'}`}
                aria-hidden="true"
              />
              <span>{isStarred ? 'Saved' : 'Save Stop'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh arrivals for this stop"
              className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {board.dataSource === 'simulated' && (
          <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            {board.upstreamMessage ||
              `Showing simulated arrival estimates for stop ${board.busStopCode}. Add your LTA_ACCOUNT_KEY environment secret on the server to enable live LTA DataMall v3 arrivals.`}
          </div>
        )}
      </div>

      {/* Interactive Filter & Service Search Toolbar */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter bus services"
          className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto"
        >
          {(
            [
              { id: 'all', label: 'All Services' },
              { id: 'soon', label: 'Arriving ≤5 min' },
              { id: 'wab', label: 'Wheelchair' },
              { id: 'dd', label: 'Double-Decker' },
            ] as const
          ).map((tab) => {
            const active = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-56">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={serviceQuery}
            onChange={(e) => setServiceQuery(e.target.value)}
            placeholder="Filter bus no. or dest..."
            aria-label="Filter services at this stop"
            className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
          />
        </div>
      </div>

      {/* Arrival Table */}
      {filteredServices.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No matching bus services found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Adjust the active filter or clear the service search field to view all buses at this stop.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterMode('all');
              setServiceQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-white">
                <th className="py-3 pl-5 sm:pl-6 pr-3 w-[180px]">Service</th>
                <th className="py-3 px-3 hidden sm:table-cell">Direction</th>
                <th className="py-3 px-3 text-right">Next Bus</th>
                <th className="py-3 px-3 text-right">2nd Bus</th>
                <th className="py-3 pl-3 pr-5 sm:pr-6 text-right hidden md:table-cell">3rd Bus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((srv: BusServiceArrival) => {
                const isExpanded = expandedService === srv.serviceNo;
                const isPinned = pinnedServices.includes(srv.serviceNo);

                return (
                  <Fragment key={srv.serviceNo}>
                    <tr
                      onClick={() =>
                        setExpandedService(isExpanded ? null : srv.serviceNo)
                      }
                      className={`group transition-colors cursor-pointer ${
                        isExpanded ? 'bg-slate-50/90' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-4 pl-5 sm:pl-6 pr-3 align-middle">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePinnedService(srv.serviceNo);
                            }}
                            aria-label={
                              isPinned
                                ? `Unpin bus ${srv.serviceNo}`
                                : `Pin bus ${srv.serviceNo} to top`
                            }
                            className={`min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                              isPinned
                                ? 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-blue-700' : ''}`} />
                          </button>

                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                                {srv.serviceNo}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                {srv.operator}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 sm:hidden truncate max-w-[140px]">
                              To {srv.destinationName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3 align-middle hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              To {srv.destinationName}
                            </p>
                            <p className="text-xs text-slate-500">
                              From {srv.originName}
                            </p>
                          </div>
                          <span className="text-slate-400 ml-1" aria-hidden="true">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-3 align-middle">
                        <ArrivalCell estimate={srv.nextBus} nowMs={nowMs} isPrimary />
                      </td>

                      <td className="py-4 px-3 align-middle">
                        <ArrivalCell estimate={srv.nextBus2} nowMs={nowMs} />
                      </td>

                      <td className="py-4 pl-3 pr-5 sm:pr-6 align-middle hidden md:table-cell">
                        <ArrivalCell estimate={srv.nextBus3} nowMs={nowMs} />
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={5} className="px-5 sm:px-6 pb-4 pt-1">
                          <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-slate-700">
                                Scheduled Clock ETAs
                              </p>
                              <p className="mt-1 font-mono text-slate-600 tabular-nums">
                                {formatClockTime(srv.nextBus.estimatedArrival)}
                                {srv.nextBus2 && ` · ${formatClockTime(srv.nextBus2.estimatedArrival)}`}
                                {srv.nextBus3 && ` · ${formatClockTime(srv.nextBus3.estimatedArrival)}`}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">
                                Operating Hours
                              </p>
                              <p className="mt-1 font-mono text-slate-600 tabular-nums">
                                First {srv.firstBus} · Last {srv.lastBus}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">
                                Upcoming Corridor Stops
                              </p>
                              <p className="mt-1 text-slate-600">
                                {srv.upcomingStops.join(' → ')}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quiet Crowd Legend Footer */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            Crowd Load: <strong className="font-semibold text-emerald-700">Seats</strong>
            <span className="mx-1.5 text-slate-300" aria-hidden="true">/</span>
            <strong className="font-semibold text-amber-700">Standing</strong>
            <span className="mx-1.5 text-slate-300" aria-hidden="true">/</span>
            <strong className="font-semibold text-red-700">Limited</strong>
          </span>
        </div>
        <span>Click any service row for clock ETAs & corridor stops</span>
      </div>
    </div>
  );
}
