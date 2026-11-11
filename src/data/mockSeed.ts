import type {
  MenuCategory,
  MenuItem,
  Outlet,
  OutletMenuPrice,
  Review,
  SiteContent,
} from '@/types/database';

export const MOCK_OUTLETS: Outlet[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Krishna Kuteera — Hulimavu (Bannerghatta Rd)',
    slug: 'hulimavu-bannerghatta-road',
    address: 'No. 42, Bannerghatta Main Road, Opp. Royal Meenakshi Mall, Hulimavu, Bengaluru',
    locality: 'Hulimavu / Bannerghatta Road',
    city: 'Bengaluru',
    pincode: '560076',
    phone: '+91 80 4123 7891',
    email: 'hulimavu@krishnakuteera.in',
    maps_embed_url:
      'https://www.google.com/maps?q=Hulimavu+Bannerghatta+Road+Bengaluru&output=embed',
    maps_directions_url: 'https://www.google.com/maps/dir/?api=1&destination=12.8768,77.5968',
    latitude: 12.8768,
    longitude: 77.5968,
    opening_time: '07:30',
    closing_time: '22:30',
    holiday_dates: [],
    seating_ac: true,
    seating_non_ac: true,
    seating_outdoor: true,
    parking_info: 'Dedicated 2-wheeler & 15-car basement parking available',
    total_tables: 22,
    max_guests_per_slot: 64,
    has_bakery_counter: true,
    is_active: true,
    /* TODO: Replace with real Hulimavu storefront photo */
    image_url:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    name: 'Krishna Kuteera — JP Nagar 7th Phase',
    slug: 'jp-nagar-7th-phase',
    address: '18th Main Road, Near Brigade Millennium, JP Nagar 7th Phase, Bengaluru',
    locality: 'JP Nagar 7th Phase',
    city: 'Bengaluru',
    pincode: '560078',
    phone: '+91 80 4123 7892',
    email: 'jpnagar@krishnakuteera.in',
    maps_embed_url:
      'https://www.google.com/maps?q=JP+Nagar+7th+Phase+Bengaluru&output=embed',
    maps_directions_url: 'https://www.google.com/maps/dir/?api=1&destination=12.8914,77.5855',
    latitude: 12.8914,
    longitude: 77.5855,
    opening_time: '07:00',
    closing_time: '22:30',
    holiday_dates: [],
    seating_ac: true,
    seating_non_ac: true,
    seating_outdoor: false,
    parking_info: 'Free valet car parking & shaded 2-wheeler bay',
    total_tables: 18,
    max_guests_per_slot: 52,
    has_bakery_counter: false,
    is_active: true,
    /* TODO: Replace with real JP Nagar outlet photo */
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    name: 'Krishna Kuteera — Jayanagar 4th Block',
    slug: 'jayanagar-4th-block',
    address: '11th Main Road, Near Cool Joint Circle, Jayanagar 4th Block, Bengaluru',
    locality: 'Jayanagar 4th Block',
    city: 'Bengaluru',
    pincode: '560011',
    phone: '+91 80 4123 7893',
    email: 'jayanagar@krishnakuteera.in',
    maps_embed_url:
      'https://www.google.com/maps?q=Jayanagar+4th+Block+Bengaluru&output=embed',
    maps_directions_url: 'https://www.google.com/maps/dir/?api=1&destination=12.9298,77.5838',
    latitude: 12.9298,
    longitude: 77.5838,
    opening_time: '07:30',
    closing_time: '22:00',
    holiday_dates: [],
    seating_ac: true,
    seating_non_ac: true,
    seating_outdoor: false,
    parking_info: 'Street parking & BDA complex parking 100m away',
    total_tables: 16,
    max_guests_per_slot: 44,
    has_bakery_counter: true,
    is_active: true,
    /* TODO: Replace with real Jayanagar outlet photo */
    image_url:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    name: 'Breakfast',
    slug: 'breakfast',
    description: 'Hot off the tawa & steamer — dosas, idlis, vadas & morning bath specials.',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    name: 'Meals',
    slug: 'meals',
    description: 'Wholesome South & North Karnataka thalis and rice varieties.',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    name: 'Tiffins',
    slug: 'tiffins',
    description: 'Evening tiffin favourites — Mangalore buns, Maddur vada & mini combos.',
    display_order: 3,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222204',
    name: 'Chaats',
    slug: 'chaats',
    description: 'Bengaluru street-style masala puri, dahi puri & crispy savouries.',
    display_order: 4,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222205',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Brass-davara filter coffee, kashaya, badam milk & fresh juices.',
    display_order: 5,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222206',
    name: 'Sweets',
    slug: 'sweets',
    description: 'Pure Nandini ghee Mysore pak, obbattu, kesari bath & festive sweets.',
    display_order: 6,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222207',
    name: 'Bakery',
    slug: 'bakery',
    description: 'KK Bakers — 100% eggless cakes, puffs, masala buns & tea-time bakes.',
    display_order: 7,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const mkItem = (
  idSuffix: string,
  catSuffix: string,
  name: string,
  slug: string,
  description: string,
  image_url: string,
  base_price: number,
  opts: Partial<MenuItem> = {},
  display_order = 1
): MenuItem => ({
  id: `33333333-3333-4333-8333-3333333333${idSuffix}`,
  category_id: `22222222-2222-4222-8222-2222222222${catSuffix}`,
  name,
  slug,
  description,
  image_url,
  base_price,
  is_veg: true,
  is_jain_available: opts.is_jain_available ?? false,
  is_no_onion_garlic: opts.is_no_onion_garlic ?? false,
  is_bestseller: opts.is_bestseller ?? false,
  is_todays_special: opts.is_todays_special ?? false,
  spice_level: opts.spice_level ?? 'mild',
  prep_time_mins: opts.prep_time_mins ?? 10,
  calories: opts.calories ?? null,
  tags: opts.tags ?? [],
  is_bakery_item: opts.is_bakery_item ?? false,
  requires_preorder: opts.requires_preorder ?? false,
  is_active: true,
  display_order,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Breakfast
  mkItem(
    '01',
    '01',
    'Benne Masala Dosa',
    'benne-masala-dosa',
    'Golden crispy dosa roasted with generous white butter, stuffed with spiced potato palya, served with coconut chutney & sambar.',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    95,
    { is_jain_available: true, is_bestseller: true, is_todays_special: true, spice_level: 'medium', prep_time_mins: 12 },
    1
  ),
  mkItem(
    '02',
    '01',
    'Mysore Masala Dosa',
    'mysore-masala-dosa',
    'Crisp fermented crepe lined with fiery red garlic chutney, potato masala, and a drizzle of pure ghee.',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    105,
    { is_bestseller: true, spice_level: 'spicy', prep_time_mins: 12 },
    2
  ),
  mkItem(
    '03',
    '01',
    'Ghee Roast Plain Dosa',
    'ghee-roast-plain-dosa',
    'Paper-thin conical roast dosa glazed with fragrant Nandini ghee. Served with three chutneys & sambar.',
    'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    90,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 10 },
    3
  ),
  mkItem(
    '04',
    '01',
    'Set Dosa (3 Pcs)',
    'set-dosa',
    'Soft, spongy puffed dosas served in a set of three with vegetable saagu and fresh coconut chutney.',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    80,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, spice_level: 'mild', prep_time_mins: 10 },
    4
  ),
  mkItem(
    '05',
    '01',
    'Idli Vada Combo (2 Idli + 1 Vada)',
    'idli-vada-combo',
    'Pillow-soft steamed mallige idlis paired with a crunchy uddin vada dipped in hot tiffin sambar.',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    70,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, spice_level: 'mild', prep_time_mins: 8 },
    5
  ),
  mkItem(
    '06',
    '01',
    'Rava Idli',
    'rava-idli',
    'Traditional steamed semolina idli tempered with mustard, cashew, curry leaves & coriander. Served with potato saagu.',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    75,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, is_todays_special: true, spice_level: 'mild', prep_time_mins: 10 },
    6
  ),
  mkItem(
    '07',
    '01',
    'Thatte Idli with Pudi & Ghee',
    'thatte-idli-pudi',
    'Large plate-sized Bidadi-style steamed idli topped with house-roasted chutney pudi and melted ghee.',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    65,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'medium', prep_time_mins: 8 },
    7
  ),
  mkItem(
    '08',
    '01',
    'Chow Chow Bath (Khara & Kesari)',
    'chow-chow-bath',
    'Classic Bengaluru morning duo — savoury spiced vegetable rava khara bath alongside rich saffron-pineapple kesari bath.',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    85,
    { is_jain_available: true, is_bestseller: true, spice_level: 'medium', prep_time_mins: 8 },
    8
  ),
  mkItem(
    '09',
    '01',
    'Ven Pongal with Ghee & Cashews',
    'ven-pongal',
    'Comforting slow-cooked rice and moong dal tempered with crushed black pepper, cumin, curry leaves & roasted cashews.',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    80,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 10 },
    9
  ),

  // Meals
  mkItem(
    '10',
    '02',
    'Krishna Kuteera Banana Leaf Meal',
    'banana-leaf-meal',
    'Traditional festive lunch: poori, 2 palyas, sambar, rasam, curd, papad, pickle, steamed rice, kosambari & sweet of the day.',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    175,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, is_todays_special: true, spice_level: 'mild', prep_time_mins: 15 },
    10
  ),
  mkItem(
    '11',
    '02',
    'Bisi Bele Bath with Boondi',
    'bisi-bele-bath',
    'Karnataka classic rice-lentil medley simmered with freshly ground masala, tamarind & veggies, topped with khara boondi and ghee.',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    95,
    { is_jain_available: true, is_bestseller: true, spice_level: 'medium', prep_time_mins: 12 },
    11
  ),
  mkItem(
    '12',
    '02',
    'North Karnataka Jolada Rotti Meal',
    'jolada-rotti-meal',
    'Two hand-patted jowar rottis served with enne-gai (stuffed brinjal), zunka, shenga chutney, curd & anna-saaru.',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    165,
    { spice_level: 'spicy', prep_time_mins: 18 },
    12
  ),
  mkItem(
    '13',
    '02',
    'Curd Rice with Pomegranate & Tempering',
    'curd-rice',
    'Cooling creamy curd rice tempered with mustard, ginger, green chilli, curry leaves and garnished with fresh pomegranate.',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    75,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 8 },
    13
  ),
  mkItem(
    '14',
    '02',
    'Ragi Mudde & Soppu Saaru Meal',
    'ragi-mudde-meal',
    'Wholesome finger-millet balls paired with aromatic greens saaru, palya, steamed rice & buttermilk.',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    140,
    { spice_level: 'medium', prep_time_mins: 15 },
    14
  ),

  // Tiffins
  mkItem(
    '15',
    '03',
    'KK Mini Tiffin Combo',
    'kk-mini-tiffin-combo',
    'Sampler platter with 1 idli, 1 vada, mini masala dosa, kesari bath, chutney & sambar — ideal for indecisive cravings.',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    145,
    { is_jain_available: true, is_bestseller: true, is_todays_special: true, spice_level: 'mild', prep_time_mins: 15 },
    15
  ),
  mkItem(
    '16',
    '03',
    'Mangalore Buns (2 Pcs)',
    'mangalore-buns',
    'Fluffy golden deep-fried sweet banana puris from coastal Karnataka, served with spicy coconut chutney & veg kurma.',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    70,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, spice_level: 'mild', prep_time_mins: 10 },
    16
  ),
  mkItem(
    '17',
    '03',
    'Maddur Vada (2 Pcs)',
    'maddur-vada',
    'Crispy spiced onion-semolina-rice flour discs fried golden — best paired with hot evening filter coffee.',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    60,
    { spice_level: 'medium', prep_time_mins: 8 },
    17
  ),
  mkItem(
    '18',
    '03',
    'Neer Dosa with Veg Kurma',
    'neer-dosa-kurma',
    'Delicate lacy rice crepes served with mildly spiced coconut-cashew vegetable kurma and jaggery-coconut dip.',
    'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    95,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 12 },
    18
  ),
  mkItem(
    '19',
    '03',
    'Akki Rotti with Chutney',
    'akki-rotti',
    'Traditional rice flour flatbread kneaded with dill leaves, grated carrot, green chillies & cumin, roasted crisp on iron tawa.',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    85,
    { is_jain_available: true, spice_level: 'medium', prep_time_mins: 12 },
    19
  ),

  // Chaats
  mkItem(
    '20',
    '04',
    'Bengaluru Masala Puri',
    'bengaluru-masala-puri',
    'Crushed crispy puris drenched in hot spiced green-peas gravy, topped with sweet tamarind chutney, onions, coriander & sev.',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    65,
    { is_jain_available: true, is_bestseller: true, spice_level: 'spicy', prep_time_mins: 8 },
    20
  ),
  mkItem(
    '21',
    '04',
    'Dahi Papdi Chaat',
    'dahi-papdi-chaat',
    'Crunchy wheat papdis layered with chilled sweetened curd, mint & dates chutneys, boondi and roasted cumin.',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    75,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 8 },
    21
  ),
  mkItem(
    '22',
    '04',
    'Bhel Puri Special',
    'bhel-puri',
    'Light puffed rice tossed with crunchy sev, raw mango, roasted peanuts, and tangy house chutneys.',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    60,
    { is_jain_available: true, spice_level: 'medium', prep_time_mins: 6 },
    22
  ),

  // Beverages
  mkItem(
    '23',
    '05',
    'Madras Filter Coffee (Brass Davara)',
    'filter-coffee',
    'Freshly brewed Chikmagalur 80:20 coffee decoction frothed with rich farm milk in traditional brass davara-tumbler.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    35,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, is_todays_special: true, spice_level: 'mild', prep_time_mins: 5 },
    23
  ),
  mkItem(
    '24',
    '05',
    'Saffron Badam Milk (Hot / Cold)',
    'badam-milk',
    'Slow-simmered almond milk infused with Kashmiri saffron, cardamom & slivered pistachios.',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    65,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 5 },
    24
  ),
  mkItem(
    '25',
    '05',
    'Traditional Herbal Kashaya',
    'herbal-kashaya',
    'Soothing jaggery-sweetened spiced decoction of roasted coriander, cumin, black pepper & tulsi.',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    40,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 5 },
    25
  ),
  mkItem(
    '26',
    '05',
    'Spiced Buttermilk (Neer Majjige)',
    'spiced-buttermilk',
    'Chilled churned curd with crushed ginger, curry leaves, asafoetida & green chilli.',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    35,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 5 },
    26
  ),

  // Sweets
  mkItem(
    '27',
    '06',
    'Pure Ghee Mysore Pak (250g Box)',
    'ghee-mysore-pak',
    'Melt-in-mouth roasted gram flour fudge crafted with pure Nandini ghee. Perfect for gifting & festivals.',
    'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
    210,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, spice_level: 'mild', prep_time_mins: 5 },
    27
  ),
  mkItem(
    '28',
    '06',
    'Bele Obbattu / Holige (2 Pcs)',
    'bele-obbattu',
    'Paper-thin festive flatbread stuffed with sweet chana dal-jaggery-cardamom puran, served warm with ghee.',
    'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
    90,
    { is_jain_available: true, is_no_onion_garlic: true, is_todays_special: true, spice_level: 'mild', prep_time_mins: 10 },
    28
  ),
  mkItem(
    '29',
    '06',
    'Pineapple Kesari Bath',
    'pineapple-kesari-bath',
    'Golden semolina pudding simmered with pineapple chunks, saffron, ghee & roasted cashews.',
    'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
    55,
    { is_jain_available: true, is_no_onion_garlic: true, spice_level: 'mild', prep_time_mins: 6 },
    29
  ),

  // Bakery (KK Bakers)
  mkItem(
    '30',
    '07',
    'KK Bakers Bengaluru Honey Cake (2 Pcs)',
    'kk-honey-cake',
    'Nostalgic Bengaluru Iyengar-bakery style soft eggless sponge soaked in warm honey glaze and topped with jam & coconut.',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    70,
    { is_jain_available: true, is_no_onion_garlic: true, is_bestseller: true, is_bakery_item: true, spice_level: 'mild', prep_time_mins: 5 },
    30
  ),
  mkItem(
    '31',
    '07',
    'Eggless Veg Masala Puff (2 Pcs)',
    'kk-veg-puff',
    'Flaky multi-layered puff pastry stuffed with spiced mixed vegetables and herbs, baked fresh hourly.',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    65,
    { is_bakery_item: true, spice_level: 'medium', prep_time_mins: 5 },
    31
  ),
  mkItem(
    '32',
    '07',
    'Eggless Celebration Pineapple Cake (1 kg)',
    'kk-celebration-cake',
    'Fresh cream eggless celebration cake layered with pineapple compote. Custom message included — pre-order 24 hrs ahead.',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    850,
    { is_jain_available: true, is_no_onion_garlic: true, is_bakery_item: true, requires_preorder: true, spice_level: 'mild', prep_time_mins: 30 },
    32
  ),
];

