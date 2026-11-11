import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_OUTLETS,
  MOCK_OUTLET_PRICES,
  MOCK_SITE_CONTENT,
} from '@/data/mockSeed';
import {
  advanceDemoOrderStatus,
  getRecentLocalOrders,
  hasBackendApi,
} from '@/services/orderService';
import type {
  InventoryItem,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  Outlet,
  OutletMenuItem,
  Reservation,
  ReservationStatus,
  RestaurantTable,
  SiteContent,
  TableStatus,
} from '@/types/database';

const DEMO_ADMIN_ORDERS_KEY = 'kk_demo_admin_orders_v1';
const DEMO_ADMIN_OUTLETS_KEY = 'kk_demo_admin_outlets_v1';
const DEMO_ADMIN_MENU_PRICES_KEY = 'kk_demo_admin_prices_v1';
const DEMO_ADMIN_MENU_ITEMS_KEY = 'kk_demo_admin_items_v1';
const DEMO_ADMIN_TABLES_KEY = 'kk_demo_admin_tables_v1';
const DEMO_ADMIN_CONTENT_KEY = 'kk_demo_admin_content_v1';

export interface AdminOrderWithItems {
  order: Order;
  items: OrderItem[];
}

function seedDemoAdminOrders(): AdminOrderWithItems[] {
  const now = Date.now();
  const mk = (
    idx: number,
    outletId: string,
    num: string,
    name: string,
    phone: string,
    type: Order['order_type'],
    status: OrderStatus,
    minsAgo: number,
    lineList: { name: string; qty: number; price: number; isJain?: boolean }[]
  ): AdminOrderWithItems => {
    const subtotal = lineList.reduce((s, l) => s + l.qty * l.price, 0);
    const gst = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;
    const id = `seed-ord-${idx}`;
    const created = new Date(now - minsAgo * 60000).toISOString();

    return {
      order: {
        id,
        order_number: num,
        outlet_id: outletId,
        customer_id: null,
        customer_name: name,
        customer_phone: phone,
        customer_email: null,
        order_type: type,
        status,
        payment_status: 'paid',
        subtotal,
        gst_amount: gst,
        discount_amount: 0,
        delivery_fee: 0,
        total_amount: total,
        coupon_code: null,
        loyalty_points_redeemed: 0,
        loyalty_points_earned: Math.floor(subtotal / 100) * 5,
        delivery_address: type === 'delivery' ? 'BTM 2nd Stage, Bengaluru' : null,
        order_notes: idx === 1 ? 'Extra coconut chutney please' : null,
        scheduled_for: null,
        estimated_ready_at: new Date(now + 15 * 60000).toISOString(),
        created_at: created,
        updated_at: created,
      },
      items: lineList.map((l, i) => ({
        id: `${id}-it-${i}`,
        order_id: id,
        menu_item_id: null,
        item_name: l.name,
        quantity: l.qty,
        unit_price: l.price,
        total_price: l.qty * l.price,
        spice_preference: 'medium',
        is_jain: Boolean(l.isJain),
        special_instructions: null,
      })),
    };
  };

  return [
    mk(1, MOCK_OUTLETS[0].id, 'KK-HUL-1081', 'Srinivas Murthy', '9845011223', 'pickup', 'received', 3, [
      { name: 'Benne Masala Dosa', qty: 2, price: 95 },
      { name: 'Madras Filter Coffee (Brass Davara)', qty: 2, price: 35 },
    ]),
    mk(2, MOCK_OUTLETS[0].id, 'KK-HUL-1080', 'Kavitha N', '9900122334', 'delivery', 'preparing', 11, [
      { name: 'Rava Idli', qty: 2, price: 75, isJain: true },
      { name: 'Chow Chow Bath (Khara & Kesari)', qty: 1, price: 85 },
    ]),
    mk(3, MOCK_OUTLETS[0].id, 'KK-HUL-1079', 'Arjun Deshpande', '9880144556', 'pickup', 'ready', 19, [
      { name: 'Idli Vada Combo (2 Idli + 1 Vada)', qty: 3, price: 70 },
    ]),
    mk(4, MOCK_OUTLETS[0].id, 'KK-HUL-1076', 'Lakshmi Narayanan', '9741055667', 'dine_in', 'completed', 48, [
      { name: 'Krishna Kuteera Banana Leaf Meal', qty: 2, price: 175 },
      { name: 'Bele Obbattu / Holige (2 Pcs)', qty: 1, price: 90 },
    ]),
    mk(5, MOCK_OUTLETS[1].id, 'KK-JPN-2041', 'Rohit Sharma', '9845233445', 'pickup', 'received', 4, [
      { name: 'Mysore Masala Dosa', qty: 2, price: 110 },
      { name: 'Madras Filter Coffee (Brass Davara)', qty: 1, price: 35 },
    ]),
    mk(6, MOCK_OUTLETS[2].id, 'KK-JAY-3012', 'Vasudha Iyer', '9886077889', 'pickup', 'completed', 55, [
      { name: 'KK Bakers Bengaluru Honey Cake (2 Pcs)', qty: 2, price: 70 },
      { name: 'Madras Filter Coffee (Brass Davara)', qty: 2, price: 30 },
    ]),
  ];
}

