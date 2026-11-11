-- =============================================================================
-- Krishna Kuteera — Seed Data
-- 3 Bengaluru Outlets, 7 Categories, 32 Pure-Veg Dishes, Per-Outlet Prices,
-- Tables, Coupons, Reviews, Site Content & Sample Inventory
-- =============================================================================

-- Fixed UUIDs so seed script is idempotent and easy to reference
INSERT INTO public.outlets (
  id, name, slug, address, locality, city, pincode, phone, email,
  maps_embed_url, maps_directions_url, latitude, longitude,
  opening_time, closing_time, seating_ac, seating_non_ac, seating_outdoor,
  parking_info, total_tables, max_guests_per_slot, has_bakery_counter, is_active, image_url
) VALUES
(
  '11111111-1111-4111-8111-111111111101',
  'Krishna Kuteera — Hulimavu (Bannerghatta Rd)',
  'hulimavu-bannerghatta-road',
  'No. 42, Bannerghatta Main Road, Opp. Royal Meenakshi Mall, Hulimavu, Bengaluru',
  'Hulimavu / Bannerghatta Road',
  'Bengaluru',
  '560076',
  '+91 80 4123 7891',
  'hulimavu@krishnakuteera.in',
  'https://www.google.com/maps?q=Hulimavu+Bannerghatta+Road+Bengaluru&output=embed',
  'https://www.google.com/maps/dir/?api=1&destination=12.8768,77.5968',
  12.876800, 77.596800,
  '07:30', '22:30',
  true, true, true,
  'Dedicated 2-wheeler & 15-car basement parking available',
  22, 64, true, true,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'
),
(
  '11111111-1111-4111-8111-111111111102',
  'Krishna Kuteera — JP Nagar 7th Phase',
  'jp-nagar-7th-phase',
  '18th Main Road, Near Brigade Millennium, JP Nagar 7th Phase, Bengaluru',
  'JP Nagar 7th Phase',
  'Bengaluru',
  '560078',
  '+91 80 4123 7892',
  'jpnagar@krishnakuteera.in',
  'https://www.google.com/maps?q=JP+Nagar+7th+Phase+Bengaluru&output=embed',
  'https://www.google.com/maps/dir/?api=1&destination=12.8914,77.5855',
  12.891400, 77.585500,
  '07:00', '22:30',
  true, true, false,
  'Free valet car parking & shaded 2-wheeler bay',
  18, 52, false, true,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80'
),
(
  '11111111-1111-4111-8111-111111111103',
  'Krishna Kuteera — Jayanagar 4th Block',
  'jayanagar-4th-block',
  '11th Main Road, Near Cool Joint Circle, Jayanagar 4th Block, Bengaluru',
  'Jayanagar 4th Block',
  'Bengaluru',
  '560011',
  '+91 80 4123 7893',
  'jayanagar@krishnakuteera.in',
  'https://www.google.com/maps?q=Jayanagar+4th+Block+Bengaluru&output=embed',
  'https://www.google.com/maps/dir/?api=1&destination=12.9298,77.5838',
  12.929800, 77.583800,
  '07:30', '22:00',
  true, true, false,
  'Street parking & BDA complex parking 100m away',
  16, 44, true, true,
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- MENU CATEGORIES (7 Categories)
-- =============================================================================
INSERT INTO public.menu_categories (id, name, slug, description, display_order) VALUES
('22222222-2222-4222-8222-222222222201', 'Breakfast', 'breakfast', 'Hot off the tawa & steamer — dosas, idlis, vadas & morning bath specials.', 1),
('22222222-2222-4222-8222-222222222202', 'Meals', 'meals', 'Wholesome South & North Karnataka thalis and rice varieties.', 2),
('22222222-2222-4222-8222-222222222203', 'Tiffins', 'tiffins', 'Evening tiffin favourites — Mangalore buns, Maddur vada & mini combos.', 3),
('22222222-2222-4222-8222-222222222204', 'Chaats', 'chaats', 'Bengaluru street-style masala puri, dahi puri & crispy savouries.', 4),
('22222222-2222-4222-8222-222222222205', 'Beverages', 'beverages', 'Brass-davara filter coffee, kashaya, badam milk & fresh juices.', 5),
('22222222-2222-4222-8222-222222222206', 'Sweets', 'sweets', 'Pure Nandini ghee Mysore pak, obbattu, kesari bath & festive sweets.', 6),
('22222222-2222-4222-8222-222222222207', 'Bakery', 'bakery', 'KK Bakers — 100% eggless cakes, puffs, masala buns & tea-time bakes.', 7)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- MENU ITEMS (32 Pure-Veg South Indian Dishes)
-- =============================================================================
INSERT INTO public.menu_items (
  id, category_id, name, slug, description, image_url, base_price,
  is_jain_available, is_no_onion_garlic, is_bestseller, is_todays_special,
  spice_level, prep_time_mins, is_bakery_item, requires_preorder, display_order
) VALUES
-- BREAKFAST (9 items)
('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201',
 'Benne Masala Dosa', 'benne-masala-dosa',
 'Golden crispy dosa roasted with generous white butter, stuffed with spiced potato palya, served with coconut chutney & sambar.',
 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
 95, true, false, true, true, 'medium', 12, false, false, 1),

('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201',
 'Mysore Masala Dosa', 'mysore-masala-dosa',
 'Crisp fermented crepe lined with fiery red garlic chutney, potato masala, and a drizzle of pure ghee.',
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
 105, false, false, true, false, 'spicy', 12, false, false, 2),

('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222201',
 'Ghee Roast Plain Dosa', 'ghee-roast-plain-dosa',
 'Paper-thin conical roast dosa glazed with fragrant Nandini ghee. Served with three chutneys & sambar.',
 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
 90, true, true, false, false, 'mild', 10, false, false, 3),

('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222201',
 'Set Dosa (3 Pcs)', 'set-dosa',
 'Soft, spongy puffed dosas served in a set of three with vegetable saagu and fresh coconut chutney.',
 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
 80, true, true, true, false, 'mild', 10, false, false, 4),

('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222201',
 'Idli Vada Combo (2 Idli + 1 Vada)', 'idli-vada-combo',
 'Pillow-soft steamed mallige idlis paired with a crunchy uddin vada dipped in hot tiffin sambar.',
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
 70, true, true, true, false, 'mild', 8, false, false, 5),

('33333333-3333-4333-8333-333333333306', '22222222-2222-4222-8222-222222222201',
 'Rava Idli', 'rava-idli',
 'Traditional MTR-style steamed semolina idli tempered with mustard, cashew, curry leaves & coriander. Served with potato saagu.',
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
 75, true, true, true, true, 'mild', 10, false, false, 6),

('33333333-3333-4333-8333-333333333307', '22222222-2222-4222-8222-222222222201',
 'Thatte Idli with Pudi & Ghee', 'thatte-idli-pudi',
 'Large plate-sized Bidadi-style steamed idli topped with house-roasted chutney pudi and melted ghee.',
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
 65, true, true, false, false, 'medium', 8, false, false, 7),

('33333333-3333-4333-8333-333333333308', '22222222-2222-4222-8222-222222222201',
 'Chow Chow Bath (Khara & Kesari)', 'chow-chow-bath',
 'Classic Bengaluru morning duo — savoury spiced vegetable rava khara bath alongside rich saffron-pineapple kesari bath.',
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
 85, true, false, true, false, 'medium', 8, false, false, 8),

('33333333-3333-4333-8333-333333333309', '22222222-2222-4222-8222-222222222201',
 'Ven Pongal with Ghee & Cashews', 'ven-pongal',
 'Comforting slow-cooked rice and moong dal tempered with crushed black pepper, cumin, curry leaves & roasted cashews.',
 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
 80, true, true, false, false, 'mild', 10, false, false, 9),

-- MEALS (5 items)
('33333333-3333-4333-8333-333333333310', '22222222-2222-4222-8222-222222222202',
 'Krishna Kuteera Banana Leaf Meal', 'banana-leaf-meal',
 'Traditional unlimited-feel festive lunch: poori, 2 palyas, sambar, rasam, curd, papad, pickle, steamed rice, kosambari & sweet of the day.',
 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
 175, true, true, true, true, 'mild', 15, false, false, 10),

('33333333-3333-4333-8333-333333333311', '22222222-2222-4222-8222-222222222202',
 'Bisi Bele Bath with Boondi', 'bisi-bele-bath',
 'Karnataka classic rice-lentil medley simmered with freshly ground masala, tamarind & veggies, topped with khara boondi and ghee.',
 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
 95, true, false, true, false, 'medium', 12, false, false, 11),

('33333333-3333-4333-8333-333333333312', '22222222-2222-4222-8222-222222222202',
 'North Karnataka Jolada Rotti Meal', 'jolada-rotti-meal',
 'Two hand-patted jowar rottis served with enne-gai (stuffed brinjal), zunka, shenga chutney, curd & anna-saaru.',
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
 165, false, false, false, false, 'spicy', 18, false, false, 12),

('33333333-3333-4333-8333-333333333313', '22222222-2222-4222-8222-222222222202',
 'Curd Rice with Pomegranate & Tempering', 'curd-rice',
 'Cooling creamy curd rice tempered with mustard, ginger, green chilli, curry leaves and garnished with fresh pomegranate.',
 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
 75, true, true, false, false, 'mild', 8, false, false, 13),

('33333333-3333-4333-8333-333333333314', '22222222-2222-4222-8222-222222222202',
 'Ragi Mudde & Soppu Saaru Meal', 'ragi-mudde-meal',
 'Wholesome finger-millet balls paired with aromatic greens saaru, palya, steamed rice & buttermilk.',
 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
 140, false, false, false, false, 'medium', 15, false, false, 14),

-- TIFFINS (5 items)
('33333333-3333-4333-8333-333333333315', '22222222-2222-4222-8222-222222222203',
 'KK Mini Tiffin Combo', 'kk-mini-tiffin-combo',
 'Sampler platter with 1 idli, 1 vada, mini masala dosa, kesari bath, chutney & sambar — ideal for indecisive cravings.',
 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
 145, true, false, true, true, 'mild', 15, false, false, 15),

('33333333-3333-4333-8333-333333333316', '22222222-2222-4222-8222-222222222203',
 'Mangalore Buns (2 Pcs)', 'mangalore-buns',
 'Fluffy golden deep-fried sweet banana puris from coastal Karnataka, served with spicy coconut chutney & veg kurma.',
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
 70, true, true, true, false, 'mild', 10, false, false, 16),

('33333333-3333-4333-8333-333333333317', '22222222-2222-4222-8222-222222222203',
 'Maddur Vada (2 Pcs)', 'maddur-vada',
 'Crispy spiced onion-semolina-rice flour discs fried golden — best paired with hot evening filter coffee.',
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
 60, false, false, false, false, 'medium', 8, false, false, 17),

('33333333-3333-4333-8333-333333333318', '22222222-2222-4222-8222-222222222203',
 'Neer Dosa with Veg Kurma', 'neer-dosa-kurma',
 'Delicate lacy rice crepes served with mildly spiced coconut-cashew vegetable kurma and jaggery-coconut dip.',
 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
 95, true, true, false, false, 'mild', 12, false, false, 18),

('33333333-3333-4333-8333-333333333319', '22222222-2222-4222-8222-222222222203',
 'Akki Rotti with Chutney', 'akki-rotti',
 'Traditional rice flour flatbread kneaded with dill leaves, grated carrot, green chillies & cumin, roasted crisp on iron tawa.',
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
 85, true, false, false, false, 'medium', 12, false, false, 19),

-- CHAATS (3 items)
('33333333-3333-4333-8333-333333333320', '22222222-2222-4222-8222-222222222204',
 'Bengaluru Masala Puri', 'bengaluru-masala-puri',
 'Crushed crispy puris drenched in hot spiced green-peas gravy, topped with sweet tamarind chutney, onions, coriander & sev.',
 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
 65, true, false, true, false, 'spicy', 8, false, false, 20),

('33333333-3333-4333-8333-333333333321', '22222222-2222-4222-8222-222222222204',
 'Dahi Papdi Chaat', 'dahi-papdi-chaat',
 'Crunchy wheat papdis layered with chilled sweetened curd, mint & dates chutneys, boondi and roasted cumin.',
 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
 75, true, true, false, false, 'mild', 8, false, false, 21),

('33333333-3333-4333-8333-333333333322', '22222222-2222-4222-8222-222222222204',
 'Bhel Puri Special', 'bhel-puri',
 'Light puffed rice tossed with crunchy sev, raw mango, roasted peanuts, and tangy house chutneys.',
 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
 60, true, false, false, false, 'medium', 6, false, false, 22),

-- BEVERAGES (4 items)
('33333333-3333-4333-8333-333333333323', '22222222-2222-4222-8222-222222222205',
 'Madras Filter Coffee (Brass Davara)', 'filter-coffee',
 'Freshly brewed Chikmagalur 80:20 coffee decoction frothed with rich farm milk in traditional brass davara-tumbler.',
 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
 35, true, true, true, true, 'mild', 5, false, false, 23),

('33333333-3333-4333-8333-333333333324', '22222222-2222-4222-8222-222222222205',
 'Saffron Badam Milk (Hot / Cold)', 'badam-milk',
 'Slow-simmered almond milk infused with Kashmiri saffron, cardamom & slivered pistachios.',
 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
 65, true, true, false, false, 'mild', 5, false, false, 24),

('33333333-3333-4333-8333-333333333325', '22222222-2222-4222-8222-222222222205',
 'Traditional Herbal Kashaya', 'herbal-kashaya',
 'Soothing jaggery-sweetened spiced decoction of roasted coriander, cumin, black pepper & tulsi.',
 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
 40, true, true, false, false, 'mild', 5, false, false, 25),

('33333333-3333-4333-8333-333333333326', '22222222-2222-4222-8222-222222222205',
 'Spiced Buttermilk (Neer Majjige)', 'spiced-buttermilk',
 'Chilled churned curd with crushed ginger, curry leaves, asafoetida & green chilli.',
 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
 35, true, true, false, false, 'mild', 5, false, false, 26),

-- SWEETS (3 items)
('33333333-3333-4333-8333-333333333327', '22222222-2222-4222-8222-222222222206',
 'Pure Ghee Mysore Pak (250g Box)', 'ghee-mysore-pak',
 'Melt-in-mouth roasted gram flour fudge crafted with pure Nandini ghee. Perfect for gifting & festivals.',
 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
 210, true, true, true, false, 'mild', 5, false, false, 27),

('33333333-3333-4333-8333-333333333328', '22222222-2222-4222-8222-222222222206',
 'Bele Obbattu / Holige (2 Pcs)', 'bele-obbattu',
 'Paper-thin festive flatbread stuffed with sweet chana dal-jaggery-cardamom puran, served warm with ghee.',
 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
 90, true, true, false, true, 'mild', 10, false, false, 28),

('33333333-3333-4333-8333-333333333329', '22222222-2222-4222-8222-222222222206',
 'Pineapple Kesari Bath', 'pineapple-kesari-bath',
 'Golden semolina pudding simmered with pineapple chunks, saffron, ghee & roasted cashews.',
 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
 55, true, true, false, false, 'mild', 6, false, false, 29),

-- BAKERY / KK BAKERS (3 items)
('33333333-3333-4333-8333-333333333330', '22222222-2222-4222-8222-222222222207',
 'KK Bakers Bengaluru Honey Cake (2 Pcs)', 'kk-honey-cake',
 'Nostalgic Bengaluru Iyengar-bakery style soft eggless sponge soaked in warm honey glaze and topped with jam & coconut.',
 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
 70, true, true, true, false, 'mild', 5, true, false, 30),

('33333333-3333-4333-8333-333333333331', '22222222-2222-4222-8222-222222222207',
 'Eggless Veg Masala Puff (2 Pcs)', 'kk-veg-puff',
 'Flaky multi-layered puff pastry stuffed with spiced mixed vegetables and herbs, baked fresh hourly.',
 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
 65, false, false, false, false, 'medium', 5, true, false, 31),

('33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222207',
 'Eggless Celebration Pineapple Cake (1 kg)', 'kk-celebration-cake',
 'Fresh cream eggless celebration cake layered with pineapple compote. Custom message included — pre-order 24 hrs ahead.',
 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
 850, true, true, false, false, 'mild', 30, true, true, 32)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PER-OUTLET MENU PRICING & AVAILABILITY
-- Demonstrates different prices & item availability across the 3 outlets
-- =============================================================================
INSERT INTO public.outlet_menu_prices (outlet_id, menu_item_id, price, is_available, unavailable_reason)
SELECT
  o.id,
  m.id,
  CASE
    -- JP Nagar slightly different pricing (+5 on dosas/meals)
    WHEN o.id = '11111111-1111-4111-8111-111111111102' AND m.base_price >= 80 THEN m.base_price + 5
    -- Jayanagar special heritage pricing on Filter Coffee
    WHEN o.id = '11111111-1111-4111-8111-111111111103' AND m.slug = 'filter-coffee' THEN 30
    ELSE m.base_price
  END AS price,
  CASE
    -- JP Nagar does not have a KK Bakers counter
    WHEN o.id = '11111111-1111-4111-8111-111111111102' AND m.is_bakery_item = true THEN false
    ELSE true
  END AS is_available,
  CASE
    WHEN o.id = '11111111-1111-4111-8111-111111111102' AND m.is_bakery_item = true THEN 'Available only at Hulimavu & Jayanagar KK Bakers'
    ELSE NULL
  END AS unavailable_reason
FROM public.outlets o
CROSS JOIN public.menu_items m
ON CONFLICT (outlet_id, menu_item_id) DO NOTHING;

-- =============================================================================
-- SAMPLE TABLES PER OUTLET
-- =============================================================================
INSERT INTO public.tables (outlet_id, table_number, zone, capacity, status) VALUES
('11111111-1111-4111-8111-111111111101', 'T1', 'non_ac', 4, 'available'),
('11111111-1111-4111-8111-111111111101', 'T2', 'non_ac', 4, 'available'),
('11111111-1111-4111-8111-111111111101', 'A1', 'ac', 4, 'available'),
('11111111-1111-4111-8111-111111111101', 'A2', 'ac', 6, 'available'),
('11111111-1111-4111-8111-111111111101', 'G1', 'outdoor', 4, 'available'),
('11111111-1111-4111-8111-111111111102', 'T1', 'non_ac', 4, 'available'),
('11111111-1111-4111-8111-111111111102', 'A1', 'ac', 4, 'available'),
('11111111-1111-4111-8111-111111111102', 'A2', 'ac', 6, 'available'),
('11111111-1111-4111-8111-111111111103', 'T1', 'non_ac', 2, 'available'),
('11111111-1111-4111-8111-111111111103', 'T2', 'non_ac', 4, 'available'),
('11111111-1111-4111-8111-111111111103', 'A1', 'ac', 4, 'available')
ON CONFLICT (outlet_id, table_number) DO NOTHING;

-- =============================================================================
-- COUPONS & OFFERS
-- =============================================================================
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active) VALUES
('KKWELCOME', '₹40 off on your first online order above ₹249', 'flat', 40, 249, 40, true),
('MORNING15', '15% off on morning breakfast pickups before 10:30 AM (up to ₹60)', 'percent', 15, 199, 60, true),
('FAMILY100', '₹100 off on family meal orders above ₹699', 'flat', 100, 699, 100, true)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- SAMPLE REVIEWS
-- =============================================================================
INSERT INTO public.reviews (outlet_id, customer_name, rating, food_rating, service_rating, comment, is_featured, status) VALUES
('11111111-1111-4111-8111-111111111101', 'Ananya Rao', 5, 5, 5, 'Our Sunday morning ritual on Bannerghatta Road! The Benne Masala Dosa is crisp outside, pillowy inside, and the brass-davara filter coffee is unbeatable.', true, 'published'),
('11111111-1111-4111-8111-111111111102', 'Karthik Hegde', 5, 5, 4, 'Super clean kitchen, quick service even during the 8:30 AM rush, and the Rava Idli with saagu tastes just like home.', true, 'published'),
('11111111-1111-4111-8111-111111111103', 'Meenakshi Sundaram', 5, 5, 5, 'Ordered Banana Leaf Meals and Bele Obbattu for my parents'' anniversary lunch. Authentic pure-veg flavours and warm staff.', true, 'published')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WEBSITE CONTENT (CMS DEFAULTS)
-- =============================================================================
INSERT INTO public.site_content (outlet_id, key, title, subtitle, body, cta_label, cta_link, is_active, display_order) VALUES
(NULL, 'announcement_bar',
 'Fresh Morning Steam from 7:30 AM • 100% Pure Vegetarian • Zero Artificial Colours',
 'Use code KKWELCOME for ₹40 off orders above ₹249',
 NULL, 'Order Now', '/menu', true, 1),
