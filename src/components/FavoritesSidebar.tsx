import { useState } from 'react';
import { Check, Clock, Pencil, Star, Trash2, X } from 'lucide-react';
import type { FavoriteStop, RecentStop } from '../types/bus';

interface FavoritesSidebarProps {
  favorites: FavoriteStop[];
  recentStops: RecentStop[];
  activeStopCode: string;
  onSelectStop: (busStopCode: string) => void;
  onUpdateLabel: (busStopCode: string, customLabel: string) => void;
  onRemoveFavorite: (busStopCode: string) => void;
  onClearRecent: () => void;
}

export function FavoritesSidebar({
  favorites,
  recentStops,
  activeStopCode,
  onSelectStop,
  onUpdateLabel,
  onRemoveFavorite,
  onClearRecent,
}: FavoritesSidebarProps) {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState('');

  const startEdit = (fav: FavoriteStop) => {
    setEditingCode(fav.busStopCode);
    setDraftLabel(fav.customLabel ?? '');
  };

  const commitEdit = (busStopCode: string) => {
    onUpdateLabel(busStopCode, draftLabel);
    setEditingCode(null);
  };

  return (
    <aside aria-label="Saved and recent bus stops" className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900">Saved Bus Stops</h2>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {favorites.length}
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No saved stops yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Star any bus stop on the arrival board or search dropdown for one-tap access.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {favorites.map((fav) => {
              const isActive = fav.busStopCode === activeStopCode;
              const isEditing = editingCode === fav.busStopCode;

              return (
                <li
                  key={fav.busStopCode}
                  className={`transition-colors ${
                    isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        commitEdit(fav.busStopCode);
                      }}
                      className="px-4 py-3 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        placeholder="Label (e.g. Home, Office)"
                        autoFocus
                        maxLength={28}
                        className="flex-1 min-w-0 h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                      />
                      <button
                        type="submit"
                        aria-label="Save label"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCode(null)}
                        aria-label="Cancel label edit"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectStop(fav.busStopCode)}
                        className="flex-1 text-left min-w-0 py-0.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                              isActive ? 'text-blue-700' : 'text-slate-900'
                            }`}
                          >
                            {fav.busStopCode}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {fav.customLabel || fav.description}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {fav.customLabel
                            ? `${fav.description} · ${fav.roadName}`
                            : `${fav.roadName} · ${fav.region}`}
                        </p>
                      </button>

                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(fav)}
                          aria-label={`Edit label for ${fav.description}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(fav.busStopCode)}
                          aria-label={`Remove ${fav.description} from saved stops`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {recentStops.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Lookups</h2>
            </div>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentStops.map((stop) => {
              const isActive = stop.busStopCode === activeStopCode;
              return (
                <li key={stop.busStopCode}>
                  <button
                    type="button"
                    onClick={() => onSelectStop(stop.busStopCode)}
                    className={`w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                      isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                          isActive ? 'text-blue-700' : 'text-slate-900'
                        }`}
                      >
                        {stop.busStopCode}
                      </span>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {stop.description}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{stop.roadName}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
