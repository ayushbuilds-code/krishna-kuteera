import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_OUTLETS, MOCK_REVIEWS } from '@/data/mockSeed';
import {
  DEMO_INVENTORY_SEED,
  fetchAdminOrders,
  type AdminOrderWithItems,
} from '@/services/adminService';
import { DEMO_STAFF_PROFILES } from '@/context/AdminAuthContext';
import type {
  AttendanceStatus,
  CateringEnquiry,
  Customer,
  EnquiryStatus,
  InventoryItem,
  Review,
  ShiftType,
  StaffMember,
  StaffRole,
  StaffShift,
  StockMovement,
  StockMovementType,
} from '@/types/database';

const DEMO_INV_KEY = 'kk_demo_inventory_v1';
const DEMO_MOVEMENTS_KEY = 'kk_demo_stock_movements_v1';
const DEMO_STAFF_KEY = 'kk_demo_staff_list_v1';
const DEMO_SHIFTS_KEY = 'kk_demo_shifts_v1';
const DEMO_CUSTOMERS_KEY = 'kk_demo_customers_v1';
const DEMO_REVIEWS_KEY = 'kk_demo_admin_reviews_v1';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// =============================================================================
// 1. INVENTORY & WASTAGE
// =============================================================================
export async function fetchInventoryAdmin(outletId: string | 'all'): Promise<{
  items: InventoryItem[];
  movements: StockMovement[];
}> {
  if (isSupabaseConfigured) {
    let iq = supabase.from('inventory_items').select('*').order('name');
    let mq = supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);
    if (outletId !== 'all') {
      iq = iq.eq('outlet_id', outletId);
      mq = mq.eq('outlet_id', outletId);
    }
    const [ir, mr] = await Promise.all([iq, mq]);
    return {
      items: (ir.data || []) as InventoryItem[],
      movements: (mr.data || []) as StockMovement[],
    };
  }

  const allItems = readLocal<InventoryItem[]>(DEMO_INV_KEY, DEMO_INVENTORY_SEED);
  const allMovements = readLocal<StockMovement[]>(DEMO_MOVEMENTS_KEY, [
    {
      id: 'mov-seed-1',
      outlet_id: MOCK_OUTLETS[0].id,
      inventory_item_id: 'inv-1',
      movement_type: 'wastage',
      quantity: 1.5,
      reason: 'End-of-day leftover batter discarded',
      recorded_by: null,
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
  ]);

  return {
    items:
      outletId === 'all'
        ? allItems
        : allItems.filter((i) => i.outlet_id === outletId),
    movements:
      outletId === 'all'
        ? allMovements
        : allMovements.filter((m) => m.outlet_id === outletId),
  };
}