(NULL, 'hero_banner',
 'Crisp Benne Dosas, Steaming Idlis & Brass-Davara Filter Coffee',
 'Your Neighbourhood Pure-Veg South Indian Tiffin & Family Dining House in Bengaluru',
 'Hand-fermented batter, cold-pressed oils, Nandini ghee, and warm hospitality across Hulimavu, JP Nagar & Jayanagar.',
 'Order Pickup or Delivery', '/menu', true, 2),
(NULL, 'todays_special_note',
 'Festival & Seasonal Special: Fresh Bele Obbattu & Pineapple Kesari Bath',
 'Available at all 3 Bengaluru outlets until sold out.',
 NULL, 'Explore Specials', '/menu?filter=specials', true, 3)
ON CONFLICT (key, outlet_id) DO NOTHING;

-- =============================================================================
-- SAMPLE INVENTORY (Hulimavu Outlet)
-- =============================================================================
INSERT INTO public.inventory_items (outlet_id, name, sku, category, unit, current_stock, reorder_level, cost_per_unit, supplier_name) VALUES
('11111111-1111-4111-8111-111111111101', 'Idli/Dosa Fermented Batter', 'INV-BAT-01', 'Fresh Prep', 'kg', 42.0, 20.0, 48.00, 'In-House Central Kitchen'),
('11111111-1111-4111-8111-111111111101', 'Nandini Pure Ghee', 'INV-GHE-02', 'Dairy', 'litre', 14.0, 10.0, 620.00, 'KMF Nandini Dairy'),
('11111111-1111-4111-8111-111111111101', 'Chikmagalur 80:20 Coffee Powder', 'INV-COF-03', 'Beverages', 'kg', 3.5, 5.0, 540.00, 'Malnad Roasters'),
('11111111-1111-4111-8111-111111111101', 'Grated Fresh Coconut', 'INV-COC-04', 'Produce', 'kg', 8.0, 12.0, 95.00, 'KR Market Fresh'),
('11111111-1111-4111-8111-111111111101', 'Toor Dal (Unpolished)', 'INV-DAL-05', 'Dry Groceries', 'kg', 35.0, 15.0, 145.00, 'Sri Lakshmi Traders'),
('11111111-1111-4111-8111-111111111102', 'Idli/Dosa Fermented Batter', 'INV-BAT-01', 'Fresh Prep', 'kg', 28.0, 20.0, 48.00, 'In-House Central Kitchen'),
('11111111-1111-4111-8111-111111111103', 'Idli/Dosa Fermented Batter', 'INV-BAT-01', 'Fresh Prep', 'kg', 25.0, 15.0, 48.00, 'In-House Central Kitchen')
ON CONFLICT (outlet_id, name) DO NOTHING;

