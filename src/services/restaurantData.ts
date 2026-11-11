import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_OUTLETS,
  MOCK_OUTLET_PRICES,
  MOCK_REVIEWS,
  MOCK_SITE_CONTENT,
} from '@/data/mockSeed';
import type {
  MenuCategory,
  MenuItem,
  Outlet,
  OutletMenuItem,
  OutletMenuPrice,
  Review,
  SiteContent,
} from '@/types/database';

/**
 * Computes great-circle distance in km between two lat/lng coordinates.
 * Used for the 2-tap "Find Nearest Outlet / Dosa Near Me" flow.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Checks whether an outlet is currently open based on its opening/closing hours
 * and holiday calendar (evaluated in Asia/Kolkata IST).
 */
export function isOutletOpenNow(outlet: Outlet): boolean {
  if (!outlet.is_active) return false;

  const now = new Date();
  const istString = now.toLocaleString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Format: "YYYY-MM-DD, HH:MM"
  const [datePart, timePart = '00:00'] = istString.split(', ');
  if (outlet.holiday_dates?.includes(datePart)) {
    return false;
  }

  const currentMins = toMinutes(timePart);
  const openMins = toMinutes(outlet.opening_time);
  const closeMins = toMinutes(outlet.closing_time);
  return currentMins >= openMins && currentMins <= closeMins;
}

function toMinutes(timeStr: string): number {
  const [h = '0', m = '0'] = timeStr.split(':');
  return Number(h) * 60 + Number(m);
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchActiveOutlets(): Promise<Outlet[]> {
  if (!isSupabaseConfigured) {
    return readLocalJson('kk_demo_admin_outlets_v1', MOCK_OUTLETS).filter(
      (o) => o.is_active
    );
  }
  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return MOCK_OUTLETS;
  }
  return data as Outlet[];
}

export async function fetchOutletBySlug(slug: string): Promise<Outlet | null> {
  if (!isSupabaseConfigured) {
    const all = readLocalJson('kk_demo_admin_outlets_v1', MOCK_OUTLETS);
    return all.find((o) => o.slug === slug && o.is_active) ?? null;
  }
  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return MOCK_OUTLETS.find((o) => o.slug === slug) ?? null;
  }
  return data as Outlet;
}

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  if (!isSupabaseConfigured) {
    return MOCK_CATEGORIES;
  }
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return MOCK_CATEGORIES;
  }
  return data as MenuCategory[];
}

export async function fetchOutletMenu(outletId: string): Promise<{
  categories: MenuCategory[];
  items: OutletMenuItem[];
}> {
  if (!isSupabaseConfigured) {
    const items = readLocalJson('kk_demo_admin_items_v1', MOCK_MENU_ITEMS);
    const prices = readLocalJson('kk_demo_admin_prices_v1', MOCK_OUTLET_PRICES);
    return {
      categories: MOCK_CATEGORIES,
      items: mergeMenuWithPrices(
        items,
        MOCK_CATEGORIES,
        prices.filter((p) => p.outlet_id === outletId)
      ),
    };
  }

  const [catRes, itemRes, priceRes] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('outlet_menu_prices')
      .select('*')
      .eq('outlet_id', outletId),
  ]);

  const categories =
    !catRes.error && catRes.data?.length
      ? (catRes.data as MenuCategory[])
      : MOCK_CATEGORIES;
  const rawItems =
    !itemRes.error && itemRes.data?.length
      ? (itemRes.data as MenuItem[])
      : MOCK_MENU_ITEMS;
  const prices =
    !priceRes.error && priceRes.data
      ? (priceRes.data as OutletMenuPrice[])
      : MOCK_OUTLET_PRICES.filter((p) => p.outlet_id === outletId);

  return {
    categories,
    items: mergeMenuWithPrices(rawItems, categories, prices),
  };
}

function mergeMenuWithPrices(
  items: MenuItem[],
  categories: MenuCategory[],
  prices: OutletMenuPrice[]
): OutletMenuItem[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const priceMap = new Map(prices.map((p) => [p.menu_item_id, p]));

  return items.map((item) => {
    const cat = catMap.get(item.category_id);
    const outletOverride = priceMap.get(item.id);
    return {
      ...item,
      category_name: cat?.name,
      category_slug: cat?.slug,
      outlet_price: outletOverride?.price ?? item.base_price,
      is_available: outletOverride?.is_available ?? true,
      unavailable_reason: outletOverride?.unavailable_reason ?? null,
    };
  });
}

export async function fetchFeaturedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return MOCK_REVIEWS;
  }
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) {
    return MOCK_REVIEWS;
  }
  return data as Review[];
}

export async function fetchSiteContent(): Promise<Record<string, SiteContent>> {
  const toRecord = (rows: SiteContent[]) =>
    rows.reduce<Record<string, SiteContent>>((acc, row) => {
      acc[row.key] = row;
      return acc;
    }, {});

  if (!isSupabaseConfigured) {
    const localContent = readLocalJson(
      'kk_demo_admin_content_v1',
      MOCK_SITE_CONTENT
    ).filter((c) => c.is_active);
    return toRecord(localContent);
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return toRecord(MOCK_SITE_CONTENT);
  }
  return toRecord(data as SiteContent[]);
}

