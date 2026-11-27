import { RefreshCw } from 'lucide-react';

export type AppView = 'board' | 'favorites' | 'directory' | 'api';

interface HeaderProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  favoritesCount: number;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'board', label: 'Live Board' },
  { id: 'favorites', label: 'Saved Stops' },
  { id: 'directory', label: 'Directory' },
  { id: 'api', label: 'API Schema' },
];

export function Header({
  activeView,
  onSelectView,
  onRefresh,
  isRefreshing,
  favoritesCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectView('board')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 rounded-sm cursor-pointer"
        >
          NextBus SG
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            const label =
              item.id === 'favorites' && favoritesCount > 0
                ? `${item.label} (${favoritesCount})`
                : item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh Board</span>
          </button>
        </div>
      </div>
    </header>
  );
}
