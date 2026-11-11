import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  calculateDistanceKm,
  fetchActiveOutlets,
  fetchSiteContent,
} from '@/services/restaurantData';
import type { Outlet, SiteContent } from '@/types/database';

const STORAGE_OUTLET_KEY = 'kk_selected_outlet_slug';

interface OutletContextValue {
  outlets: Outlet[];
  selectedOutlet: Outlet | null;
  loadingOutlets: boolean;
  selectOutletById: (id: string) => void;
  selectOutletBySlug: (slug: string) => void;
  distancesByOutletId: Record<string, number>;
  nearestOutlet: Outlet | null;
  geoLoading: boolean;
  geoError: string | null;
  locateNearestOutlet: () => Promise<Outlet | null>;
  siteContent: Record<string, SiteContent>;
}

const OutletContext = createContext<OutletContextValue | undefined>(undefined);

export function OutletProvider({ children }: { children: ReactNode }) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_OUTLET_KEY);
    } catch {
      return null;
    }
  });
  const [loadingOutlets, setLoadingOutlets] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [siteContent, setSiteContent] = useState<Record<string, SiteContent>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [outletRows, contentRows] = await Promise.all([
          fetchActiveOutlets(),
          fetchSiteContent(),
        ]);
        if (!active) return;
        setOutlets(outletRows);
        setSiteContent(contentRows);
        if (outletRows.length > 0) {
          setSelectedSlug((prev) =>
            prev && outletRows.some((o) => o.slug === prev)
              ? prev
              : outletRows[0].slug
          );
        }
      } finally {
        if (active) setLoadingOutlets(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
    try {
      localStorage.setItem(STORAGE_OUTLET_KEY, slug);
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  const selectOutletById = useCallback(
    (id: string) => {
      const match = outlets.find((o) => o.id === id);
      if (match) persistSlug(match.slug);
    },
    [outlets, persistSlug]
  );

  const selectOutletBySlug = useCallback(
    (slug: string) => {
      if (outlets.some((o) => o.slug === slug)) {
        persistSlug(slug);
      }
    },
    [outlets, persistSlug]
  );

  const distancesByOutletId = useMemo(() => {
    if (!userCoords) return {};
    return outlets.reduce<Record<string, number>>((acc, outlet) => {
      if (outlet.latitude != null && outlet.longitude != null) {
        acc[outlet.id] = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          outlet.latitude,
          outlet.longitude
        );
      }
      return acc;
    }, {});
  }, [outlets, userCoords]);

  const nearestOutlet = useMemo(() => {
    if (!userCoords || outlets.length === 0) return null;
    return [...outlets].sort((a, b) => {
      const da = distancesByOutletId[a.id] ?? Number.POSITIVE_INFINITY;
      const db = distancesByOutletId[b.id] ?? Number.POSITIVE_INFINITY;
      return da - db;
    })[0];
  }, [distancesByOutletId, outlets, userCoords]);

  const locateNearestOutlet = useCallback(async (): Promise<Outlet | null> => {
    if (!navigator.geolocation) {
      setGeoError('Location access is not supported by your browser. Please pick an outlet below.');
      return null;
    }

    setGeoLoading(true);
    setGeoError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);
          setGeoLoading(false);

          const sorted = [...outlets].sort((a, b) => {
            const da =
              a.latitude != null && a.longitude != null
                ? calculateDistanceKm(coords.lat, coords.lng, a.latitude, a.longitude)
                : Number.POSITIVE_INFINITY;
            const db =
              b.latitude != null && b.longitude != null
                ? calculateDistanceKm(coords.lat, coords.lng, b.latitude, b.longitude)
                : Number.POSITIVE_INFINITY;
            return da - db;
          });

          const closest = sorted[0] ?? null;
          if (closest) {
            persistSlug(closest.slug);
          }
          resolve(closest);
        },
        () => {
          setGeoLoading(false);
          setGeoError('Could not access GPS location. Tap any outlet card directly.');
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 60000 }
      );
    });
  }, [outlets, persistSlug]);

  const selectedOutlet = useMemo(
    () => outlets.find((o) => o.slug === selectedSlug) ?? outlets[0] ?? null,
    [outlets, selectedSlug]
  );

  const value: OutletContextValue = {
    outlets,
    selectedOutlet,
    loadingOutlets,
    selectOutletById,
    selectOutletBySlug,
    distancesByOutletId,
    nearestOutlet,
    geoLoading,
    geoError,
    locateNearestOutlet,
    siteContent,
  };

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOutlet() {
  const ctx = useContext(OutletContext);
  if (!ctx) {
    throw new Error('useOutlet must be used inside OutletProvider');
  }
  return ctx;
}
