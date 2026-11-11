import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BRAND } from '@/config/brand';
import type { OutletMenuItem, SpiceLevel } from '@/types/database';

export interface CartLineItem {
  key: string;
  item: OutletMenuItem;
  quantity: number;
  isJain: boolean;
  spicePreference: SpiceLevel;
  specialInstructions: string;
}

interface StoredCart {
  outletId: string | null;
  outletSlug: string | null;
  outletName: string | null;
  items: CartLineItem[];
}

interface CartContextValue {
  cartOutletId: string | null;
  cartOutletSlug: string | null;
  cartOutletName: string | null;
  items: CartLineItem[];
  totalItems: number;
  subtotal: number;
  gstAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (
    item: OutletMenuItem,
    outlet: { id: string; slug: string; name: string },
    opts?: { isJain?: boolean; spicePreference?: SpiceLevel; specialInstructions?: string }
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateItemOptions: (
    key: string,
    opts: Partial<Pick<CartLineItem, 'isJain' | 'spicePreference' | 'specialInstructions'>>
  ) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
  hasPreorderItem: boolean;
}

const CART_STORAGE_KEY = 'kk_cart_v1';

const EMPTY_CART: StoredCart = {
  outletId: null,
  outletSlug: null,
  outletName: null,
  items: [],
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadStoredCart(): StoredCart {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as StoredCart;
    if (!Array.isArray(parsed.items)) return EMPTY_CART;
    return parsed;
  } catch {
    return EMPTY_CART;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoredCart>(loadStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  const addItem: CartContextValue['addItem'] = useCallback(
    (item, outlet, opts) => {
      setCart((prev) => {
        const isSwitchingOutlet =
          prev.outletId && prev.outletId !== outlet.id && prev.items.length > 0;

        const baseItems = isSwitchingOutlet ? [] : prev.items;
        const isJain = opts?.isJain ?? false;
        const spicePreference = opts?.spicePreference ?? item.spice_level;
        const specialInstructions = opts?.specialInstructions ?? '';

        const existingIndex = baseItems.findIndex(
          (line) =>
            line.item.id === item.id &&
            line.isJain === isJain &&
            line.spicePreference === spicePreference
        );

        let nextItems: CartLineItem[];
        if (existingIndex >= 0) {
          nextItems = baseItems.map((line, idx) =>
            idx === existingIndex
              ? { ...line, quantity: line.quantity + 1 }
              : line
          );
        } else {
          nextItems = [
            ...baseItems,
            {
              key: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              item,
              quantity: 1,
              isJain,
              spicePreference,
              specialInstructions,
            },
          ];
        }

        return {
          outletId: outlet.id,
          outletSlug: outlet.slug,
          outletName: outlet.name,
          items: nextItems,
        };
      });
    },
    []
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => {
      const nextItems =
        quantity <= 0
          ? prev.items.filter((line) => line.key !== key)
          : prev.items.map((line) =>
              line.key === key ? { ...line, quantity } : line
            );

      return nextItems.length === 0
        ? EMPTY_CART
        : { ...prev, items: nextItems };
    });
  }, []);

  const updateItemOptions: CartContextValue['updateItemOptions'] = useCallback(
    (key, opts) => {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((line) =>
          line.key === key ? { ...line, ...opts } : line
        ),
      }));
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setCart((prev) => {
      const nextItems = prev.items.filter((line) => line.key !== key);
      return nextItems.length === 0 ? EMPTY_CART : { ...prev, items: nextItems };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const getItemQuantity = useCallback(
    (menuItemId: string) =>
      cart.items
        .filter((line) => line.item.id === menuItemId)
        .reduce((sum, line) => sum + line.quantity, 0),
    [cart.items]
  );

  const totalItems = useMemo(
    () => cart.items.reduce((sum, line) => sum + line.quantity, 0),
    [cart.items]
  );

  const subtotal = useMemo(
    () =>
      cart.items.reduce(
        (sum, line) => sum + line.item.outlet_price * line.quantity,
        0
      ),
    [cart.items]
  );

  const gstAmount = useMemo(
    () =>
      Math.round(subtotal * (BRAND.operations.gstRatePercent / 100) * 100) / 100,
    [subtotal]
  );

  const hasPreorderItem = useMemo(
    () => cart.items.some((line) => line.item.requires_preorder),
    [cart.items]
  );

  const value: CartContextValue = {
    cartOutletId: cart.outletId,
    cartOutletSlug: cart.outletSlug,
    cartOutletName: cart.outletName,
    items: cart.items,
    totalItems,
    subtotal,
    gstAmount,
    isCartOpen,
    setIsCartOpen,
    addItem,
    updateQuantity,
    updateItemOptions,
    removeItem,
    clearCart,
    getItemQuantity,
    hasPreorderItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}

