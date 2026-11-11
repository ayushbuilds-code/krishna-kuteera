/**
 * Central Brand Configuration for Krishna Kuteera.
 *
 * All visual tokens, typography, contact info, outlet defaults, and feature
 * toggles live here so rebranding or updating client details requires editing
 * only this single file.
 *
 * Color palette is directly inspired by the Krishna Kuteera restaurant signboard:
 * - Deep Kumkum Maroon fascia (#8B2323)
 * - Turmeric / Marigold Yellow top border & garlands (#E5A91A)
 * - Banana-Leaf Green KK tree emblem & pure-veg identity (#1E6F3D)
 * - Warm Teak Wood pillars (#5A3620) & Cream sandstone walls (#FBF7EE)
 */

export interface BrandConfig {
  name: string;
  kannadaName: string;
  shortName: string;
  tagline: string;
  subTagline: string;
  pureVegLabel: string;
  foundedYear: number;

  logo: {
    /** TODO: Replace with client's official high-res SVG or transparent PNG logo URL */
    url: string | null;
    alt: string;
    /** Used when logo.url is null — renders our custom billboard-matched SVG emblem */
    useInlineEmblem: boolean;
  };

  colors: {
    /** Signboard Kumkum Maroon */
    primary: string;
    primaryDark: string;
    primarySoft: string;
    /** Banana-Leaf Green (Pure Veg & KK Emblem) */
    secondary: string;
    secondaryDark: string;
    secondarySoft: string;
    /** Turmeric / Marigold Yellow */
    accent: string;
    accentDark: string;
    accentSoft: string;
    /** Teak Wood Warm Brown */
    wood: string;
    /** Backgrounds & Surfaces */
    background: string;
    surface: string;
    surfaceWarm: string;
    border: string;
    /** Typography */
    text: string;
    textMuted: string;
  };

  fonts: {
    heading: string;
    body: string;
    kannada: string;
  };

  contact: {
    primaryPhone: string;
    cateringPhone: string;
    whatsappNumber: string;
    email: string;
    headquartersAddress: string;
    city: string;
    state: string;
  };

  operations: {
    currencyCode: string;
    currencySymbol: string;
    gstRatePercent: number;
    defaultOpeningTime: string;
    defaultClosingTime: string;
    defaultDeliveryFeeInr: number;
    freeDeliveryAboveInr: number;
    /** Loyalty: points earned per ₹100 spent */
    loyaltyPointsPer100Inr: number;
    /** Value of 1 loyalty point in ₹ when redeemed */
    loyaltyPointValueInr: number;
  };

  features: {
    /** TODO: Confirm with client if "KK Bakers" bakery pre-order section should stay visible */
    enableBakerySection: boolean;
    enableOnlineOrdering: boolean;
    enableTableReservations: boolean;
    enableLoyaltyProgram: boolean;
  };

  links: {
    /** TODO: Replace with real Google Maps / Business Profile review URLs per outlet */
    googleReviewUrl: string;
    instagramUrl: string;
    facebookUrl: string;
  };

  legal: {
    /** TODO: Fill with client's registered legal entity, GSTIN, and FSSAI license numbers */
    legalEntityName: string;
    gstin: string;
    fssaiNumber: string;
  };

  /**
   * TODO: Replace placeholder Unsplash URLs with authentic food & interior photos
   * shot at Krishna Kuteera outlets (Bannerghatta Rd / Hulimavu, JP Nagar, Jayanagar).
   */
  placeholders: {
    heroImage: string;
    billboardReferenceNote: string;
    defaultDishImage: string;
    defaultOutletImage: string;
  };
}