export const DEMO_INVENTORY_SEED: InventoryItem[] = [
  {
    id: 'inv-1',
    outlet_id: MOCK_OUTLETS[0].id,
    name: 'Idli/Dosa Fermented Batter',
    sku: 'INV-BAT-01',
    category: 'Fresh Prep',
    unit: 'kg',
    current_stock: 42,
    reorder_level: 20,
    cost_per_unit: 48,
    supplier_name: 'In-House Central Kitchen',
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    outlet_id: MOCK_OUTLETS[0].id,
    name: 'Chikmagalur 80:20 Coffee Powder',
    sku: 'INV-COF-03',
    category: 'Beverages',
    unit: 'kg',
    current_stock: 3.5,
    reorder_level: 5,
    cost_per_unit: 540,
    supplier_name: 'Malnad Roasters',
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    outlet_id: MOCK_OUTLETS[0].id,
    name: 'Grated Fresh Coconut',
    sku: 'INV-COC-04',
    category: 'Produce',
    unit: 'kg',
    current_stock: 8,
    reorder_level: 12,
    cost_per_unit: 95,
    supplier_name: 'KR Market Fresh',
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    outlet_id: MOCK_OUTLETS[0].id,
    name: 'Nandini Pure Ghee',
    sku: 'INV-GHE-02',
    category: 'Dairy',
    unit: 'litre',
    current_stock: 14,
    reorder_level: 10,
    cost_per_unit: 620,
    supplier_name: 'KMF Nandini Dairy',
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-5',
    outlet_id: MOCK_OUTLETS[1].id,
    name: 'Idli/Dosa Fermented Batter',
    sku: 'INV-BAT-01',
    category: 'Fresh Prep',
    unit: 'kg',
    current_stock: 18,
    reorder_level: 20,
    cost_per_unit: 48,
    supplier_name: 'In-House Central Kitchen',
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// =============================================================================
// SOUND ALERT (Zero-dependency Web Audio Chime)
// =============================================================================
export function playNewOrderChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [659.25, 880, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + idx * 0.11;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch {
    // Ignore autoplay errors before user gesture
  }
}

// =============================================================================
// ORDERS & KANBAN
// =============================================================================
export async function fetchAdminOrders(
  outletId: string | 'all'
): Promise<AdminOrderWithItems[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(80);
    if (outletId !== 'all') {
      query = query.eq('outlet_id', outletId);
    }
    const { data } = await query;
    if (data && data.length > 0) {
      return data.map((row) => {
        const { order_items, ...orderFields } = row as Order & {
          order_items: OrderItem[];
        };
        return { order: orderFields, items: order_items || [] };
      });
    }
  }

  if (await hasBackendApi()) {
    try {
      const res = await fetch(
        `/api/orders?outletId=${encodeURIComponent(outletId)}`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          orders?: AdminOrderWithItems[];
        };
        if (Array.isArray(data.orders)) {
          return data.orders;
        }
      }
    } catch {
      // fall through to local demo store
    }
  }

  let stored: AdminOrderWithItems[] = [];
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_ORDERS_KEY);
    stored = raw ? (JSON.parse(raw) as AdminOrderWithItems[]) : seedDemoAdminOrders();
    if (!raw) localStorage.setItem(DEMO_ADMIN_ORDERS_KEY, JSON.stringify(stored));
  } catch {
    stored = seedDemoAdminOrders();
  }

  // Merge in any customer orders placed online, keeping the freshest updated_at copy
  const customerLocal = getRecentLocalOrders().map((r) => ({
    order: r.order,
    items: r.items,
  }));
  const map = new Map<string, AdminOrderWithItems>();
  [...stored, ...customerLocal].forEach((entry) => {
    const existing = map.get(entry.order.id);
    if (!existing) {
      map.set(entry.order.id, entry);
    } else {
      const existingUpdated = new Date(existing.order.updated_at).getTime();
      const candidateUpdated = new Date(entry.order.updated_at).getTime();
      if (candidateUpdated > existingUpdated) {
        map.set(entry.order.id, entry);
      }
    }
  });

  const merged = Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime()
  );

  return outletId === 'all'
    ? merged
    : merged.filter((m) => m.order.outlet_id === outletId);
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  if (isSupabaseConfigured && !orderId.startsWith('seed-') && !orderId.startsWith('demo-')) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
    return;
  }

  if (await hasBackendApi()) {
    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // also update local fallback below
    }
  }

  const now = new Date().toISOString();
  const all = await fetchAdminOrders('all');
  const next = all.map((entry) =>
    entry.order.id === orderId
      ? {
          ...entry,
          order: { ...entry.order, status, updated_at: now },
        }
      : entry
  );
  localStorage.setItem(DEMO_ADMIN_ORDERS_KEY, JSON.stringify(next));
  await advanceDemoOrderStatus(orderId, status);
}

