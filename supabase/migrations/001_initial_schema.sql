-- =============================================================================
-- Krishna Kuteera — Initial Database Schema, Indexes, Triggers & RLS Policies
-- =============================================================================
-- Pure-vegetarian multi-outlet South Indian restaurant platform.
-- Designed for Supabase (PostgreSQL 15+ with auth.users).

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('owner', 'outlet_manager', 'kitchen_staff', 'cashier');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('pickup', 'delivery', 'dine_in');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('received', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE spice_level AS ENUM ('mild', 'medium', 'spicy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE table_zone AS ENUM ('ac', 'non_ac', 'outdoor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('purchase', 'usage', 'wastage', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shift_type AS ENUM ('morning', 'evening', 'full_day');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('scheduled', 'present', 'absent', 'half_day', 'leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percent', 'flat');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loyalty_tx_type AS ENUM ('earned', 'redeemed', 'adjusted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'quoted', 'confirmed', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2. CORE TABLES
-- =============================================================================

-- 2.1 Outlets
CREATE TABLE IF NOT EXISTS public.outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  maps_embed_url TEXT,
  maps_directions_url TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  opening_time TIME NOT NULL DEFAULT '07:30',
  closing_time TIME NOT NULL DEFAULT '22:30',
  holiday_dates DATE[] NOT NULL DEFAULT '{}',
  seating_ac BOOLEAN NOT NULL DEFAULT true,
  seating_non_ac BOOLEAN NOT NULL DEFAULT true,
  seating_outdoor BOOLEAN NOT NULL DEFAULT false,
  parking_info TEXT,
  total_tables INTEGER NOT NULL DEFAULT 16 CHECK (total_tables >= 0),
  max_guests_per_slot INTEGER NOT NULL DEFAULT 48 CHECK (max_guests_per_slot > 0),
  has_bakery_counter BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Menu Categories
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Menu Items (Master Catalog — 100% Pure Veg)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  is_veg BOOLEAN NOT NULL DEFAULT true CHECK (is_veg = true),
  is_jain_available BOOLEAN NOT NULL DEFAULT false,
  is_no_onion_garlic BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_todays_special BOOLEAN NOT NULL DEFAULT false,
  spice_level spice_level NOT NULL DEFAULT 'mild',
  prep_time_mins INTEGER NOT NULL DEFAULT 15 CHECK (prep_time_mins > 0),
  calories INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_bakery_item BOOLEAN NOT NULL DEFAULT false,
  requires_preorder BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Per-Outlet Menu Pricing & Live Availability
CREATE TABLE IF NOT EXISTS public.outlet_menu_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  unavailable_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (outlet_id, menu_item_id)
);

-- 2.5 Customers (CRM & Loyalty)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  default_outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Staff (Role-based access & outlet scoping)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role staff_role NOT NULL DEFAULT 'cashier',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Shifts & Attendance
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type shift_type NOT NULL DEFAULT 'morning',
  start_time TIME NOT NULL DEFAULT '07:00',
  end_time TIME NOT NULL DEFAULT '15:00',
  attendance_status attendance_status NOT NULL DEFAULT 'scheduled',
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE (staff_id, shift_date, shift_type)
);

-- 2.8 Coupons & Offers
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type discount_type NOT NULL DEFAULT 'flat',
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10, 2),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE CASCADE,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type order_type NOT NULL DEFAULT 'pickup',
  status order_status NOT NULL DEFAULT 'received',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  coupon_code TEXT,
  loyalty_points_redeemed INTEGER NOT NULL DEFAULT 0,
  loyalty_points_earned INTEGER NOT NULL DEFAULT 0,
  delivery_address TEXT,
  order_notes TEXT,
  scheduled_for TIMESTAMPTZ,
  estimated_ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  spice_preference spice_level,
  is_jain BOOLEAN NOT NULL DEFAULT false,
  special_instructions TEXT
);

