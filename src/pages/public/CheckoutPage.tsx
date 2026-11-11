import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { useCart } from '@/context/CartContext';
import { useOutlet } from '@/context/OutletContext';
import {
  launchRazorpayCheckout,
  lookupCustomerLoyalty,
  placeOrder,
  validateCoupon,
} from '@/services/orderService';
import type { OrderType } from '@/types/database';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { outlets, selectedOutlet } = useOutlet();
  const {
    cartOutletId,
    cartOutletSlug,
    cartOutletName,
    items,
    subtotal,
    gstAmount,
    hasPreorderItem,
    clearCart,
  } = useCart();

  const activeOutlet = useMemo(
    () => outlets.find((o) => o.id === cartOutletId) ?? selectedOutlet ?? outlets[0],
    [outlets, cartOutletId, selectedOutlet]
  );

  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Coupons & Loyalty
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>();
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [availablePoints, setAvailablePoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'counter'>('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch loyalty points automatically when 10-digit phone is entered
  useEffect(() => {
    const clean = customerPhone.replace(/\D/g, '');
    if (clean.length === 10 && BRAND.features.enableLoyaltyProgram) {
      lookupCustomerLoyalty(clean).then(setAvailablePoints);
    } else {
      setAvailablePoints(0);
      setRedeemPoints(false);
    }
  }, [customerPhone]);

  // Ensure delivery orders always pay online via Razorpay
  useEffect(() => {
    if (orderType === 'delivery' && paymentMethod === 'counter') {
      setPaymentMethod('razorpay');
    }
  }, [orderType, paymentMethod]);

  const deliveryFee =
    orderType === 'delivery'
      ? subtotal >= BRAND.operations.freeDeliveryAboveInr
        ? 0
        : BRAND.operations.defaultDeliveryFeeInr
      : 0;

  const maxRedeemablePoints = Math.min(
    availablePoints,
    Math.floor((subtotal - couponDiscount) * 0.5)
  );
  const pointsRedeemed = redeemPoints ? Math.max(0, maxRedeemablePoints) : 0;
  const loyaltyDiscount = pointsRedeemed * BRAND.operations.loyaltyPointValueInr;
  const totalDiscount = couponDiscount + loyaltyDiscount;

  const grandTotal = Math.max(
    0,
    Math.round((subtotal + gstAmount + deliveryFee - totalDiscount) * 100) / 100
  );

  const estimatedPointsEarned = BRAND.features.enableLoyaltyProgram
    ? Math.floor(subtotal / 100) * BRAND.operations.loyaltyPointsPer100Inr
    : 0;

  const handleApplyCoupon = async (codeOverride?: string) => {
    if (!activeOutlet) return;
    const codeToTry = codeOverride ?? couponInput;
    if (codeOverride) setCouponInput(codeOverride);
    const res = await validateCoupon(codeToTry, subtotal, activeOutlet.id);
    setCouponMessage(res.message);
    if (res.valid && res.coupon) {
      setAppliedCouponCode(res.coupon.code);
      setCouponDiscount(res.discountAmount);
    } else {
      setAppliedCouponCode(undefined);
      setCouponDiscount(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeOutlet || items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (orderType === 'delivery' && deliveryAddress.trim().length < 10) {
      setErrorMsg('Please enter your complete Bengaluru delivery address.');
      return;
    }
    if (hasPreorderItem && !scheduledDate) {
      setErrorMsg('Please select a pickup/delivery date for your KK Bakers pre-order cake.');
      return;
    }

    setSubmitting(true);
    try {
      let rzpInfo: { paymentId: string; orderId?: string } | undefined;
      if (paymentMethod === 'razorpay') {
        rzpInfo = await launchRazorpayCheckout({
          amountInr: grandTotal,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          outletName: activeOutlet.name,
        });
      }

      const placed = await placeOrder({
        outletId: activeOutlet.id,
        outletSlug: cartOutletSlug || activeOutlet.slug,
        outletName: cartOutletName || activeOutlet.name,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        orderNotes: orderNotes.trim() || undefined,
        scheduledFor: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        lines: items,
        subtotal,
        gstAmount,
        deliveryFee,
        discountAmount: totalDiscount,
        couponCode: appliedCouponCode,
        loyaltyPointsRedeemed: pointsRedeemed,
        paymentMethod,
        razorpayPaymentId: rzpInfo?.paymentId,
        razorpayOrderId: rzpInfo?.orderId,
      });

      clearCart();
      navigate(`/track-order/${placed.order.id}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong placing your order.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-kumkum">
          Your Cart Is Empty
        </h1>
        <p className="text-ink-muted">
          Add breakfast dosas, meals, or filter coffee before checking out.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 rounded-xl bg-kumkum text-white px-5 py-3 text-sm font-bold"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-kumkum hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Link>

      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold text-kumkum">Checkout</h1>
        {activeOutlet && (
          <p className="text-sm text-ink-muted flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-banana" />
            Ordering from <strong className="text-ink">{activeOutlet.name}</strong>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Fulfillment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pickup vs Delivery Toggle */}
          <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink">
              1. Order Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  orderType === 'pickup'
                    ? 'border-kumkum bg-kumkum-soft ring-2 ring-kumkum/20'
                    : 'border-sand-border bg-cream hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-ink">
                  <Store className="w-4 h-4 text-kumkum" />
                  Self Pickup
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Ready in ~15–20 mins • Zero fee
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'border-kumkum bg-kumkum-soft ring-2 ring-kumkum/20'
                    : 'border-sand-border bg-cream hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-ink">
                  <Truck className="w-4 h-4 text-banana" />
                  Home Delivery
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  {subtotal >= BRAND.operations.freeDeliveryAboveInr
                    ? 'FREE delivery unlocked!'
                    : `₹${BRAND.operations.defaultDeliveryFeeInr} (Free above ₹${BRAND.operations.freeDeliveryAboveInr})`}
                </p>
              </button>
            </div>
          </section>

          {/* Guest Details */}
          <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink">
              2. Your Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Raghavendra Rao"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/30"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
                >
                  10-Digit Mobile Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  maxLength={13}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98450 12345"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-email"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Email (optional, for receipt)
              </label>
              <input
                id="checkout-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/30"
              />
            </div>

            {orderType === 'delivery' && (
              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
                >
                  Bengaluru Delivery Address *
                </label>
                <textarea
                  id="checkout-address"
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat / House No., Apartment, Street, Landmark, Pincode"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/30"
                />
              </div>
            )}

            {hasPreorderItem && (
              <div className="rounded-xl bg-turmeric-soft border border-turmeric/40 p-3.5 space-y-1.5">
                <label
                  htmlFor="preorder-date"
                  className="block text-xs font-bold uppercase tracking-wider text-wood"
                >
                  KK Bakers Pre-Order Date &amp; Time *
                </label>
                <input
                  id="preorder-date"
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-xl border border-sand-border bg-white px-3 py-2 text-sm"
                />
                <p className="text-[11px] text-wood">
                  Your cart contains a freshly made celebration cake requiring advance prep.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Kitchen / Delivery Notes (optional)
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Pack sambar separately, ring bell once"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/30"
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink">
              3. Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  paymentMethod === 'razorpay'
                    ? 'border-kumkum bg-kumkum-soft ring-2 ring-kumkum/20'
                    : 'border-sand-border bg-cream'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-ink">
                  <CreditCard className="w-4 h-4 text-kumkum" />
                  Razorpay (UPI / Cards)
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  GPay, PhonePe, Paytm, Visa / Mastercard
                </p>
              </button>

              <button
                type="button"
                disabled={orderType === 'delivery'}
                onClick={() => setPaymentMethod('counter')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  orderType === 'delivery'
                    ? 'opacity-50 cursor-not-allowed bg-cream-warm border-sand-border'
                    : paymentMethod === 'counter'
                      ? 'border-kumkum bg-kumkum-soft ring-2 ring-kumkum/20 cursor-pointer'
                      : 'border-sand-border bg-cream cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-ink">
                  <Store className="w-4 h-4 text-banana" />
                  Pay at Counter
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Available for self-pickup orders
                </p>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary, Coupons & Loyalty */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs sticky top-24">
            <h2 className="font-serif text-xl font-bold text-ink">
              Order Summary
            </h2>

            <ul className="divide-y divide-sand-border text-sm max-h-60 overflow-y-auto pr-1">
              {items.map((line) => (
                <li key={line.key} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {line.quantity} × {line.item.name}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {line.isJain ? 'Jain • ' : ''}
                      {line.spicePreference}
                      {line.specialInstructions ? ` • ${line.specialInstructions}` : ''}
                    </p>
                  </div>
                  <span className="font-semibold text-ink shrink-0">
                    {formatCurrency(line.item.outlet_price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Coupon Box */}
            <div className="pt-3 border-t border-sand-border space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-kumkum" />
                Promo Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. KKWELCOME)"
                  className="flex-1 rounded-xl border border-sand-border bg-cream px-3 py-2 text-xs font-semibold uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="rounded-xl bg-wood hover:bg-ink text-white px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['KKWELCOME', 'MORNING15', 'FAMILY100'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyCoupon(code)}
                    className="rounded-md bg-turmeric-soft border border-turmeric/40 px-2 py-0.5 text-[11px] font-bold text-wood hover:bg-turmeric/30 cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
              {couponMessage && (
                <p
                  className={`text-xs font-medium ${
                    appliedCouponCode ? 'text-banana-dark' : 'text-kumkum'
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Loyalty Points */}
            {BRAND.features.enableLoyaltyProgram && availablePoints > 0 && (
              <div className="rounded-xl bg-banana-soft border border-banana/25 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-banana-dark flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    {availablePoints} Loyalty Points Available
                  </span>
                  <label className="inline-flex items-center gap-1.5 font-bold text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="accent-banana"
                    />
                    Redeem {maxRedeemablePoints} pts (-₹{maxRedeemablePoints})
                  </label>
                </div>
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="pt-3 border-t border-sand-border space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>GST ({BRAND.operations.gstRatePercent}%)</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-ink-muted">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-banana-dark font-semibold">
                  <span>Discounts &amp; Loyalty</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-ink pt-2 border-t border-sand-border">
                <span>Total Payable</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              {estimatedPointsEarned > 0 && (
                <p className="text-[11px] text-banana-dark font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You&apos;ll earn +{estimatedPointsEarned} KK Loyalty points on this order!
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-kumkum-soft border border-kumkum/30 p-3 text-xs font-semibold text-kumkum">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-kumkum hover:bg-kumkum-dark disabled:opacity-60 text-white py-3.5 text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              {submitting
                ? 'Confirming Order…'
                : paymentMethod === 'razorpay'
                  ? `Pay ${formatCurrency(grandTotal)} & Place Order`
                  : `Place Pickup Order (${formatCurrency(grandTotal)})`}
            </button>

            <p className="text-[11px] text-center text-ink-muted flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-banana" />
              100% Pure Vegetarian Kitchen • Instant Live Status Tracking
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

