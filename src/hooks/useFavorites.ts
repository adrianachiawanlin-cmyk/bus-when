import { useCallback, useEffect, useState } from 'react';
import type { BusStop, FavoriteStop, RecentStop, SingaporeRegion } from '../types/bus';

const FAVORITES_STORAGE_KEY = 'nextbus_sg_favorites_v1';
const RECENT_STORAGE_KEY = 'nextbus_sg_recent_v1';
const PINNED_SERVICES_KEY = 'nextbus_sg_pinned_services_v1';

const DEFAULT_STARTER_FAVORITES: FavoriteStop[] = [
  {
    busStopCode: '09047',
    description: 'Orchard Stn / Tang Plaza',
    roadName: 'Orchard Rd',
    region: 'Central',
    customLabel: 'Orchard Commute',
    addedAt: '2026-11-26T08:00:00.000Z',
  },
  {
    busStopCode: '01012',
    description: 'Hotel Grand Pacific / Bugis',
    roadName: 'Victoria St',
    region: 'Central',
    customLabel: 'City Transfer',
    addedAt: '2026-11-26T08:05:00.000Z',
  },
  {
    busStopCode: '75009',
    description: 'Tampines Interchange',
    roadName: 'Tampines Ctrl 1',
    region: 'East',
    addedAt: '2026-11-26T08:10:00.000Z',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStop[]>(() => {
    const existing = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (existing === null) {
      return DEFAULT_STARTER_FAVORITES;
    }
    return readStorage<FavoriteStop[]>(FAVORITES_STORAGE_KEY, []);
  });

  const [recentStops, setRecentStops] = useState<RecentStop[]>(() =>
    readStorage<RecentStop[]>(RECENT_STORAGE_KEY, [])
  );

  // Map of busStopCode -> array of pinned service numbers
  const [pinnedServices, setPinnedServices] = useState<Record<string, string[]>>(() =>
    readStorage<Record<string, string[]>>(PINNED_SERVICES_KEY, {
      '09047': ['65', '106'],
    })
  );

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage quota errors
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentStops));
    } catch {
      // Ignore storage quota errors
    }
  }, [recentStops]);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_SERVICES_KEY, JSON.stringify(pinnedServices));
    } catch {
      // Ignore storage quota errors
    }
  }, [pinnedServices]);

  const isFavorite = useCallback(
    (busStopCode: string) => favorites.some((fav) => fav.busStopCode === busStopCode),
    [favorites]
  );

  const getFavorite = useCallback(
    (busStopCode: string) => favorites.find((fav) => fav.busStopCode === busStopCode),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (stop: {
      busStopCode: string;
      description: string;
      roadName: string;
      region: SingaporeRegion;
    }) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.busStopCode === stop.busStopCode);
        if (exists) {
          return prev.filter((f) => f.busStopCode !== stop.busStopCode);
        }
        return [
          {
            busStopCode: stop.busStopCode,
            description: stop.description,
            roadName: stop.roadName,
            region: stop.region,
            addedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    },
    []
  );

  const updateFavoriteLabel = useCallback((busStopCode: string, customLabel: string) => {
    const trimmed = customLabel.trim();
    setFavorites((prev) =>
      prev.map((fav) =>
        fav.busStopCode === busStopCode
          ? { ...fav, customLabel: trimmed || undefined }
          : fav
      )
    );
  }, []);

  const removeFavorite = useCallback((busStopCode: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.busStopCode !== busStopCode));
  }, []);

  const recordRecentStop = useCallback(
    (stop: Pick<BusStop, 'busStopCode' | 'description' | 'roadName'>) => {
      setRecentStops((prev) => {
        const filtered = prev.filter((item) => item.busStopCode !== stop.busStopCode);
        return [
          {
            busStopCode: stop.busStopCode,
            description: stop.description,
            roadName: stop.roadName,
            visitedAt: new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, 6);
      });
    },
    []
  );

  const clearRecentStops = useCallback(() => {
    setRecentStops([]);
  }, []);

  const togglePinnedService = useCallback((busStopCode: string, serviceNo: string) => {
    setPinnedServices((prev) => {
      const current = prev[busStopCode] ?? [];
      const exists = current.includes(serviceNo);
      const updated = exists
        ? current.filter((s) => s !== serviceNo)
        : [serviceNo, ...current];
      return {
        ...prev,
        [busStopCode]: updated,
      };
    });
  }, []);

  const getPinnedForStop = useCallback(
    (busStopCode: string) => pinnedServices[busStopCode] ?? [],
    [pinnedServices]
  );

  return {
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
  };
}