-- 2.11 Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL DEFAULT 'razorpay' CHECK (provider IN ('razorpay', 'cash', 'upi')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.12 Tables (Dining Floor Management)
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  zone table_zone NOT NULL DEFAULT 'non_ac',
  capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
  status table_status NOT NULL DEFAULT 'available',
  current_reservation_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (outlet_id, table_number)
);

-- 2.13 Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_code TEXT NOT NULL UNIQUE,
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 30),
  seating_preference TEXT NOT NULL DEFAULT 'any' CHECK (seating_preference IN ('any', 'ac', 'non_ac', 'outdoor')),
  status reservation_status NOT NULL DEFAULT 'confirmed',
  is_walk_in BOOLEAN NOT NULL DEFAULT false,
  special_requests TEXT,
  notification_channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (notification_channel IN ('whatsapp', 'sms', 'email')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tables
  DROP CONSTRAINT IF EXISTS tables_current_reservation_fk;
ALTER TABLE public.tables
  ADD CONSTRAINT tables_current_reservation_fk
  FOREIGN KEY (current_reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;

-- 2.14 Catering & Bulk Enquiries
CREATE TABLE IF NOT EXISTS public.catering_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_code TEXT NOT NULL UNIQUE,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count >= 10),
  venue_address TEXT,
  preferred_menu_notes TEXT,
  estimated_budget NUMERIC(12, 2),
  quoted_amount NUMERIC(12, 2),
  status enquiry_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.15 Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT NOT NULL DEFAULT 'Dry Groceries',
  unit TEXT NOT NULL DEFAULT 'kg',
  current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(12, 3) NOT NULL DEFAULT 5,
  cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  supplier_name TEXT,
  last_restocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (outlet_id, name)
);

-- 2.16 Stock Movements (Purchases, Usage, Wastage)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  movement_type stock_movement_type NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity <> 0),
  reason TEXT,
  recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.17 Loyalty Ledger
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  transaction_type loyalty_tx_type NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.18 Customer Reviews & Feedback
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  comment TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  posted_to_google BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.19 Website Content Editor (Banners, Specials, Announcements)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (key, outlet_id)
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_outlets_slug ON public.outlets(slug);
CREATE INDEX IF NOT EXISTS idx_outlets_active ON public.outlets(is_active);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_bestseller ON public.menu_items(is_bestseller) WHERE is_bestseller = true;

