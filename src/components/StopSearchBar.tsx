import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, Star, X } from 'lucide-react';
import { isValidBusStopCode, searchBusStops } from '../services/busApi';
import type { BusStop } from '../types/bus';

interface StopSearchBarProps {
  activeStopCode: string;
  onSelectStop: (busStopCode: string) => void;
  isFavorite: (busStopCode: string) => boolean;
  onToggleFavorite: (stop: BusStop) => void;
}

const QUICK_CODES: { code: string; label: string }[] = [
  { code: '09047', label: '09047 Orchard' },
  { code: '01012', label: '01012 Bugis' },
  { code: '14141', label: '14141 VivoCity' },
  { code: '75009', label: '75009 Tampines' },
  { code: '28009', label: '28009 Jurong East' },
  { code: '95129', label: '95129 Changi T2' },
];

export function StopSearchBar({
  activeStopCode,
  onSelectStop,
  isFavorite,
  onToggleFavorite,
}: StopSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchBusStops(query), [query]);
  const trimmedQuery = query.trim();
  const isFiveDigitCode = isValidBusStopCode(trimmedQuery);
  const exactInResults = results.some((s) => s.busStopCode === trimmedQuery);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
    if (validationMessage) setValidationMessage('');
  }, [query]);

  const handleChooseCode = (code: string) => {
    setValidationMessage('');
    onSelectStop(code);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;

    if (isFiveDigitCode) {
      handleChooseCode(trimmedQuery);
      return;
    }

    if (results.length > 0) {
      const chosen = results[highlightedIndex] ?? results[0];
      handleChooseCode(chosen.busStopCode);
      return;
    }

    setValidationMessage(
      'Enter a valid 5-digit Singapore bus stop code (e.g. 09047) or search by road or MRT name.'
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <section aria-label="Bus stop search" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div ref={containerRef} className="relative max-w-3xl">
          <form onSubmit={handleSubmit} className="flex items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                value={query}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter 5-digit bus stop code (e.g. 09047) or search road, MRT, bus no..."
                aria-label="Search Singapore bus stop code, road, or landmark"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                className="w-full h-12 pl-10 pr-20 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setValidationMessage('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 h-12 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <span>Check Arrivals</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {validationMessage && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-700">
              {validationMessage}
            </p>
          )}

          {isOpen && (
            <div
              role="listbox"
              aria-label="Matching bus stops"
              className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-40 max-h-80 overflow-y-auto"
            >
              {isFiveDigitCode && !exactInResults && (
                <button
                  type="button"
                  onClick={() => handleChooseCode(trimmedQuery)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 bg-blue-50/70 hover:bg-blue-50 border-b border-slate-200 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-blue-800 tabular-nums">
                        {trimmedQuery}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Look up bus stop code {trimmedQuery}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Direct 5-digit code lookup
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-700 shrink-0" />
                </button>
              )}

              {results.length > 0 ? (
                results.slice(0, 8).map((stop, idx) => {
                  const starred = isFavorite(stop.busStopCode);
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <div
                      key={stop.busStopCode}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-slate-100 transition-colors ${
                        isHighlighted ? 'bg-slate-50' : 'bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleChooseCode(stop.busStopCode)}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-slate-900 tabular-nums shrink-0">
                            {stop.busStopCode}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {stop.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 truncate">
                          <span>{stop.roadName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{stop.region}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">
                            {stop.services.slice(0, 5).map((s) => s.serviceNo).join(', ')}
                            {stop.services.length > 5 ? ` +${stop.services.length - 5}` : ''}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(stop);
                        }}
                        aria-label={
                          starred
                            ? `Remove ${stop.description} from favorites`
                            : `Save ${stop.description} to favorites`
                        }
                        className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
                          starred
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${starred ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No catalog stop matches &ldquo;{query}&rdquo;. Enter any 5-digit code to run a direct lookup.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
            Quick stops:
          </span>
          <div className="flex items-center gap-1.5">
            {QUICK_CODES.map((item) => {
              const isSelected = activeStopCode === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleChooseCode(item.code)}
                  className={`px-2.5 py-1.5 min-h-[34px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono tabular-nums">{item.code}</span>{' '}
                  <span className={isSelected ? 'text-slate-200' : 'text-slate-500'}>
                    {item.label.replace(`${item.code} `, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
