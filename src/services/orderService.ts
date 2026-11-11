import { BRAND } from '@/config/brand';
import type { CartLineItem } from '@/context/CartContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from '@/types/database';

export const DEMO_ORDERS_KEY = 'kk_demo_orders_v1';
const DEMO_LOYALTY_KEY = 'kk_demo_loyalty_v1';
const ORDER_SYNC_CHANNEL = 'kk-orders-sync-v1';

export type OrderSyncEvent =
  | { type: 'NEW_ORDER'; orderId: string }
  | { type: 'ORDER_STATUS_UPDATED'; orderId: string; status: OrderStatus };

export function broadcastOrderSync(event: OrderSyncEvent): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(ORDER_SYNC_CHANNEL);
      ch.postMessage(event);
      ch.close();
    }
  } catch {
    // ignore BroadcastChannel errors
  }
}

let backendApiPromise: Promise<boolean> | null = null;

export async function hasBackendApi(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return false;
  }
  if (!backendApiPromise) {
    backendApiPromise = fetch('/api/health')
      .then(async (res) => {
        if (!res.ok) return false;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return false;
        const data = (await res.json()) as { ok?: boolean };
        return Boolean(data?.ok);
      })
      .catch(() => false);
  }
  return backendApiPromise;
}

export function subscribeToDemoOrderSync(
  onSync: (event: OrderSyncEvent) => void
): () => void {
  let disposed = false;
  let ch: BroadcastChannel | null = null;
  let es: EventSource | null = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(ORDER_SYNC_CHANNEL);
      ch.onmessage = (msg) => {
        if (msg.data && typeof msg.data.type === 'string') {
          onSync(msg.data as OrderSyncEvent);
        }
      };
    }
  } catch {
    ch = null;
  }

  // Subscribe to Server-Sent Events when served by Node server.mjs (cross-device sync)
  void hasBackendApi().then((available) => {
    if (disposed || !available || typeof EventSource === 'undefined') return;
    try {
      es = new EventSource('/api/events');
      es.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data) as OrderSyncEvent;
          if (parsed && typeof parsed.type === 'string') {
            onSync(parsed);
          }
        } catch {
          // ignore heartbeats / non-JSON
        }
      };
    } catch {
      es = null;
    }
  });

  const handleStorage = (e: StorageEvent) => {
    if (e.key === DEMO_ORDERS_KEY) {
      onSync({ type: 'NEW_ORDER', orderId: '' });
    } else if (e.key === 'kk_demo_admin_orders_v1') {
      onSync({ type: 'ORDER_STATUS_UPDATED', orderId: '', status: 'preparing' });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    disposed = true;
    if (ch) ch.close();
    if (es) es.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'KKWELCOME',
    description: '₹40 off on orders above ₹249',
    discount_type: 'flat',
    discount_value: 40,
    min_order_amount: 249,
    max_discount: 40,
    outlet_id: null,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    usage_limit: null,
    used_count: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coup-2',
    code: 'MORNING15',
    description: '15% off on breakfast pickups (up to ₹60)',
    discount_type: 'percent',
    discount_value: 15,
    min_order_amount: 199,
    max_discount: 60,
    outlet_id: null,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    usage_limit: null,
    used_count: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coup-3',
    code: 'FAMILY100',
    description: '₹100 off on family meal orders above ₹699',
    discount_type: 'flat',
    discount_value: 100,
    min_order_amount: 699,
    max_discount: 100,
    outlet_id: null,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    usage_limit: null,
    used_count: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  outletId: string
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discountAmount: 0, message: 'Enter a coupon code.' };
  }

  let coupon: Coupon | undefined;
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (data) coupon = data as Coupon;
  } else {
    coupon = MOCK_COUPONS.find((c) => c.code === code);
  }

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: `Coupon "${code}" is invalid or expired.` };
  }
  if (coupon.outlet_id && coupon.outlet_id !== outletId) {
    return { valid: false, discountAmount: 0, message: `"${code}" is not valid at this outlet.` };
  }
  if (subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order of ₹${coupon.min_order_amount} required for ${code}.`,
    };
  }

  let discount =
    coupon.discount_type === 'flat'
      ? coupon.discount_value
      : Math.round((subtotal * coupon.discount_value) / 100);
  if (coupon.max_discount != null) {
    discount = Math.min(discount, coupon.max_discount);
  }
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    coupon,
    discountAmount: discount,
    message: `${code} applied — you save ₹${discount}!`,
  };
}

export async function lookupCustomerLoyalty(phone: string): Promise<number> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 10) return 0;

  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('customers')
      .select('loyalty_points')
      .ilike('phone', `%${cleanPhone}%`)
      .maybeSingle();
    return data?.loyalty_points ?? 0;
  }

  try {
    const raw = localStorage.getItem(DEMO_LOYALTY_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return map[cleanPhone] ?? 50; // Demo returning guest starts with 50 welcome points
  } catch {
    return 50;
  }
}

export interface DemoOrderRecord {
  order: Order;
  items: OrderItem[];
  outletName: string;
}

function getDemoOrders(): DemoOrderRecord[] {
  try {
    const raw = localStorage.getItem(DEMO_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as DemoOrderRecord[]) : [];
  } catch {
    return [];
  }
}

function saveDemoOrder(record: DemoOrderRecord, notifyNewOrder = false) {
  try {
    const existing = getDemoOrders().filter((r) => r.order.id !== record.order.id);
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify([record, ...existing].slice(0, 20)));
    if (notifyNewOrder) {
      broadcastOrderSync({ type: 'NEW_ORDER', orderId: record.order.id });
    }
  } catch {
    // ignore storage errors
  }
}

export function getRecentLocalOrders(): DemoOrderRecord[] {
  return getDemoOrders();
}

export async function advanceDemoOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<void> {
  if (isSupabaseConfigured && !orderId.startsWith('demo-') && !orderId.startsWith('seed-')) {
    await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
    return;
  }
  const all = getDemoOrders();
  const updated = all.map((r) =>
    r.order.id === orderId
      ? {
          ...r,
          order: { ...r.order, status: nextStatus, updated_at: new Date().toISOString() },
        }
      : r
  );
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(updated));
  broadcastOrderSync({
    type: 'ORDER_STATUS_UPDATED',
    orderId,
    status: nextStatus,
  });
}

export interface PlaceOrderInput {
  outletId: string;
  outletSlug: string;
  outletName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: OrderType;
  deliveryAddress?: string;
  orderNotes?: string;
  scheduledFor?: string;
  lines: CartLineItem[];
  subtotal: number;
  gstAmount: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  loyaltyPointsRedeemed: number;
  paymentMethod: 'razorpay' | 'counter';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

function generateOrderNumber(outletSlug: string): string {
  const prefix = outletSlug.slice(0, 3).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `KK-${prefix}-${num}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{
  order: Order;
  items: OrderItem[];
  outletName: string;
}> {
  const totalAmount = Math.max(
    0,
    Math.round(
      (input.subtotal + input.gstAmount + input.deliveryFee - input.discountAmount) * 100
    ) / 100
  );
  const pointsEarned = BRAND.features.enableLoyaltyProgram
    ? Math.floor(input.subtotal / 100) * BRAND.operations.loyaltyPointsPer100Inr
    : 0;

  const orderNumber = generateOrderNumber(input.outletSlug);
  const estimatedReadyAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
  const paymentStatus: PaymentStatus =
    input.paymentMethod === 'razorpay' ? 'paid' : 'pending';

  if (!isSupabaseConfigured) {
    const orderId = `demo-ord-${Date.now()}`;
    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      outlet_id: input.outletId,
      customer_id: null,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      order_type: input.orderType,
      status: 'received',
      payment_status: paymentStatus,
      subtotal: input.subtotal,
      gst_amount: input.gstAmount,
      discount_amount: input.discountAmount,
      delivery_fee: input.deliveryFee,
      total_amount: totalAmount,
      coupon_code: input.couponCode || null,
      loyalty_points_redeemed: input.loyaltyPointsRedeemed,
      loyalty_points_earned: pointsEarned,
      delivery_address: input.deliveryAddress || null,
      order_notes: input.orderNotes || null,
      scheduled_for: input.scheduledFor || null,
      estimated_ready_at: estimatedReadyAt,
      created_at: now,
      updated_at: now,
    };

    const items: OrderItem[] = input.lines.map((line, idx) => ({
      id: `${orderId}-item-${idx}`,
      order_id: orderId,
      menu_item_id: line.item.id,
      item_name: line.item.name,
      quantity: line.quantity,
      unit_price: line.item.outlet_price,
      total_price: line.item.outlet_price * line.quantity,
      spice_preference: line.spicePreference,
      is_jain: line.isJain,
      special_instructions: line.specialInstructions || null,
    }));

    // Update demo loyalty points
    const cleanPhone = input.customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length >= 10) {
      try {
        const raw = localStorage.getItem(DEMO_LOYALTY_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
        const current = map[cleanPhone] ?? 50;
        map[cleanPhone] = Math.max(0, current - input.loyaltyPointsRedeemed + pointsEarned);
        localStorage.setItem(DEMO_LOYALTY_KEY, JSON.stringify(map));
      } catch {
        // ignore
      }
    }

    const record = { order, items, outletName: input.outletName };
    saveDemoOrder(record, true);

    if (await hasBackendApi()) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      } catch {
        // local fallback already saved
      }
    }

    return record;
  }

  // Upsert customer record in Supabase
  const cleanPhone = input.customerPhone.replace(/\D/g, '').slice(-10);
  let customerId: string | null = null;
  const { data: existingCust } = await supabase
    .from('customers')
    .select('id, loyalty_points')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (existingCust) {
    customerId = existingCust.id;
    const newBalance = Math.max(
      0,
      existingCust.loyalty_points - input.loyaltyPointsRedeemed + pointsEarned
    );
    await supabase
      .from('customers')
      .update({ loyalty_points: newBalance, full_name: input.customerName })
      .eq('id', existingCust.id);
  } else {
    const { data: newCust } = await supabase
      .from('customers')
      .insert({
        full_name: input.customerName,
        phone: cleanPhone,
        email: input.customerEmail || null,
        default_outlet_id: input.outletId,
        loyalty_points: pointsEarned,
      })
      .select('id')
      .maybeSingle();
    customerId = newCust?.id ?? null;
  }

  const { data: insertedOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      outlet_id: input.outletId,
      customer_id: customerId,
      customer_name: input.customerName,
      customer_phone: cleanPhone,
      customer_email: input.customerEmail || null,
      order_type: input.orderType,
      status: 'received',
      payment_status: paymentStatus,
      subtotal: input.subtotal,
      gst_amount: input.gstAmount,
      discount_amount: input.discountAmount,
      delivery_fee: input.deliveryFee,
      total_amount: totalAmount,
      coupon_code: input.couponCode || null,
      loyalty_points_redeemed: input.loyaltyPointsRedeemed,
      loyalty_points_earned: pointsEarned,
      delivery_address: input.deliveryAddress || null,
      order_notes: input.orderNotes || null,
      scheduled_for: input.scheduledFor || null,
      estimated_ready_at: estimatedReadyAt,
    })
    .select('*')
    .single();

  if (orderError || !insertedOrder) {
    throw new Error(orderError?.message || 'Failed to place order');
  }

  const orderItemsPayload = input.lines.map((line) => ({
    order_id: insertedOrder.id,
    menu_item_id: line.item.id,
    item_name: line.item.name,
    quantity: line.quantity,
    unit_price: line.item.outlet_price,
    total_price: line.item.outlet_price * line.quantity,
    spice_preference: line.spicePreference,
    is_jain: line.isJain,
    special_instructions: line.specialInstructions || null,
  }));

  const { data: insertedItems } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select('*');

  await supabase.from('payments').insert({
    order_id: insertedOrder.id,
    outlet_id: input.outletId,
    provider: input.paymentMethod === 'razorpay' ? 'razorpay' : 'cash',
    razorpay_order_id: input.razorpayOrderId || null,
    razorpay_payment_id: input.razorpayPaymentId || null,
    amount: totalAmount,
    currency: BRAND.operations.currencyCode,
    status: paymentStatus,
    method: input.paymentMethod === 'razorpay' ? 'upi/card' : 'counter',
  });

  const record = {
    order: insertedOrder as Order,
    items: (insertedItems || []) as OrderItem[],
    outletName: input.outletName,
  };
  saveDemoOrder(record);
  return record;
}