export async function addInventoryItemAdmin(params: {
  outletId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  costPerUnit: number;
  supplierName?: string;
}): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('inventory_items').insert({
      outlet_id: params.outletId,
      name: params.name,
      category: params.category,
      unit: params.unit,
      current_stock: params.currentStock,
      reorder_level: params.reorderLevel,
      cost_per_unit: params.costPerUnit,
      supplier_name: params.supplierName || null,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const all = readLocal<InventoryItem[]>(DEMO_INV_KEY, DEMO_INVENTORY_SEED);
  const next: InventoryItem = {
    id: `inv-${Date.now()}`,
    outlet_id: params.outletId,
    name: params.name,
    sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
    category: params.category,
    unit: params.unit,
    current_stock: params.currentStock,
    reorder_level: params.reorderLevel,
    cost_per_unit: params.costPerUnit,
    supplier_name: params.supplierName || null,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  writeLocal(DEMO_INV_KEY, [next, ...all]);
}

export async function recordStockMovementAdmin(params: {
  outletId: string;
  inventoryItemId: string;
  movementType: StockMovementType;
  quantity: number;
  reason: string;
  recordedBy?: string;
}): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('stock_movements').insert({
      outlet_id: params.outletId,
      inventory_item_id: params.inventoryItemId,
      movement_type: params.movementType,
      quantity: params.quantity,
      reason: params.reason || null,
      recorded_by: params.recordedBy || null,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const allItems = readLocal<InventoryItem[]>(DEMO_INV_KEY, DEMO_INVENTORY_SEED);
  const updatedItems = allItems.map((it) => {
    if (it.id !== params.inventoryItemId) return it;
    let nextStock = it.current_stock;
    if (params.movementType === 'purchase') {
      nextStock += Math.abs(params.quantity);
    } else if (
      params.movementType === 'usage' ||
      params.movementType === 'wastage'
    ) {
      nextStock = Math.max(0, nextStock - Math.abs(params.quantity));
    } else {
      nextStock = Math.max(0, nextStock + params.quantity);
    }
    return {
      ...it,
      current_stock: Math.round(nextStock * 100) / 100,
      updated_at: new Date().toISOString(),
    };
  });
  writeLocal(DEMO_INV_KEY, updatedItems);

  const movements = readLocal<StockMovement[]>(DEMO_MOVEMENTS_KEY, []);
  const newMov: StockMovement = {
    id: `mov-${Date.now()}`,
    outlet_id: params.outletId,
    inventory_item_id: params.inventoryItemId,
    movement_type: params.movementType,
    quantity: params.quantity,
    reason: params.reason || null,
    recorded_by: params.recordedBy || null,
    created_at: new Date().toISOString(),
  };
  writeLocal(DEMO_MOVEMENTS_KEY, [newMov, ...movements].slice(0, 50));
}

// =============================================================================
// 2. STAFF & SHIFTS
// =============================================================================
export async function fetchStaffAndShiftsAdmin(
  outletId: string | 'all',
  shiftDate: string
): Promise<{ staffList: StaffMember[]; shifts: StaffShift[] }> {
  if (isSupabaseConfigured) {
    let sq = supabase.from('staff').select('*').order('full_name');
    let shQ = supabase
      .from('shifts')
      .select('*')
      .eq('shift_date', shiftDate);
    if (outletId !== 'all') {
      sq = sq.eq('outlet_id', outletId);
      shQ = shQ.eq('outlet_id', outletId);
    }
    const [sr, shr] = await Promise.all([sq, shQ]);
    return {
      staffList: (sr.data || []) as StaffMember[],
      shifts: (shr.data || []) as StaffShift[],
    };
  }

  const staffAll = readLocal<StaffMember[]>(DEMO_STAFF_KEY, DEMO_STAFF_PROFILES);
  const shiftsAll = readLocal<StaffShift[]>(DEMO_SHIFTS_KEY, []);

  return {
    staffList:
      outletId === 'all'
        ? staffAll
        : staffAll.filter((s) => s.outlet_id === outletId || s.role === 'owner'),
    shifts: shiftsAll.filter(
      (sh) =>
        sh.shift_date === shiftDate &&
        (outletId === 'all' || sh.outlet_id === outletId)
    ),
  };
}

export async function addStaffMemberAdmin(params: {
  outletId: string | null;
  fullName: string;
  phone: string;
  email?: string;
  role: StaffRole;
}): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('staff').insert({
      outlet_id: params.outletId,
      full_name: params.fullName,
      phone: params.phone,
      email: params.email || null,
      role: params.role,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const all = readLocal<StaffMember[]>(DEMO_STAFF_KEY, DEMO_STAFF_PROFILES);
  const member: StaffMember = {
    id: `staff-${Date.now()}`,
    auth_user_id: null,
    outlet_id: params.outletId,
    full_name: params.fullName,
    phone: params.phone,
    email: params.email || null,
    role: params.role,
    is_active: true,
    joined_at: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  };
  writeLocal(DEMO_STAFF_KEY, [...all, member]);
}

export async function upsertShiftAttendanceAdmin(params: {
  outletId: string;
  staffId: string;
  shiftDate: string;
  shiftType: ShiftType;
  attendanceStatus: AttendanceStatus;
}): Promise<void> {
  const times: Record<ShiftType, { start: string; end: string }> = {
    morning: { start: '07:00', end: '15:00' },
    evening: { start: '15:00', end: '23:00' },
    full_day: { start: '08:00', end: '20:00' },
  };
  const { start, end } = times[params.shiftType];

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('shifts').upsert(
      {
        outlet_id: params.outletId,
        staff_id: params.staffId,
        shift_date: params.shiftDate,
        shift_type: params.shiftType,
        start_time: start,
        end_time: end,
        attendance_status: params.attendanceStatus,
        check_in_at:
          params.attendanceStatus === 'present' ? new Date().toISOString() : null,
      },
      { onConflict: 'staff_id,shift_date,shift_type' }
    );
    if (error) throw new Error(error.message);
    return;
  }

  const all = readLocal<StaffShift[]>(DEMO_SHIFTS_KEY, []);
  const idx = all.findIndex(
    (s) =>
      s.staff_id === params.staffId &&
      s.shift_date === params.shiftDate
  );
  const record: StaffShift = {
    id: idx >= 0 ? all[idx].id : `sh-${Date.now()}`,
    outlet_id: params.outletId,
    staff_id: params.staffId,
    shift_date: params.shiftDate,
    shift_type: params.shiftType,
    start_time: start,
    end_time: end,
    attendance_status: params.attendanceStatus,
    check_in_at:
      params.attendanceStatus === 'present' ? new Date().toISOString() : null,
    check_out_at: null,
    notes: null,
  };
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  writeLocal(DEMO_SHIFTS_KEY, all);
}

// =============================================================================
// 3. CUSTOMERS (CRM), REVIEWS & CATERING ENQUIRIES
// =============================================================================
export interface CrmCustomerSummary {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  loyalty_points: number;
  ordersCount: number;
  totalSpent: number;
  orders: AdminOrderWithItems[];
}

export async function fetchCrmDataAdmin(outletId: string | 'all'): Promise<{
  customers: CrmCustomerSummary[];
  reviews: Review[];
  enquiries: CateringEnquiry[];
}> {
  const orders = await fetchAdminOrders(outletId);

  let rawCustomers: Customer[] = [];
  let reviews: Review[] = [];
  let enquiries: CateringEnquiry[] = [];

  if (isSupabaseConfigured) {
    const [custRes, revRes, enqRes] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      outletId === 'all'
        ? supabase.from('reviews').select('*').order('created_at', { ascending: false })
        : supabase
            .from('reviews')
            .select('*')
            .eq('outlet_id', outletId)
            .order('created_at', { ascending: false }),
      outletId === 'all'
        ? supabase
            .from('catering_enquiries')
            .select('*')
            .order('created_at', { ascending: false })
        : supabase
            .from('catering_enquiries')
            .select('*')
            .eq('outlet_id', outletId)
            .order('created_at', { ascending: false }),
    ]);
    rawCustomers = (custRes.data || []) as Customer[];
    reviews = (revRes.data || []) as Review[];
    enquiries = (enqRes.data || []) as CateringEnquiry[];
  } else {
    rawCustomers = readLocal<Customer[]>(DEMO_CUSTOMERS_KEY, []);
    reviews = readLocal<Review[]>(DEMO_REVIEWS_KEY, MOCK_REVIEWS).filter(
      (r) => outletId === 'all' || r.outlet_id === outletId
    );
    enquiries = readLocal<CateringEnquiry[]>('kk_demo_catering_v1', []).filter(
      (e) => outletId === 'all' || !e.outlet_id || e.outlet_id === outletId
    );
  }

  // Build CRM profiles from orders + customers table
  const byPhone = new Map<string, CrmCustomerSummary>();
  rawCustomers.forEach((c) => {
    byPhone.set(c.phone, {
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      loyalty_points: c.loyalty_points,
      ordersCount: 0,
      totalSpent: 0,
      orders: [],
    });
  });

  orders.forEach((entry) => {
    const ph = entry.order.customer_phone.replace(/\D/g, '').slice(-10);
    const existing = byPhone.get(ph) ?? {
      id: entry.order.customer_id || `cust-${ph}`,
      full_name: entry.order.customer_name,
      phone: ph,
      email: entry.order.customer_email,
      loyalty_points: entry.order.loyalty_points_earned || 50,
      ordersCount: 0,
      totalSpent: 0,
      orders: [],
    };
    existing.ordersCount += 1;
    existing.totalSpent += entry.order.total_amount;
    existing.orders.push(entry);
    byPhone.set(ph, existing);
  });

  return {
    customers: Array.from(byPhone.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    ),
    reviews,
    enquiries,
  };
}

export async function updateReviewStatusAdmin(
  reviewId: string,
  status: Review['status']
): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('reviews').update({ status }).eq('id', reviewId);
    return;
  }
  const all = readLocal<Review[]>(DEMO_REVIEWS_KEY, MOCK_REVIEWS);
  writeLocal(
    DEMO_REVIEWS_KEY,
    all.map((r) => (r.id === reviewId ? { ...r, status } : r))
  );
}