export const MOCK_OUTLET_PRICES: OutletMenuPrice[] = MOCK_OUTLETS.flatMap((outlet) =>
  MOCK_MENU_ITEMS.map((item) => {
    let price = item.base_price;
    if (outlet.slug === 'jp-nagar-7th-phase' && item.base_price >= 80) {
      price = item.base_price + 5;
    } else if (outlet.slug === 'jayanagar-4th-block' && item.slug === 'filter-coffee') {
      price = 30;
    }

    const isBakeryUnavailable =
      outlet.slug === 'jp-nagar-7th-phase' && item.is_bakery_item;

    return {
      id: `omp-${outlet.id.slice(-2)}-${item.id.slice(-2)}`,
      outlet_id: outlet.id,
      menu_item_id: item.id,
      price,
      is_available: !isBakeryUnavailable,
      unavailable_reason: isBakeryUnavailable
        ? 'Available only at Hulimavu & Jayanagar KK Bakers'
        : null,
      updated_at: '2026-01-01T00:00:00Z',
    };
  })
);

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    outlet_id: '11111111-1111-4111-8111-111111111101',
    order_id: null,
    customer_id: null,
    customer_name: 'Ananya Rao',
    rating: 5,
    food_rating: 5,
    service_rating: 5,
    comment:
      'Our Sunday morning ritual on Bannerghatta Road! The Benne Masala Dosa is crisp outside, pillowy inside, and the brass-davara filter coffee is unbeatable.',
    is_featured: true,
    posted_to_google: true,
    status: 'published',
    created_at: '2026-10-20T09:15:00Z',
  },
  {
    id: 'rev-2',
    outlet_id: '11111111-1111-4111-8111-111111111102',
    order_id: null,
    customer_id: null,
    customer_name: 'Karthik Hegde',
    rating: 5,
    food_rating: 5,
    service_rating: 4,
    comment:
      'Super clean kitchen, quick service even during the 8:30 AM rush, and the Rava Idli with saagu tastes just like home.',
    is_featured: true,
    posted_to_google: true,
    status: 'published',
    created_at: '2026-10-28T08:45:00Z',
  },
  {
    id: 'rev-3',
    outlet_id: '11111111-1111-4111-8111-111111111103',
    order_id: null,
    customer_id: null,
    customer_name: 'Meenakshi Sundaram',
    rating: 5,
    food_rating: 5,
    service_rating: 5,
    comment:
      "Ordered Banana Leaf Meals and Bele Obbattu for my parents' anniversary lunch. Authentic pure-veg flavours and warm staff.",
    is_featured: true,
    posted_to_google: false,
    status: 'published',
    created_at: '2026-11-04T13:30:00Z',
  },
];