CREATE INDEX IF NOT EXISTS idx_outlet_menu_prices_outlet ON public.outlet_menu_prices(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_prices_item ON public.outlet_menu_prices(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_prices_avail ON public.outlet_menu_prices(outlet_id, is_available);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

CREATE INDEX IF NOT EXISTS idx_orders_outlet_created ON public.orders(outlet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_outlet ON public.payments(outlet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tables_outlet ON public.tables(outlet_id);
CREATE INDEX IF NOT EXISTS idx_reservations_outlet_date ON public.reservations(outlet_id, reservation_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_reservations_code ON public.reservations(reservation_code);

CREATE INDEX IF NOT EXISTS idx_inventory_outlet ON public.inventory_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON public.stock_movements(inventory_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_auth ON public.staff(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_outlet ON public.staff(outlet_id);
CREATE INDEX IF NOT EXISTS idx_shifts_outlet_date ON public.shifts(outlet_id, shift_date);

CREATE INDEX IF NOT EXISTS idx_reviews_outlet ON public.reviews(outlet_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_customer ON public.loyalty_ledger(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content(key, is_active);

-- =============================================================================
-- 4. TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- =============================================================================

-- 4.1 Automatic updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'outlets', 'menu_items', 'outlet_menu_prices', 'customers',
    'orders', 'tables', 'reservations', 'catering_enquiries',
    'inventory_items', 'site_content'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- 4.2 Prevent overbooking on table reservations (slot-level guest cap)
CREATE OR REPLACE FUNCTION public.check_reservation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  slot_cap INTEGER;
  booked_guests INTEGER;
BEGIN
  IF NEW.status IN ('cancelled', 'no_show', 'completed') THEN
    RETURN NEW;
  END IF;

  SELECT max_guests_per_slot INTO slot_cap
  FROM public.outlets
  WHERE id = NEW.outlet_id;

  IF slot_cap IS NULL THEN
    RAISE EXCEPTION 'Outlet not found';
  END IF;

  SELECT COALESCE(SUM(party_size), 0) INTO booked_guests
  FROM public.reservations
  WHERE outlet_id = NEW.outlet_id
    AND reservation_date = NEW.reservation_date
    AND time_slot = NEW.time_slot
    AND status IN ('pending', 'confirmed', 'seated')
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF booked_guests + NEW.party_size > slot_cap THEN
    RAISE EXCEPTION 'Selected time slot is full (remaining capacity: % guests)', GREATEST(slot_cap - booked_guests, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_capacity ON public.reservations;
CREATE TRIGGER trg_reservations_capacity
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.check_reservation_capacity();

-- 4.3 Sync inventory stock automatically whenever a stock_movement row is logged
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.movement_type = 'purchase' THEN
    UPDATE public.inventory_items
    SET current_stock = current_stock + NEW.quantity,
        last_restocked_at = NOW()
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.movement_type IN ('usage', 'wastage') THEN
    UPDATE public.inventory_items
    SET current_stock = GREATEST(0, current_stock - ABS(NEW.quantity))
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE public.inventory_items
    SET current_stock = GREATEST(0, current_stock + NEW.quantity)
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_stock_movement ON public.stock_movements;
CREATE TRIGGER trg_apply_stock_movement
AFTER INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- =============================================================================
-- 5. RLS HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS staff_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.staff
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_staff_outlet_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT outlet_id FROM public.staff
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE auth_user_id = auth.uid()
      AND is_active = true
      AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_outlet(target_outlet_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.auth_user_id = auth.uid()
      AND s.is_active = true
      AND (s.role = 'owner' OR s.outlet_id = target_outlet_id)
  );
$$;

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlet_menu_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 6.1 Outlets: Public reads active outlets; owners manage all; managers edit own outlet
CREATE POLICY "Public can view active outlets" ON public.outlets
  FOR SELECT USING (is_active = true OR public.can_access_outlet(id));

CREATE POLICY "Owners can insert outlets" ON public.outlets
  FOR INSERT WITH CHECK (public.is_owner());

CREATE POLICY "Owners and outlet managers can update outlets" ON public.outlets
  FOR UPDATE USING (public.can_access_outlet(id))
  WITH CHECK (public.can_access_outlet(id));

CREATE POLICY "Owners can delete outlets" ON public.outlets
  FOR DELETE USING (public.is_owner());

-- 6.2 Menu Categories & Items: Public reads active; owners & managers manage
CREATE POLICY "Public can view active categories" ON public.menu_categories
  FOR SELECT USING (is_active = true OR public.current_staff_role() IS NOT NULL);

CREATE POLICY "Staff managers can write categories" ON public.menu_categories
  FOR ALL USING (public.current_staff_role() IN ('owner', 'outlet_manager'))
  WITH CHECK (public.current_staff_role() IN ('owner', 'outlet_manager'));

CREATE POLICY "Public can view active menu items" ON public.menu_items
  FOR SELECT USING (is_active = true OR public.current_staff_role() IS NOT NULL);

CREATE POLICY "Staff managers can write menu items" ON public.menu_items
  FOR ALL USING (public.current_staff_role() IN ('owner', 'outlet_manager'))
  WITH CHECK (public.current_staff_role() IN ('owner', 'outlet_manager'));

-- 6.3 Outlet Menu Prices: Public reads; outlet staff updates own outlet availability/price
CREATE POLICY "Public can view outlet menu prices" ON public.outlet_menu_prices
  FOR SELECT USING (true);

CREATE POLICY "Outlet staff can manage own outlet prices" ON public.outlet_menu_prices
  FOR ALL USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

-- 6.4 Staff & Shifts: Owners manage all; managers manage own outlet; staff sees own record
CREATE POLICY "Staff can view own or outlet team" ON public.staff
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR public.is_owner()
    OR (public.current_staff_role() = 'outlet_manager' AND outlet_id = public.current_staff_outlet_id())
  );

CREATE POLICY "Owners can manage staff" ON public.staff
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

CREATE POLICY "Outlet staff can view outlet shifts" ON public.shifts
  FOR SELECT USING (public.can_access_outlet(outlet_id));

CREATE POLICY "Managers and owners can manage outlet shifts" ON public.shifts
  FOR ALL USING (
    public.is_owner()
    OR (public.current_staff_role() = 'outlet_manager' AND outlet_id = public.current_staff_outlet_id())
  )
  WITH CHECK (
    public.is_owner()
    OR (public.current_staff_role() = 'outlet_manager' AND outlet_id = public.current_staff_outlet_id())
  );

-- 6.5 Customers & Loyalty
CREATE POLICY "Customers read own profile or staff reads" ON public.customers
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR public.current_staff_role() IS NOT NULL
  );

CREATE POLICY "Anyone can register customer record on order" ON public.customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers update own or staff updates" ON public.customers
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR public.current_staff_role() IN ('owner', 'outlet_manager', 'cashier')
  );

CREATE POLICY "Customers view own loyalty ledger or staff views" ON public.loyalty_ledger
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.auth_user_id = auth.uid()
    )
    OR public.current_staff_role() IS NOT NULL
  );

CREATE POLICY "Staff can insert loyalty ledger" ON public.loyalty_ledger
  FOR INSERT WITH CHECK (public.current_staff_role() IN ('owner', 'outlet_manager', 'cashier'));

-- 6.6 Orders, Order Items, Payments
CREATE POLICY "Staff can view own outlet orders; public can track by order query" ON public.orders
  FOR SELECT USING (
    public.can_access_outlet(outlet_id)
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can place orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Outlet staff can update outlet orders" ON public.orders
  FOR UPDATE USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

CREATE POLICY "View order items for accessible orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (
          public.can_access_outlet(o.outlet_id)
          OR EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = o.customer_id AND c.auth_user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Customers can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Outlet staff can view and record payments" ON public.payments
  FOR SELECT USING (public.can_access_outlet(outlet_id));

CREATE POLICY "Customers or staff can create payment records" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Outlet staff can update payments" ON public.payments
  FOR UPDATE USING (public.can_access_outlet(outlet_id));

-- 6.7 Tables & Reservations
CREATE POLICY "Public can view active tables for availability" ON public.tables
  FOR SELECT USING (is_active = true OR public.can_access_outlet(outlet_id));

CREATE POLICY "Outlet staff can manage outlet tables" ON public.tables
  FOR ALL USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

CREATE POLICY "Outlet staff can view outlet reservations" ON public.reservations
  FOR SELECT USING (
    public.can_access_outlet(outlet_id)
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create reservation" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Outlet staff can update outlet reservations" ON public.reservations
  FOR UPDATE USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

-- 6.8 Catering Enquiries
CREATE POLICY "Staff can view catering enquiries for own outlet or unassigned" ON public.catering_enquiries
  FOR SELECT USING (
    public.is_owner()
    OR outlet_id IS NULL AND public.current_staff_role() IS NOT NULL
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id))
  );

CREATE POLICY "Anyone can submit catering enquiry" ON public.catering_enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update catering enquiries" ON public.catering_enquiries
  FOR UPDATE USING (
    public.is_owner()
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id))
  );

-- 6.9 Inventory & Stock Movements (Strictly outlet-scoped)
CREATE POLICY "Outlet staff manages own inventory" ON public.inventory_items
  FOR ALL USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

CREATE POLICY "Outlet staff manages own stock movements" ON public.stock_movements
  FOR ALL USING (public.can_access_outlet(outlet_id))
  WITH CHECK (public.can_access_outlet(outlet_id));

-- 6.10 Coupons
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true OR public.current_staff_role() IS NOT NULL);

CREATE POLICY "Owners and outlet managers manage coupons" ON public.coupons
  FOR ALL USING (
    public.is_owner()
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id) AND public.current_staff_role() = 'outlet_manager')
  )
  WITH CHECK (
    public.is_owner()
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id) AND public.current_staff_role() = 'outlet_manager')
  );