export async function updateCateringEnquiryAdmin(
  id: string,
  status: EnquiryStatus,
  quotedAmount?: number
): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase
      .from('catering_enquiries')
      .update({
        status,
        ...(quotedAmount !== undefined ? { quoted_amount: quotedAmount } : {}),
      })
      .eq('id', id);
    return;
  }
  const all = readLocal<CateringEnquiry[]>('kk_demo_catering_v1', []);
  writeLocal(
    'kk_demo_catering_v1',
    all.map((e) =>
      e.id === id
        ? {
            ...e,
            status,
            quoted_amount: quotedAmount ?? e.quoted_amount,
          }
        : e
    )
  );
}

// =============================================================================
// 4. SALES & GST REPORTS + CSV EXPORT
// =============================================================================
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export async function fetchSalesReportAdmin(
  outletId: string | 'all',
  period: ReportPeriod
): Promise<AdminOrderWithItems[]> {
  const all = await fetchAdminOrders(outletId);
  const now = Date.now();
  const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  return all.filter(
    (entry) =>
      entry.order.status !== 'cancelled' &&
      new Date(entry.order.created_at).getTime() >= cutoff
  );
}

export function exportOrdersToCsv(
  rows: AdminOrderWithItems[],
  filename: string
): void {
  const header = [
    'Order Number',
    'Date',
    'Customer Name',
    'Phone',
    'Order Type',
    'Payment Status',
    'Taxable Subtotal (INR)',
    'CGST 2.5% (INR)',
    'SGST 2.5% (INR)',
    'Discount (INR)',
    'Delivery Fee (INR)',
    'Total Amount (INR)',
  ];

  const escape = (val: string | number) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const lines = rows.map(({ order }) => {
    const halfGst = Math.round((order.gst_amount / 2) * 100) / 100;
    return [
      order.order_number,
      new Date(order.created_at).toLocaleString('en-IN'),
      order.customer_name,
      order.customer_phone,
      order.order_type,
      order.payment_status,
      order.subtotal.toFixed(2),
      halfGst.toFixed(2),
      halfGst.toFixed(2),
      order.discount_amount.toFixed(2),
      order.delivery_fee.toFixed(2),
      order.total_amount.toFixed(2),
    ]
      .map(escape)
      .join(',');
  });

  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