// =============================================================================
// DASHBOARD ANALYTICS
// =============================================================================
export interface DashboardMetrics {
  todaySales: number;
  todayOrderCount: number;
  avgTicket: number;
  pendingOrdersCount: number;
  topDishes: { name: string; count: number; revenue: number }[];
  outletComparison: {
    outletId: string;
    outletName: string;
    orders: number;
    sales: number;
  }[];
  lowStockAlerts: InventoryItem[];
}

export async function fetchAdminDashboardMetrics(
  outletId: string | 'all',
  outlets: Outlet[]
): Promise<DashboardMetrics> {
  const allOrders = await fetchAdminOrders('all');
  const scopedOrders =
    outletId === 'all'
      ? allOrders
      : allOrders.filter((o) => o.order.outlet_id === outletId);

  const nonCancelled = scopedOrders.filter((o) => o.order.status !== 'cancelled');
  const todaySales = nonCancelled.reduce((s, o) => s + o.order.total_amount, 0);
  const todayOrderCount = nonCancelled.length;
  const avgTicket = todayOrderCount > 0 ? Math.round(todaySales / todayOrderCount) : 0;
  const pendingOrdersCount = scopedOrders.filter((o) =>
    ['received', 'preparing', 'ready'].includes(o.order.status)
  ).length;

  const dishAgg = new Map<string, { count: number; revenue: number }>();
  nonCancelled.forEach((o) => {
    o.items.forEach((it) => {
      const curr = dishAgg.get(it.item_name) ?? { count: 0, revenue: 0 };
      curr.count += it.quantity;
      curr.revenue += it.total_price;
      dishAgg.set(it.item_name, curr);
    });
  });

  const topDishes = Array.from(dishAgg.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const outletComparison = outlets.map((o) => {
    const oOrders = allOrders.filter(
      (entry) => entry.order.outlet_id === o.id && entry.order.status !== 'cancelled'
    );
    return {
      outletId: o.id,
      outletName: o.locality,
      orders: oOrders.length,
      sales: oOrders.reduce((s, e) => s + e.order.total_amount, 0),
    };
  });

  let lowStockAlerts: InventoryItem[] = [];
  if (isSupabaseConfigured) {
    let invQ = supabase.from('inventory_items').select('*');
    if (outletId !== 'all') invQ = invQ.eq('outlet_id', outletId);
    const { data } = await invQ;
    if (data) {
      lowStockAlerts = (data as InventoryItem[]).filter(
        (item) => item.current_stock <= item.reorder_level
      );
    }
  } else {
    lowStockAlerts = DEMO_INVENTORY_SEED.filter(
      (i) =>
        (outletId === 'all' || i.outlet_id === outletId) &&
        i.current_stock <= i.reorder_level
    );
  }

  return {
    todaySales,
    todayOrderCount,
    avgTicket,
    pendingOrdersCount,
    topDishes,
    outletComparison,
    lowStockAlerts,
  };
}

// =============================================================================
// MENU & 1-CLICK SOLD OUT MANAGEMENT
// =============================================================================
export async function fetchAdminOutletMenu(outletId: string): Promise<{
  categories: MenuCategory[];
  items: OutletMenuItem[];
}> {
  if (isSupabaseConfigured) {
    const [catRes, itemRes, priceRes] = await Promise.all([
      supabase.from('menu_categories').select('*').order('display_order'),
      supabase.from('menu_items').select('*').order('display_order'),
      supabase.from('outlet_menu_prices').select('*').eq('outlet_id', outletId),
    ]);
    if (!catRes.error && !itemRes.error && itemRes.data?.length) {
      const cats = (catRes.data || []) as MenuCategory[];
      const items = itemRes.data as MenuItem[];
      const prices = (priceRes.data || []) as typeof MOCK_OUTLET_PRICES;
      const catMap = new Map(cats.map((c) => [c.id, c]));
      const priceMap = new Map(prices.map((p) => [p.menu_item_id, p]));
      return {
        categories: cats,
        items: items.map((m) => {
          const cat = catMap.get(m.category_id);
          const ov = priceMap.get(m.id);
          return {
            ...m,
            category_name: cat?.name,
            category_slug: cat?.slug,
            outlet_price: ov?.price ?? m.base_price,
            is_available: ov?.is_available ?? true,
            unavailable_reason: ov?.unavailable_reason ?? null,
          };
        }),
      };
    }
  }

  let items = MOCK_MENU_ITEMS;
  let prices = MOCK_OUTLET_PRICES;
  try {
    const rawItems = localStorage.getItem(DEMO_ADMIN_MENU_ITEMS_KEY);
    if (rawItems) items = JSON.parse(rawItems) as MenuItem[];
    const rawPrices = localStorage.getItem(DEMO_ADMIN_MENU_PRICES_KEY);
    if (rawPrices) prices = JSON.parse(rawPrices) as typeof MOCK_OUTLET_PRICES;
  } catch {
    // fallback
  }

  const catMap = new Map(MOCK_CATEGORIES.map((c) => [c.id, c]));
  const priceMap = new Map(
    prices.filter((p) => p.outlet_id === outletId).map((p) => [p.menu_item_id, p])
  );

  return {
    categories: MOCK_CATEGORIES,
    items: items.map((m) => {
      const cat = catMap.get(m.category_id);
      const ov = priceMap.get(m.id);
      return {
        ...m,
        category_name: cat?.name,
        category_slug: cat?.slug,
        outlet_price: ov?.price ?? m.base_price,
        is_available: ov?.is_available ?? true,
        unavailable_reason: ov?.unavailable_reason ?? null,
      };
    }),
  };
}

export async function toggleOutletMenuAvailability(
  outletId: string,
  menuItemId: string,
  isAvailable: boolean,
  basePrice: number,
  reason?: string
): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('outlet_menu_prices').upsert(
      {
        outlet_id: outletId,
        menu_item_id: menuItemId,
        price: basePrice,
        is_available: isAvailable,
        unavailable_reason: isAvailable ? null : reason || 'Sold out for today',
      },
      { onConflict: 'outlet_id,menu_item_id' }
    );
    if (error) throw new Error(error.message);
    return;
  }

  let prices = MOCK_OUTLET_PRICES;
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_MENU_PRICES_KEY);
    if (raw) prices = JSON.parse(raw) as typeof MOCK_OUTLET_PRICES;
  } catch {
    // ignore
  }
  const idx = prices.findIndex(
    (p) => p.outlet_id === outletId && p.menu_item_id === menuItemId
  );
  if (idx >= 0) {
    prices[idx] = {
      ...prices[idx],
      is_available: isAvailable,
      unavailable_reason: isAvailable ? null : reason || 'Marked sold out by manager',
    };
  } else {
    prices.push({
      id: `omp-${Date.now()}`,
      outlet_id: outletId,
      menu_item_id: menuItemId,
      price: basePrice,
      is_available: isAvailable,
      unavailable_reason: isAvailable ? null : reason || 'Marked sold out by manager',
      updated_at: new Date().toISOString(),
    });
  }
  localStorage.setItem(DEMO_ADMIN_MENU_PRICES_KEY, JSON.stringify(prices));
}