-- 6.11 Reviews
CREATE POLICY "Public reads published reviews" ON public.reviews
  FOR SELECT USING (status = 'published' OR public.can_access_outlet(outlet_id));

CREATE POLICY "Anyone can submit review" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Outlet staff moderates own outlet reviews" ON public.reviews
  FOR UPDATE USING (public.can_access_outlet(outlet_id));

-- 6.12 Site Content
CREATE POLICY "Public reads active site content" ON public.site_content
  FOR SELECT USING (is_active = true OR public.current_staff_role() IS NOT NULL);

CREATE POLICY "Owners and managers edit site content" ON public.site_content
  FOR ALL USING (
    public.is_owner()
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id) AND public.current_staff_role() = 'outlet_manager')
  )
  WITH CHECK (
    public.is_owner()
    OR (outlet_id IS NOT NULL AND public.can_access_outlet(outlet_id) AND public.current_staff_role() = 'outlet_manager')
  );

-- =============================================================================
-- 7. PUBLIC RPC HELPERS (Safe slot availability & order tracking lookup)
-- =============================================================================

-- Returns booked guest count per time slot for an outlet & date without exposing PII
CREATE OR REPLACE FUNCTION public.get_slot_availability(
  p_outlet_id UUID,
  p_date DATE
)
RETURNS TABLE (
  time_slot TEXT,
  booked_guests BIGINT,
  max_guests INTEGER,
  remaining_guests INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH outlet_cap AS (
    SELECT max_guests_per_slot FROM public.outlets WHERE id = p_outlet_id
  ),
  slots AS (
    SELECT unnest(ARRAY[
      '08:00', '09:00', '10:00', '12:30', '13:30',
      '14:30', '19:00', '20:00', '21:00'
    ]) AS slot
  )
  SELECT
    s.slot AS time_slot,
    COALESCE(SUM(r.party_size), 0) AS booked_guests,
    oc.max_guests_per_slot AS max_guests,
    GREATEST(oc.max_guests_per_slot - COALESCE(SUM(r.party_size), 0)::INTEGER, 0) AS remaining_guests
  FROM slots s
  CROSS JOIN outlet_cap oc
  LEFT JOIN public.reservations r
    ON r.outlet_id = p_outlet_id
   AND r.reservation_date = p_date
   AND r.time_slot = s.slot
   AND r.status IN ('pending', 'confirmed', 'seated')
  GROUP BY s.slot, oc.max_guests_per_slot
  ORDER BY s.slot;
$$;

-- Safe public order tracker lookup by order_number + last 4 digits of phone (or exact phone)
CREATE OR REPLACE FUNCTION public.track_order_public(
  p_order_number TEXT,
  p_phone TEXT
)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  outlet_id UUID,
  outlet_name TEXT,
  order_type order_type,
  status order_status,
  payment_status payment_status,
  total_amount NUMERIC,
  estimated_ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.id,
    o.order_number,
    o.outlet_id,
    ot.name AS outlet_name,
    o.order_type,
    o.status,
    o.payment_status,
    o.total_amount,
    o.estimated_ready_at,
    o.created_at,
    o.updated_at
  FROM public.orders o
  JOIN public.outlets ot ON ot.id = o.outlet_id
  WHERE UPPER(o.order_number) = UPPER(TRIM(p_order_number))
    AND RIGHT(REGEXP_REPLACE(o.customer_phone, '\D', '', 'g'), 4)
      = RIGHT(REGEXP_REPLACE(p_phone, '\D', '', 'g'), 4)
  LIMIT 1;
$$;

-- =============================================================================
-- 8. REALTIME PUBLICATION
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.outlet_menu_prices;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

