import { useState } from 'react';
import { ArrowRight, Check, Pencil, Star, Trash2, X } from 'lucide-react';
import { getStopByCode } from '../services/busApi';
import type { FavoriteStop } from '../types/bus';

interface SavedStopsViewProps {
  favorites: FavoriteStop[];
  onOpenStop: (busStopCode: string) => void;
  onUpdateLabel: (busStopCode: string, customLabel: string) => void;
  onRemoveFavorite: (busStopCode: string) => void;
  onBrowseDirectory: () => void;
}

export function SavedStopsView({
  favorites,
  onOpenStop,
  onUpdateLabel,
  onRemoveFavorite,
  onBrowseDirectory,
}: SavedStopsViewProps) {
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
    <section aria-label="Saved bus stops manager" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Saved Bus Stops
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your bookmarked Singapore bus stops and assign commuter labels such as Home, Office, or MRT Transfer.
          </p>
        </div>
        <button
          type="button"
          onClick={onBrowseDirectory}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Browse Stop Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-14 text-center">
          <Star className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            No saved bus stops
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Search for a 5-digit bus stop code above or open the directory to bookmark your daily stops.
          </p>
          <button
            type="button"
            onClick={onBrowseDirectory}
            className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            Explore Singapore Stops
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const catalogStop = getStopByCode(fav.busStopCode);
            const isEditing = editingCode === fav.busStopCode;

            return (
              <div
                key={fav.busStopCode}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                      {fav.busStopCode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {fav.region}
                    </span>
                  </div>

                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        commitEdit(fav.busStopCode);
                      }}
                      className="mt-2.5 flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        placeholder="Custom label..."
                        autoFocus
                        maxLength={28}
                        className="flex-1 min-w-0 h-9 px-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
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
                        aria-label="Cancel edit"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {fav.customLabel || fav.description}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {fav.customLabel
                          ? `${fav.description} · ${fav.roadName}`
                          : fav.roadName}
                      </p>
                    </>
                  )}

                  {catalogStop && (
                    <p className="mt-3 text-xs font-mono text-slate-600">
                      Services: {catalogStop.services.map((s) => s.serviceNo).join(', ')}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStop(fav.busStopCode)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View Arrivals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(fav)}
                      aria-label={`Edit label for ${fav.description}`}
                      className="min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavorite(fav.busStopCode)}
                      aria-label={`Remove ${fav.description} from favorites`}
                      className="min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