export async function updateOutletMenuPrice(
  outletId: string,
  menuItemId: string,
  newPrice: number
): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('outlet_menu_prices').upsert(
      { outlet_id: outletId, menu_item_id: menuItemId, price: newPrice },
      { onConflict: 'outlet_id,menu_item_id' }
    );
    if (error) throw new Error(error.message);
    return;
  }

  let prices = MOCK_OUTLET_PRICES;
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_MENU_PRICES_KEY);
    if (raw) prices = JSON.parse(raw) as typeof MOCK_OUTLET_PRICES;
  } catch {
    // ignore
  }
  const next = prices.map((p) =>
    p.outlet_id === outletId && p.menu_item_id === menuItemId
      ? { ...p, price: newPrice }
      : p
  );
  localStorage.setItem(DEMO_ADMIN_MENU_PRICES_KEY, JSON.stringify(next));
}

export async function saveMenuItem(
  payload: Partial<MenuItem> & { name: string; category_id: string; base_price: number }
): Promise<void> {
  const slug =
    payload.slug ||
    payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  if (isSupabaseConfigured) {
    if (payload.id) {
      const { error } = await supabase
        .from('menu_items')
        .update({ ...payload, slug })
        .eq('id', payload.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('menu_items').insert({
        ...payload,
        slug,
        is_veg: true,
      });
      if (error) throw new Error(error.message);
    }
    return;
  }

  let items = MOCK_MENU_ITEMS;
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_MENU_ITEMS_KEY);
    if (raw) items = JSON.parse(raw) as MenuItem[];
  } catch {
    // ignore
  }

  if (payload.id) {
    items = items.map((m) => (m.id === payload.id ? { ...m, ...payload, slug } : m));
  } else {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      category_id: payload.category_id,
      name: payload.name,
      slug,
      description: payload.description || null,
      image_url: payload.image_url || null,
      base_price: payload.base_price,
      is_veg: true,
      is_jain_available: payload.is_jain_available ?? true,
      is_no_onion_garlic: payload.is_no_onion_garlic ?? false,
      is_bestseller: payload.is_bestseller ?? false,
      is_todays_special: payload.is_todays_special ?? false,
      spice_level: payload.spice_level ?? 'mild',
      prep_time_mins: payload.prep_time_mins ?? 12,
      calories: null,
      tags: [],
      is_bakery_item: payload.is_bakery_item ?? false,
      requires_preorder: payload.requires_preorder ?? false,
      is_active: payload.is_active ?? true,
      display_order: items.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items = [newItem, ...items];
  }
  localStorage.setItem(DEMO_ADMIN_MENU_ITEMS_KEY, JSON.stringify(items));
}

