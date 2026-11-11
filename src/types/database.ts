export type StaffRole = 'owner' | 'outlet_manager' | 'kitchen_staff' | 'cashier';

export type OrderType = 'pickup' | 'delivery' | 'dine_in';

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type SpiceLevel = 'mild' | 'medium' | 'spicy';

export type TableZone = 'ac' | 'non_ac' | 'outdoor';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type StockMovementType = 'purchase' | 'usage' | 'wastage' | 'adjustment';

export type ShiftType = 'morning' | 'evening' | 'full_day';

export type AttendanceStatus = 'scheduled' | 'present' | 'absent' | 'half_day' | 'leave';

export type DiscountType = 'percent' | 'flat';

export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'adjusted' | 'expired';

export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'confirmed' | 'closed';

export interface Outlet {
  id: string;
  name: string;
  slug: string;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  phone: string;
  email: string | null;
  maps_embed_url: string | null;
  maps_directions_url: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string;
  closing_time: string;
  holiday_dates: string[];
  seating_ac: boolean;
  seating_non_ac: boolean;
  seating_outdoor: boolean;
  parking_info: string | null;
  total_tables: number;
  max_guests_per_slot: number;
  has_bakery_counter: boolean;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  is_veg: boolean;
  is_jain_available: boolean;
  is_no_onion_garlic: boolean;
  is_bestseller: boolean;
  is_todays_special: boolean;
  spice_level: SpiceLevel;
  prep_time_mins: number;
  calories: number | null;
  tags: string[];
  is_bakery_item: boolean;
  requires_preorder: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OutletMenuPrice {
  id: string;
  outlet_id: string;
  menu_item_id: string;
  price: number;
  is_available: boolean;
  unavailable_reason: string | null;
  updated_at: string;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  default_outlet_id: string | null;
  loyalty_points: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  outlet_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: OrderType;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  gst_amount: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  coupon_code: string | null;
  loyalty_points_redeemed: number;
  loyalty_points_earned: number;
  delivery_address: string | null;
  order_notes: string | null;
  scheduled_for: string | null;
  estimated_ready_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  spice_preference: SpiceLevel | null;
  is_jain: boolean;
  special_instructions: string | null;
}

export interface Payment {
  id: string;
  order_id: string;
  outlet_id: string;
  provider: 'razorpay' | 'cash' | 'upi';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  outlet_id: string;
  table_number: string;
  zone: TableZone;
  capacity: number;
  status: TableStatus;
  current_reservation_id: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reservation_code: string;
  outlet_id: string;
  table_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  reservation_date: string;
  time_slot: string;
  party_size: number;
  seating_preference: TableZone | 'any';
  status: ReservationStatus;
  is_walk_in: boolean;
  special_requests: string | null;
  notification_channel: 'whatsapp' | 'sms' | 'email';
  created_at: string;
  updated_at: string;
}

export interface CateringEnquiry {
  id: string;
  enquiry_code: string;
  outlet_id: string | null;
  contact_name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string;
  guest_count: number;
  venue_address: string | null;
  preferred_menu_notes: string | null;
  estimated_budget: number | null;
  quoted_amount: number | null;
  status: EnquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  outlet_id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  current_stock: number;
  reorder_level: number;
  cost_per_unit: number;
  supplier_name: string | null;
  last_restocked_at: string | null;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  outlet_id: string;
  inventory_item_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reason: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface StaffMember {
  id: string;
  auth_user_id: string | null;
  outlet_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  role: StaffRole;
  is_active: boolean;
  joined_at: string;
  created_at: string;
}

export interface StaffShift {
  id: string;
  outlet_id: string;
  staff_id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string;
  end_time: string;
  attendance_status: AttendanceStatus;
  check_in_at: string | null;
  check_out_at: string | null;
  notes: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  outlet_id: string | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface LoyaltyLedgerEntry {
  id: string;
  customer_id: string;
  order_id: string | null;
  points_delta: number;
  balance_after: number;
  transaction_type: LoyaltyTransactionType;
  description: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  outlet_id: string;
  order_id: string | null;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  food_rating: number | null;
  service_rating: number | null;
  comment: string | null;
  is_featured: boolean;
  posted_to_google: boolean;
  status: 'pending' | 'published' | 'hidden';
  created_at: string;
}

export interface SiteContent {
  id: string;
  outlet_id: string | null;
  key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

/** Joined view used across the public menu & admin menu manager */
export interface OutletMenuItem extends MenuItem {
  category_name?: string;
  category_slug?: string;
  outlet_price: number;
  is_available: boolean;
  unavailable_reason: string | null;
}