export const MOCK_SITE_CONTENT: SiteContent[] = [
  {
    id: 'sc-1',
    outlet_id: null,
    key: 'announcement_bar',
    title: 'Fresh Morning Steam from 7:30 AM • 100% Pure Vegetarian • Zero Artificial Colours',
    subtitle: 'Use code KKWELCOME for ₹40 off orders above ₹249',
    body: null,
    image_url: null,
    cta_label: 'Order Now',
    cta_link: '/menu',
    is_active: true,
    display_order: 1,
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sc-2',
    outlet_id: null,
    key: 'hero_banner',
    title: 'Crisp Benne Dosas, Steaming Idlis & Brass-Davara Filter Coffee',
    subtitle: 'Your Neighbourhood Pure-Veg South Indian Tiffin & Family Dining House in Bengaluru',
    body: 'Hand-fermented batter, cold-pressed oils, Nandini ghee, and warm hospitality across Hulimavu, JP Nagar & Jayanagar.',
    image_url: null,
    cta_label: 'Order Pickup or Delivery',
    cta_link: '/menu',
    is_active: true,
    display_order: 2,
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sc-3',
    outlet_id: null,
    key: 'todays_special_note',
    title: 'Festival & Seasonal Special: Fresh Bele Obbattu & Pineapple Kesari Bath',
    subtitle: 'Available at all 3 Bengaluru outlets until sold out.',
    body: null,
    image_url: null,
    cta_label: 'Explore Specials',
    cta_link: '/menu?filter=specials',
    is_active: true,
    display_order: 3,
    updated_at: '2026-01-01T00:00:00Z',
  },
];

/** Gallery placeholder images — TODO: replace with real outlet & kitchen photos */
export const MOCK_GALLERY_PHOTOS = [
  {
    title: 'Golden Benne Masala Dosa off the iron tawa',
    caption: 'Served crisp with fresh coconut chutney & tiffin sambar',
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Traditional Banana Leaf Festive Meal',
    caption: 'Wholesome midday thali served daily 12:00 PM – 3:30 PM',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Chikmagalur 80:20 Filter Coffee',
    caption: 'Hand-frothed in traditional brass davara-tumbler',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Warm Family Dining Hall',
    caption: 'AC & non-AC seating designed for unhurried family meals',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  },
];