// =============================================================================
// OUTLETS MANAGEMENT
// =============================================================================
export async function fetchAllOutletsAdmin(): Promise<Outlet[]> {
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('outlets')
      .select('*')
      .order('created_at', { ascending: true });
    if (data && data.length > 0) return data as Outlet[];
  }
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_OUTLETS_KEY);
    if (raw) return JSON.parse(raw) as Outlet[];
  } catch {
    // ignore
  }
  return MOCK_OUTLETS;
}

export async function saveOutletAdmin(
  outlet: Partial<Outlet> & { name: string; locality: string; address: string; phone: string }
): Promise<void> {
  const slug =
    outlet.slug ||
    outlet.locality
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  if (isSupabaseConfigured) {
    if (outlet.id) {
      const { error } = await supabase
        .from('outlets')
        .update({ ...outlet, slug })
        .eq('id', outlet.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('outlets').insert({
        ...outlet,
        slug,
        city: outlet.city || 'Bengaluru',
        pincode: outlet.pincode || '560001',
      });
      if (error) throw new Error(error.message);
    }
    return;
  }

  let list = await fetchAllOutletsAdmin();
  if (outlet.id) {
    list = list.map((o) => (o.id === outlet.id ? { ...o, ...outlet, slug } : o));
  } else {
    const newOutlet: Outlet = {
      id: `outlet-${Date.now()}`,
      name: outlet.name,
      slug,
      address: outlet.address,
      locality: outlet.locality,
      city: outlet.city || 'Bengaluru',
      pincode: outlet.pincode || '560076',
      phone: outlet.phone,
      email: outlet.email || null,
      maps_embed_url: null,
      maps_directions_url: null,
      latitude: null,
      longitude: null,
      opening_time: outlet.opening_time || '07:30',
      closing_time: outlet.closing_time || '22:30',
      holiday_dates: outlet.holiday_dates || [],
      seating_ac: outlet.seating_ac ?? true,
      seating_non_ac: outlet.seating_non_ac ?? true,
      seating_outdoor: outlet.seating_outdoor ?? false,
      parking_info: outlet.parking_info || null,
      total_tables: outlet.total_tables ?? 16,
      max_guests_per_slot: outlet.max_guests_per_slot ?? 48,
      has_bakery_counter: outlet.has_bakery_counter ?? false,
      is_active: outlet.is_active ?? true,
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list = [...list, newOutlet];
  }
  localStorage.setItem(DEMO_ADMIN_OUTLETS_KEY, JSON.stringify(list));
}

// =============================================================================
// TABLES & RESERVATIONS FLOOR MANAGEMENT
// =============================================================================
const SEED_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', outlet_id: MOCK_OUTLETS[0].id, table_number: 'T1', zone: 'non_ac', capacity: 4, status: 'occupied', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-2', outlet_id: MOCK_OUTLETS[0].id, table_number: 'T2', zone: 'non_ac', capacity: 4, status: 'available', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-3', outlet_id: MOCK_OUTLETS[0].id, table_number: 'A1', zone: 'ac', capacity: 4, status: 'reserved', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-4', outlet_id: MOCK_OUTLETS[0].id, table_number: 'A2', zone: 'ac', capacity: 6, status: 'available', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-5', outlet_id: MOCK_OUTLETS[0].id, table_number: 'G1', zone: 'outdoor', capacity: 4, status: 'available', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-6', outlet_id: MOCK_OUTLETS[1].id, table_number: 'T1', zone: 'non_ac', capacity: 4, status: 'available', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-7', outlet_id: MOCK_OUTLETS[1].id, table_number: 'A1', zone: 'ac', capacity: 4, status: 'occupied', current_reservation_id: null, is_active: true, updated_at: '' },
  { id: 'tbl-8', outlet_id: MOCK_OUTLETS[2].id, table_number: 'T1', zone: 'non_ac', capacity: 4, status: 'available', current_reservation_id: null, is_active: true, updated_at: '' },
];

export async function fetchTablesAndReservations(outletId: string): Promise<{
  tables: RestaurantTable[];
  reservations: Reservation[];
}> {
  if (isSupabaseConfigured) {
    const [tblRes, resRes] = await Promise.all([
      supabase.from('tables').select('*').eq('outlet_id', outletId).order('table_number'),
      supabase
        .from('reservations')
        .select('*')
        .eq('outlet_id', outletId)
        .order('reservation_date', { ascending: false })
        .limit(40),
    ]);
    return {
      tables: (tblRes.data || []) as RestaurantTable[],
      reservations: (resRes.data || []) as Reservation[],
    };
  }

  let tables = SEED_TABLES;
  try {
    const rawT = localStorage.getItem(DEMO_ADMIN_TABLES_KEY);
    if (rawT) tables = JSON.parse(rawT) as RestaurantTable[];
    else localStorage.setItem(DEMO_ADMIN_TABLES_KEY, JSON.stringify(SEED_TABLES));
  } catch {
    // ignore
  }

  let reservations: Reservation[] = [];
  try {
    const rawR = localStorage.getItem('kk_demo_reservations_v1');
    if (rawR) reservations = JSON.parse(rawR) as Reservation[];
  } catch {
    // ignore
  }

  return {
    tables: tables.filter((t) => t.outlet_id === outletId),
    reservations: reservations.filter((r) => r.outlet_id === outletId),
  };
}

export async function updateTableStatusAdmin(
  tableId: string,
  status: TableStatus
): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('tables').update({ status }).eq('id', tableId);
    return;
  }
  const raw = localStorage.getItem(DEMO_ADMIN_TABLES_KEY);
  const all = raw ? (JSON.parse(raw) as RestaurantTable[]) : SEED_TABLES;
  localStorage.setItem(
    DEMO_ADMIN_TABLES_KEY,
    JSON.stringify(all.map((t) => (t.id === tableId ? { ...t, status } : t)))
  );
}

