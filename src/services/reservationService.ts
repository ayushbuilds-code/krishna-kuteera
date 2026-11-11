import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  CateringEnquiry,
  Reservation,
  TableZone,
} from '@/types/database';

const DEMO_RESERVATIONS_KEY = 'kk_demo_reservations_v1';
const DEMO_CATERING_KEY = 'kk_demo_catering_v1';

export const RESERVATION_TIME_SLOTS = [
  { value: '08:00', label: '8:00 AM', meal: 'Breakfast' },
  { value: '09:00', label: '9:00 AM', meal: 'Breakfast' },
  { value: '10:00', label: '10:00 AM', meal: 'Breakfast' },
  { value: '12:30', label: '12:30 PM', meal: 'Lunch' },
  { value: '13:30', label: '1:30 PM', meal: 'Lunch' },
  { value: '14:30', label: '2:30 PM', meal: 'Lunch' },
  { value: '19:00', label: '7:00 PM', meal: 'Dinner' },
  { value: '20:00', label: '8:00 PM', meal: 'Dinner' },
  { value: '21:00', label: '9:00 PM', meal: 'Dinner' },
] as const;

export interface SlotAvailability {
  time_slot: string;
  booked_guests: number;
  max_guests: number;
  remaining_guests: number;
}

function getDemoReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(DEMO_RESERVATIONS_KEY);
    return raw ? (JSON.parse(raw) as Reservation[]) : [];
  } catch {
    return [];
  }
}

function saveDemoReservation(row: Reservation) {
  try {
    const existing = getDemoReservations();
    localStorage.setItem(
      DEMO_RESERVATIONS_KEY,
      JSON.stringify([row, ...existing].slice(0, 50))
    );
  } catch {
    // ignore storage errors
  }
}

export async function fetchSlotAvailability(
  outletId: string,
  date: string,
  maxGuestsFallback: number
): Promise<SlotAvailability[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc('get_slot_availability', {
      p_outlet_id: outletId,
      p_date: date,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        time_slot: row.time_slot,
        booked_guests: Number(row.booked_guests),
        max_guests: Number(row.max_guests),
        remaining_guests: Number(row.remaining_guests),
      }));
    }
  }

  const demoRows = getDemoReservations().filter(
    (r) =>
      r.outlet_id === outletId &&
      r.reservation_date === date &&
      ['pending', 'confirmed', 'seated'].includes(r.status)
  );

  return RESERVATION_TIME_SLOTS.map((slot) => {
    const booked = demoRows
      .filter((r) => r.time_slot === slot.value)
      .reduce((sum, r) => sum + r.party_size, 0);
    return {
      time_slot: slot.value,
      booked_guests: booked,
      max_guests: maxGuestsFallback,
      remaining_guests: Math.max(maxGuestsFallback - booked, 0),
    };
  });
}

export interface CreateReservationInput {
  outletId: string;
  maxGuestsPerSlot: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  timeSlot: string;
  partySize: number;
  seatingPreference: TableZone | 'any';
  specialRequests?: string;
  notificationChannel: 'whatsapp' | 'sms' | 'email';
}

export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  const code = `KKR-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanPhone = input.customerPhone.replace(/\D/g, '').slice(-10);

  // Guard against overbooking before insert
  const slots = await fetchSlotAvailability(
    input.outletId,
    input.reservationDate,
    input.maxGuestsPerSlot
  );
  const targetSlot = slots.find((s) => s.time_slot === input.timeSlot);
  if (targetSlot && targetSlot.remaining_guests < input.partySize) {
    throw new Error(
      `Only ${targetSlot.remaining_guests} seats left for that slot. Please choose another time or smaller party size.`
    );
  }

  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const record: Reservation = {
      id: `demo-res-${Date.now()}`,
      reservation_code: code,
      outlet_id: input.outletId,
      table_id: null,
      customer_id: null,
      customer_name: input.customerName,
      customer_phone: cleanPhone,
      customer_email: input.customerEmail || null,
      reservation_date: input.reservationDate,
      time_slot: input.timeSlot,
      party_size: input.partySize,
      seating_preference: input.seatingPreference,
      status: 'confirmed',
      is_walk_in: false,
      special_requests: input.specialRequests || null,
      notification_channel: input.notificationChannel,
      created_at: now,
      updated_at: now,
    };
    saveDemoReservation(record);
    return record;
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      reservation_code: code,
      outlet_id: input.outletId,
      customer_name: input.customerName,
      customer_phone: cleanPhone,
      customer_email: input.customerEmail || null,
      reservation_date: input.reservationDate,
      time_slot: input.timeSlot,
      party_size: input.partySize,
      seating_preference: input.seatingPreference,
      status: 'confirmed',
      is_walk_in: false,
      special_requests: input.specialRequests || null,
      notification_channel: input.notificationChannel,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Could not confirm reservation.');
  }
  return data as Reservation;
}

export interface CreateCateringInput {
  outletId?: string;
  contactName: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  venueAddress: string;
  preferredMenuNotes: string;
  estimatedBudget?: number;
}

export async function submitCateringEnquiry(
  input: CreateCateringInput
): Promise<CateringEnquiry> {
  const code = `KKC-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanPhone = input.phone.replace(/\D/g, '').slice(-10);

  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const row: CateringEnquiry = {
      id: `demo-cat-${Date.now()}`,
      enquiry_code: code,
      outlet_id: input.outletId || null,
      contact_name: input.contactName,
      phone: cleanPhone,
      email: input.email || null,
      event_type: input.eventType,
      event_date: input.eventDate,
      guest_count: input.guestCount,
      venue_address: input.venueAddress,
      preferred_menu_notes: input.preferredMenuNotes,
      estimated_budget: input.estimatedBudget ?? null,
      quoted_amount: null,
      status: 'new',
      admin_notes: null,
      created_at: now,
      updated_at: now,
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem(DEMO_CATERING_KEY) || '[]'
      ) as CateringEnquiry[];
      localStorage.setItem(
        DEMO_CATERING_KEY,
        JSON.stringify([row, ...existing].slice(0, 30))
      );
    } catch {
      // ignore
    }
    return row;
  }

  const { data, error } = await supabase
    .from('catering_enquiries')
    .insert({
      enquiry_code: code,
      outlet_id: input.outletId || null,
      contact_name: input.contactName,
      phone: cleanPhone,
      email: input.email || null,
      event_type: input.eventType,
      event_date: input.eventDate,
      guest_count: input.guestCount,
      venue_address: input.venueAddress,
      preferred_menu_notes: input.preferredMenuNotes,
      estimated_budget: input.estimatedBudget ?? null,
      status: 'new',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to submit catering enquiry.');
  }
  return data as CateringEnquiry;
}