export const BRAND: BrandConfig = {
  name: 'Krishna Kuteera',
  kannadaName: 'ಕೃಷ್ಣ ಕುಟೀರ',
  shortName: 'KK',
  tagline: 'Pure Vegetarian South Indian Tiffins, Meals & Filter Coffee',
  subTagline: 'Warm neighbourhood hospitality across Bengaluru since morning first steam.',
  pureVegLabel: '100% Pure Vegetarian',
  foundedYear: 2018, // TODO: Confirm exact founding year with client

  logo: {
    url: null, // TODO: Set to '/images/krishna-kuteera-logo.png' once client provides vector/PNG logo
    alt: 'Krishna Kuteera — Pure Vegetarian South Indian Restaurant',
    useInlineEmblem: true,
  },

  colors: {
    primary: '#8B2323',
    primaryDark: '#6A1818',
    primarySoft: '#FDF1F1',
    secondary: '#1E6F3D',
    secondaryDark: '#14522C',
    secondarySoft: '#EAF5EE',
    accent: '#E5A91A',
    accentDark: '#C48B08',
    accentSoft: '#FEF7E0',
    wood: '#5A3620',
    background: '#FBF7EE',
    surface: '#FFFFFF',
    surfaceWarm: '#F3EBDC',
    border: '#E6DAC6',
    text: '#241712',
    textMuted: '#6A574B',
  },

  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    kannada: "'Noto Sans Kannada', sans-serif",
  },

  contact: {
    primaryPhone: '+91 80 4123 7890', // TODO: Replace with client's main hotline
    cateringPhone: '+91 98450 12345', // TODO: Replace with catering manager number
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919845012345',
    email: 'namaskara@krishnakuteera.in', // TODO: Confirm official domain email
    headquartersAddress: 'Bannerghatta Main Road, Hulimavu, Bengaluru, Karnataka 560076',
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  operations: {
    currencyCode: 'INR',
    currencySymbol: '₹',
    gstRatePercent: 5, // Standard 5% GST for non-AC / restaurant food services in India
    defaultOpeningTime: '07:30',
    defaultClosingTime: '22:30',
    defaultDeliveryFeeInr: 30,
    freeDeliveryAboveInr: 499,
    loyaltyPointsPer100Inr: 5,
    loyaltyPointValueInr: 1,
  },

  features: {
    enableBakerySection: true, // KK Bakers link — toggle off if client decides not to include bakery
    enableOnlineOrdering: true,
    enableTableReservations: true,
    enableLoyaltyProgram: true,
  },

  links: {
    googleReviewUrl:
      'https://www.google.com/maps/place/Krishna+Kuteera/@12.8694388,77.5944354,17z/data=!4m8!3m7!1s0x3bae6ad1db2c1fc7:0x73bdc370d361ace9!8m2!3d12.8694336!4d77.5970103!9m1!1b1!16s%2Fg%2F11hd7fr_8p?entry=ttu&g_ep=EgoyMDI2MTEwOS4wIKXMDSoASAFQAw%3D%3D#:~:text=Menu-,Reviews,-About',
    instagramUrl: 'https://instagram.com/krishnakuteera.blr', // TODO: Confirm handle
    facebookUrl: 'https://facebook.com/krishnakuteera.blr', // TODO: Confirm page
  },

  legal: {
    legalEntityName: 'Krishna Kuteera Hospitality Pvt. Ltd.', // TODO: Confirm registered business name
    gstin: '29AABCK0000A1Z5', // TODO: Replace with actual GSTIN per outlet / entity
    fssaiNumber: '11223331000000', // TODO: Replace with actual FSSAI license number
  },

  placeholders: {
    heroImage:
      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1400&q=80', // TODO: Replace with real Krishna Kuteera dosa & filter coffee photo
    billboardReferenceNote:
      'Theme matched to Krishna Kuteera signboard: kumkum maroon fascia, turmeric marigold band, green/yellow KK emblem, and warm teak wood.',
    defaultDishImage:
      'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80', // TODO: Replace with real dish photography
    defaultOutletImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80', // TODO: Replace with real outlet storefront/dining hall photos
  },
};

export function formatCurrency(amount: number): string {
  return `${BRAND.operations.currencySymbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTime12h(time24: string): string {
  const [hourStr, minuteStr = '00'] = time24.split(':');
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return time24;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr.slice(0, 2)} ${period}`;
}

