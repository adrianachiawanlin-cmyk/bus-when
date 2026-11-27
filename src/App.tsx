import { useCallback, useEffect, useState } from 'react';
import { Code2, Compass, Radio, Star } from 'lucide-react';
import { ApiSchemaView } from './components/ApiSchemaView';
import { ArrivalBoard } from './components/ArrivalBoard';
import { DirectoryView } from './components/DirectoryView';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { Header, type AppView } from './components/Header';
import { SavedStopsView } from './components/SavedStopsView';
import { StopSearchBar } from './components/StopSearchBar';
import { useFavorites } from './hooks/useFavorites';
import { API_INTEGRATION_CONFIG, fetchBusArrivals } from './services/busApi';
import type { BusArrivalBoard } from './types/bus';

const DEFAULT_STOP_CODE = '09047';
const REFRESH_INTERVAL = API_INTEGRATION_CONFIG.refreshIntervalSeconds;

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('board');
  const [activeStopCode, setActiveStopCode] = useState<string>(DEFAULT_STOP_CODE);
  const [board, setBoard] = useState<BusArrivalBoard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshCycle, setRefreshCycle] = useState<number>(0);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(REFRESH_INTERVAL);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const {
    favorites,
    recentStops,
    isFavorite,
    getFavorite,
    toggleFavorite,
    updateFavoriteLabel,
    removeFavorite,
    recordRecentStop,
    clearRecentStops,
    togglePinnedService,
    getPinnedForStop,
  } = useFavorites();

  const loadStop = useCallback(
    async (code: string, cycle: number, shouldRecordRecent = false) => {
      setIsLoading(true);
      try {
        const result = await fetchBusArrivals(code, cycle);
        setBoard(result);
        setSecondsUntilRefresh(REFRESH_INTERVAL);
        setNowMs(Date.now());
        if (shouldRecordRecent) {
          recordRecentStop({
            busStopCode: result.busStopCode,
            description: result.description,
            roadName: result.roadName,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [recordRecentStop]
  );

  // Initial load and when activeStopCode changes
  useEffect(() => {
    void loadStop(activeStopCode, refreshCycle, true);
  }, [activeStopCode]);

  // Real-time 1s clock tick + automatic 30s board refresh
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          setRefreshCycle((c) => {
            const nextCycle = c + 1;
            void loadStop(activeStopCode, nextCycle, false);
            return nextCycle;
          });
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeStopCode, loadStop]);

  const handleSelectStop = useCallback((busStopCode: string) => {
    setActiveStopCode(busStopCode);
    setActiveView('board');
  }, []);

  const handleManualRefresh = useCallback(() => {
    const nextCycle = refreshCycle + 1;
    setRefreshCycle(nextCycle);
    void loadStop(activeStopCode, nextCycle, false);
  }, [activeStopCode, loadStop, refreshCycle]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900 pb-16 md:pb-0">
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onRefresh={handleManualRefresh}
        isRefreshing={isLoading}
        favoritesCount={favorites.length}
      />

      <StopSearchBar
        activeStopCode={activeStopCode}
        onSelectStop={handleSelectStop}
        isFavorite={isFavorite}
        onToggleFavorite={(stop) =>
          toggleFavorite({
            busStopCode: stop.busStopCode,
            description: stop.description,
            roadName: stop.roadName,
            region: stop.region,
          })
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="order-2 lg:order-1">
              <FavoritesSidebar
                favorites={favorites}
                recentStops={recentStops}
                activeStopCode={activeStopCode}
                onSelectStop={handleSelectStop}
                onUpdateLabel={updateFavoriteLabel}
                onRemoveFavorite={removeFavorite}
                onClearRecent={clearRecentStops}
              />
            </div>

            <div className="order-1 lg:order-2 min-w-0">
              <ArrivalBoard
                board={board}
                isLoading={isLoading}
                nowMs={nowMs}
                secondsUntilRefresh={secondsUntilRefresh}
                favoriteEntry={getFavorite(activeStopCode)}
                pinnedServices={getPinnedForStop(activeStopCode)}
                onToggleFavorite={() => {
                  if (!board) return;
                  toggleFavorite({
                    busStopCode: board.busStopCode,
                    description: board.description,
                    roadName: board.roadName,
                    region: board.region,
                  });
                }}
                onTogglePinnedService={(serviceNo) =>
                  togglePinnedService(activeStopCode, serviceNo)
                }
                onRefresh={handleManualRefresh}
              />
            </div>
          </div>
        )}

        {activeView === 'favorites' && (
          <SavedStopsView
            favorites={favorites}
            onOpenStop={handleSelectStop}
            onUpdateLabel={updateFavoriteLabel}
            onRemoveFavorite={removeFavorite}
            onBrowseDirectory={() => setActiveView('directory')}
          />
        )}

        {activeView === 'directory' && (
          <DirectoryView
            isFavorite={isFavorite}
            onToggleFavorite={(stop) =>
              toggleFavorite({
                busStopCode: stop.busStopCode,
                description: stop.description,
                roadName: stop.roadName,
                region: stop.region,
              })
            }
            onOpenStop={handleSelectStop}
          />
        )}

        {activeView === 'api' && <ApiSchemaView />}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>NextBus SG · Frontend Arrival Display</span>
          <span>Simulated LTA DataMall feed · Ready for live API connection</span>
        </div>
      </footer>

      {/* Compact Mobile Bottom Navigation Bar (height <= 56px, well within 15% mobile sticky cap) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center"
      >
        {(
          [
            { id: 'board', label: 'Arrivals', Icon: Radio },
            { id: 'favorites', label: 'Saved', Icon: Star },
            { id: 'directory', label: 'Stops', Icon: Compass },
            { id: 'api', label: 'API', Icon: Code2 },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                active ? 'text-blue-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