export async function updateReservationStatusAdmin(
  reservationId: string,
  status: ReservationStatus
): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('reservations').update({ status }).eq('id', reservationId);
    return;
  }
  const raw = localStorage.getItem('kk_demo_reservations_v1');
  const all = raw ? (JSON.parse(raw) as Reservation[]) : [];
  localStorage.setItem(
    'kk_demo_reservations_v1',
    JSON.stringify(all.map((r) => (r.id === reservationId ? { ...r, status } : r)))
  );
}

export async function addWalkInReservation(params: {
  outletId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  tableId?: string;
}): Promise<void> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const code = `WLK-${Math.floor(100 + Math.random() * 900)}`;

  if (isSupabaseConfigured) {
    await supabase.from('reservations').insert({
      reservation_code: code,
      outlet_id: params.outletId,
      table_id: params.tableId || null,
      customer_name: params.customerName,
      customer_phone: params.customerPhone || '0000000000',
      reservation_date: today,
      time_slot: 'Walk-in',
      party_size: params.partySize,
      seating_preference: 'any',
      status: 'seated',
      is_walk_in: true,
      notification_channel: 'sms',
    });
    if (params.tableId) {
      await updateTableStatusAdmin(params.tableId, 'occupied');
    }
    return;
  }

  const raw = localStorage.getItem('kk_demo_reservations_v1');
  const all = raw ? (JSON.parse(raw) as Reservation[]) : [];
  const row: Reservation = {
    id: `walkin-${Date.now()}`,
    reservation_code: code,
    outlet_id: params.outletId,
    table_id: params.tableId || null,
    customer_id: null,
    customer_name: params.customerName,
    customer_phone: params.customerPhone || 'Walk-in',
    customer_email: null,
    reservation_date: today,
    time_slot: 'Walk-in',
    party_size: params.partySize,
    seating_preference: 'any',
    status: 'seated',
    is_walk_in: true,
    special_requests: null,
    notification_channel: 'sms',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem('kk_demo_reservations_v1', JSON.stringify([row, ...all]));
  if (params.tableId) {
    await updateTableStatusAdmin(params.tableId, 'occupied');
  }
}

// =============================================================================
// WEBSITE CONTENT EDITOR (CMS)
// =============================================================================
export async function fetchSiteContentAdmin(): Promise<SiteContent[]> {
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .order('display_order');
    if (data && data.length > 0) return data as SiteContent[];
  }
  try {
    const raw = localStorage.getItem(DEMO_ADMIN_CONTENT_KEY);
    if (raw) return JSON.parse(raw) as SiteContent[];
  } catch {
    // ignore
  }
  return MOCK_SITE_CONTENT;
}

export async function saveSiteContentAdmin(item: SiteContent): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('site_content')
      .update({
        title: item.title,
        subtitle: item.subtitle,
        body: item.body,
        cta_label: item.cta_label,
        is_active: item.is_active,
      })
      .eq('id', item.id);
    if (error) throw new Error(error.message);
    return;
  }

  const list = await fetchSiteContentAdmin();
  const next = list.map((c) => (c.id === item.id ? item : c));
  localStorage.setItem(DEMO_ADMIN_CONTENT_KEY, JSON.stringify(next));
}

