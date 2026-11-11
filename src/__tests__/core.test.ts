import { beforeEach, describe, expect, it } from 'vitest';
import { formatCurrency, formatTime12h } from '@/config/brand';
import { MOCK_MENU_ITEMS, MOCK_OUTLETS } from '@/data/mockSeed';
import {
  calculateDistanceKm,
  fetchOutletMenu,
} from '@/services/restaurantData';
import { validateCoupon } from '@/services/orderService';
import {
  createReservation,
  fetchSlotAvailability,
} from '@/services/reservationService';
import { toggleOutletMenuAvailability } from '@/services/adminService';

// Minimal in-memory localStorage polyfill for Node Vitest environment
const memoryStorage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => memoryStorage.get(k) ?? null,
    setItem: (k: string, v: string) => memoryStorage.set(k, v),
    removeItem: (k: string) => memoryStorage.delete(k),
    clear: () => memoryStorage.clear(),
  },
  configurable: true,
});

describe('Krishna Kuteera Core Business Logic', () => {
  beforeEach(() => {
    memoryStorage.clear();
  });

  it('formats INR currency and 12-hour timings cleanly', () => {
    expect(formatCurrency(95)).toBe('₹95');
    expect(formatCurrency(1250.5)).toBe('₹1,250.50');
    expect(formatTime12h('07:30')).toBe('7:30 AM');
    expect(formatTime12h('22:30')).toBe('10:30 PM');
  });

  it('computes nearest outlet using coordinates (Hulimavu vs Jayanagar)', () => {
    const hulimavu = MOCK_OUTLETS[0];
    const jayanagar = MOCK_OUTLETS[2];
    // Coordinates right near Hulimavu / Meenakshi Mall
    const distToHulimavu = calculateDistanceKm(
      12.876,
      77.596,
      hulimavu.latitude!,
      hulimavu.longitude!
    );
    const distToJayanagar = calculateDistanceKm(
      12.876,
      77.596,
      jayanagar.latitude!,
      jayanagar.longitude!
    );
    expect(distToHulimavu).toBeLessThan(1);
    expect(distToHulimavu).toBeLessThan(distToJayanagar);
  });

  it('validates promo coupons with min-order and max-discount caps', async () => {
    const outletId = MOCK_OUTLETS[0].id;

    const tooLow = await validateCoupon('KKWELCOME', 180, outletId);
    expect(tooLow.valid).toBe(false);

    const validFlat = await validateCoupon('KKWELCOME', 300, outletId);
    expect(validFlat.valid).toBe(true);
    expect(validFlat.discountAmount).toBe(40);

    const cappedPercent = await validateCoupon('MORNING15', 1000, outletId);
    expect(cappedPercent.valid).toBe(true);
    expect(cappedPercent.discountAmount).toBe(60);

    const invalid = await validateCoupon('NONEXISTENT', 500, outletId);
    expect(invalid.valid).toBe(false);
  });

  it('prevents table reservation overbooking for a time slot', async () => {
    const outletId = MOCK_OUTLETS[0].id;
    const date = '2026-12-25';
    const maxCap = 10;

    await createReservation({
      outletId,
      maxGuestsPerSlot: maxCap,
      customerName: 'Ananya',
      customerPhone: '9845012345',
      reservationDate: date,
      timeSlot: '19:00',
      partySize: 6,
      seatingPreference: 'ac',
      notificationChannel: 'whatsapp',
    });

    const slots = await fetchSlotAvailability(outletId, date, maxCap);
    const eveningSlot = slots.find((s) => s.time_slot === '19:00');
    expect(eveningSlot?.remaining_guests).toBe(4);

    await expect(
      createReservation({
        outletId,
        maxGuestsPerSlot: maxCap,
        customerName: 'Karthik',
        customerPhone: '9900112233',
        reservationDate: date,
        timeSlot: '19:00',
        partySize: 5,
        seatingPreference: 'any',
        notificationChannel: 'sms',
      })
    ).rejects.toThrow(/Only 4 seats left/);
  });

  it('reflects 1-click Sold Out toggle on the public outlet menu', async () => {
    const outletId = MOCK_OUTLETS[0].id;
    const ravaIdli = MOCK_MENU_ITEMS.find((i) => i.slug === 'rava-idli')!;

    await toggleOutletMenuAvailability(
      outletId,
      ravaIdli.id,
      false,
      ravaIdli.base_price,
      'Batter sold out at 11 AM'
    );

    const { items } = await fetchOutletMenu(outletId);
    const updated = items.find((i) => i.id === ravaIdli.id);
    expect(updated?.is_available).toBe(false);
    expect(updated?.unavailable_reason).toBe('Batter sold out at 11 AM');
  });
});