export async function lookupOrderForTracking(
  orderNumber: string,
  phone: string
): Promise<DemoOrderRecord | null> {
  const localMatch = getDemoOrders().find(
    (r) =>
      r.order.order_number.toUpperCase() === orderNumber.trim().toUpperCase() &&
      r.order.customer_phone.replace(/\D/g, '').slice(-4) ===
        phone.replace(/\D/g, '').slice(-4)
  );

  if (!isSupabaseConfigured) {
    if (await hasBackendApi()) {
      try {
        const res = await fetch(
          `/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { record?: DemoOrderRecord | null };
          if (data.record) {
            saveDemoOrder(data.record);
            return data.record;
          }
        }
      } catch {
        // fallback to local
      }
    }
    return localMatch ?? null;
  }

  const { data, error } = await supabase.rpc('track_order_public', {
    p_order_number: orderNumber,
    p_phone: phone,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return localMatch ?? null;
  }

  const row = data[0];
  return {
    order: row as Order,
    items: localMatch?.items ?? [],
    outletName: row.outlet_name,
  };
}

export async function fetchOrderByIdForTracking(
  orderId: string
): Promise<DemoOrderRecord | null> {
  const localMatch = getDemoOrders().find((r) => r.order.id === orderId);
  if (!isSupabaseConfigured || orderId.startsWith('demo-ord-') || orderId.startsWith('seed-ord-')) {
    if (await hasBackendApi()) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = (await res.json()) as { record?: DemoOrderRecord | null };
          if (data.record) {
            saveDemoOrder(data.record);
            return data.record;
          }
        }
      } catch {
        // fallback to local
      }
    }
    return localMatch ?? null;
  }

  const { data } = await supabase
    .from('orders')
    .select('*, outlets(name)')
    .eq('id', orderId)
    .maybeSingle();

  if (!data) return localMatch ?? null;
  const outletJoin = data.outlets as { name?: string } | null;

  return {
    order: data as Order,
    items: localMatch?.items ?? [],
    outletName: outletJoin?.name || localMatch?.outletName || BRAND.name,
  };
}

export async function submitOrderReview(params: {
  outletId: string;
  orderId?: string;
  customerName: string;
  rating: number;
  foodRating: number;
  serviceRating: number;
  comment: string;
  postedToGoogle: boolean;
}) {
  if (!isSupabaseConfigured) {
    return { ok: true };
  }
  const { error } = await supabase.from('reviews').insert({
    outlet_id: params.outletId,
    order_id: params.orderId && !params.orderId.startsWith('demo-') ? params.orderId : null,
    customer_name: params.customerName,
    rating: params.rating,
    food_rating: params.foodRating,
    service_rating: params.serviceRating,
    comment: params.comment,
    posted_to_google: params.postedToGoogle,
    status: 'published',
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

/**
 * Loads Razorpay Checkout script dynamically and opens UPI/Card payment modal
 * when VITE_RAZORPAY_KEY_ID is configured.
 */
export async function launchRazorpayCheckout(opts: {
  amountInr: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  outletName: string;
}): Promise<{ paymentId: string; orderId?: string }> {
  const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  const isRealKey =
    Boolean(rzpKey) && !rzpKey?.includes('xxxxxxxxxxxxxx');

  if (!isRealKey) {
    // Demo fallback when Razorpay public key is not yet configured
    return {
      paymentId: `pay_demo_${Date.now()}`,
      orderId: `order_demo_${Date.now()}`,
    };
  }

  await new Promise<void>((resolve, reject) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });

  return new Promise((resolve, reject) => {
    const RazorpayCtor = (
      window as unknown as {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
      }
    ).Razorpay;

    const rzp = new RazorpayCtor({
      key: rzpKey,
      amount: Math.round(opts.amountInr * 100), // paise
      currency: BRAND.operations.currencyCode,
      name: BRAND.name,
      description: `Order at ${opts.outletName}`,
      prefill: {
        name: opts.customerName,
        contact: opts.customerPhone,
        email: opts.customerEmail || undefined,
      },
      theme: {
        color: BRAND.colors.primary,
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
      }) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
      },
    });
    rzp.open();
  });
}

