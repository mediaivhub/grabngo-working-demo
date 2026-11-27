'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { getMenu, menuProduct, PREP_SECONDS, seedNotifications, type AppNotification, type FoodTag } from '@/data/mock';
import { type Car, DEMO_CAR, model3dFor, plateText } from '@/lib/car';
import { acceptedInvitationFor, checkInvitation } from '@/lib/invitations';
import { flyToCart } from '@/components/CartFly';
import { setOnboarded } from '@/lib/onboarding';
import { orderTotals, unitPrice, type AddonSelection, type Size } from '@/lib/pricing';

export type CartLine = {
  key: string;
  productId: string;
  size: Size;
  addons: AddonSelection;
  qty: number;
  unitPrice: number;
};

export type OrderStatus = 'preparing' | 'ready' | 'completed';
export type PickupMode = 'counter' | 'car';
export type PaymentMethod = 'cash' | 'apple-pay' | 'google-pay' | 'card';

export type Order = {
  id: string;
  placeId: string;
  lines: CartLine[];
  total: number;
  createdAt: number;
  readyAt: number;
  status: OrderStatus;
  favorite: boolean;
  rating?: number;
  payment: PaymentMethod;
  carPlate?: string;
  /** Set for curbside orders: the car staff walk the order out to. */
  car?: Car;
  /** When the customer arrived (detected by location, or tapped "I've arrived"). */
  arrivedAt?: number;
  /** Curbside bay the order is brought to. */
  bay?: number;
  /** Where in the bay, sent by the customer in one tap ("Left side"). */
  spot?: { label: string; at: number };
  /** The staff member walking the order out, and when they set off. */
  staff?: string;
  walkingAt?: number;
  /** When the order was handed over at the car. */
  handedAt?: number;
  /** The customer's live drive in, shared with the restaurant: metres away and seconds to arrive. */
  trip?: { m: number; s: number; at: number; demo?: boolean };
};

/** Where the customer can say they've parked, in one tap. */
export const SPOTS = ['Left side', 'Right side', 'By the entrance'] as const;

export type User = { fullName: string; nickname: string; phone: string; dob?: string; avatarUri?: string };

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'card';
/** Only display details are kept on-device; the full number and CVV never leave the form. */
export type SavedCard = { id: string; brand: CardBrand; last4: string; expiry: string };
export type WalletId = 'apple-pay' | 'google-pay';

export type ChatMessage = { id: string; from: 'agent' | 'me'; text: string; at: number };
export type UsualMode = 'recent' | 'favorite' | 'frequent';

export type SearchFilters = { minPrice: number | null; maxPrice: number | null; foodTag: FoodTag | null; minRating: number | null };
export const EMPTY_FILTERS: SearchFilters = { minPrice: null, maxPrice: null, foodTag: null, minRating: null };

type State = {
  /** True once saved data has been loaded into the store (never saved itself). */
  hydrated: boolean;
  cart: { placeId: string; lines: CartLine[]; carPlate: string; pickup?: PickupMode };
  /** The customer's saved car for curbside pickup. */
  car: Car | null;
  /** Invitations the customer has accepted (ids). */
  invitations: string[];
  user: User | null;
  orders: Order[];
  usualMode: UsualMode;
  notifications: AppNotification[];
  searchFilters: SearchFilters;
  favoritePlaces: string[];
  favoriteProducts: string[];
  cards: SavedCard[];
  /** A saved card id or a wallet id. */
  defaultPayment: string;
  prefs: Record<string, boolean>;
  chat: ChatMessage[];
};

// Fixed dates (not Date.now) so server and browser render the same history.
const at = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m - 1, d, h, min).getTime();

type SeedLine = [productId: string, qty: number, size?: Size];

function seedOrder(id: string, placeId: string, items: SeedLine[], createdAt: number, payment: PaymentMethod, extra: Partial<Order> = {}): Order {
  const menu = getMenu(placeId);
  const lines: CartLine[] = items.map(([productId, qty, size = 'M']) => {
    const product = menuProduct(menu, productId)!;
    return { key: lineKey(productId, size, {}), productId, size, addons: {}, qty, unitPrice: unitPrice(product, size, {}) };
  });
  return { id, placeId, lines, total: orderTotals(lines).total, createdAt, readyAt: createdAt + PREP_SECONDS * 1000, status: 'completed', favorite: false, payment, ...extra };
}

/** Order history for the demo / test account. */
export const TEST_ORDERS: Order[] = [
  seedOrder('GNG-482190', 'stay', [['caramel-latte', 1], ['mille-crepe', 1], ['sweet-brioche', 1]], at(2026, 11, 7, 8, 22), 'card', { rating: 5, favorite: true }),
  seedOrder('GNG-417733', 'orfali', [['hummus-plate', 2], ['iced-latte', 2, 'L']], at(2026, 11, 2, 13, 5), 'apple-pay', { rating: 4 }),
  seedOrder('GNG-390512', 'nightjar', [['cortado', 1], ['almond-croissant', 1]], at(2026, 10, 26, 7, 48), 'card'),
];

/** Test account: log in with this number and the demo code to get this profile and history. */
export const TEST_ACCOUNT: User = { fullName: 'Noor Al Rashid', nickname: 'Noor', phone: '+971 52 345 6789', dob: '10 / 04 / 1998' };

const initialState: State = {
  hydrated: false,
  cart: { placeId: 'orfali', lines: [], carPlate: '', pickup: 'counter' },
  car: DEMO_CAR,
  invitations: [],
  user: null,
  orders: TEST_ORDERS,
  usualMode: 'recent',
  notifications: seedNotifications,
  searchFilters: EMPTY_FILTERS,
  favoritePlaces: ['stay', 'orfali'],
  favoriteProducts: ['caramel-latte', 'mille-crepe', 'sweet-brioche'],
  cards: [
    // Test cards (display details only).
    { id: 'card-mc', brand: 'mastercard', last4: '5914', expiry: '11/28' },
    { id: 'card-visa', brand: 'visa', last4: '4821', expiry: '04/29' },
  ],
  defaultPayment: 'card-mc',
  prefs: {
    orderUpdates: false,
    specialOffers: true,
    newRestaurants: false,
    dynamicIsland: true,
    qrAlerts: true,
    followUp: false,
    improveExperience: false,
    dataSharing: false,
    locationInSettings: true,
    backgroundLocation: false,
    marketingEmails: false,
    emailReceipts: false,
  },
  chat: [
    { id: 'c1', from: 'agent', text: 'Hi, I’m the GrabnGo support team. How can we help with your order today?', at: 0 },
    { id: 'c2', from: 'me', text: 'I lost the QR code for my pickup.', at: 0 },
    { id: 'c3', from: 'agent', text: 'No worries! I’ve generated a new one — you’ll find it under Order Status → Show QR code.', at: 0 },
    { id: 'c4', from: 'me', text: 'Got it! Thanks.', at: 0 },
  ],
};

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'add'; line: CartLine; placeId: string }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'carPlate'; value: string }
  | { type: 'setCart'; placeId: string; lines: CartLine[] }
  | { type: 'login'; user: User }
  | { type: 'logout' }
  | { type: 'placeOrder'; order: Order }
  | { type: 'orderStatus'; id: string; status: OrderStatus }
  | { type: 'favorite'; id: string }
  | { type: 'rate'; id: string; rating: number }
  | { type: 'usual'; mode: UsualMode }
  | { type: 'filters'; filters: SearchFilters }
  | { type: 'favPlace'; id: string }
  | { type: 'favProduct'; id: string; on?: boolean }
  | { type: 'updateUser'; patch: Partial<User> }
  | { type: 'addCard'; card: SavedCard }
  | { type: 'defaultPayment'; id: string }
  | { type: 'pref'; key: string; value: boolean }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'car'; car: Car | null }
  | { type: 'acceptInvitation'; id: string }
  | { type: 'pickup'; mode: PickupMode }
  | { type: 'arrived'; id: string; at: number }
  | { type: 'patchOrder'; id: string; patch: Partial<Order> }
  | { type: 'syncOrders'; orders: Order[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate': {
      const next = { ...state, ...action.state, hydrated: true };
      // Only cars with a real 3D model can be picked now; drop an older saved car that has none.
      if (next.car && !model3dFor(next.car)) next.car = null;
      return next;
    }
    case 'add': {
      // A cart holds items from one place; adding from another place starts a new cart.
      const lines = state.cart.placeId === action.placeId ? state.cart.lines : [];
      const existing = lines.find((l) => l.key === action.line.key);
      const next = existing
        ? lines.map((l) => (l.key === action.line.key ? { ...l, qty: l.qty + action.line.qty } : l))
        : [...lines, action.line];
      return { ...state, cart: { ...state.cart, placeId: action.placeId, lines: next } };
    }
    case 'qty': {
      const lines = state.cart.lines
        .map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l))
        .filter((l) => l.qty > 0);
      return { ...state, cart: { ...state.cart, lines } };
    }
    case 'carPlate':
      return { ...state, cart: { ...state.cart, carPlate: action.value } };
    case 'setCart':
      return { ...state, cart: { ...state.cart, placeId: action.placeId, lines: action.lines } };
    case 'login':
      return { ...state, user: action.user };
    case 'logout':
      return { ...state, user: null };
    case 'placeOrder':
      return {
        ...state,
        orders: [action.order, ...state.orders],
        cart: { ...state.cart, lines: [], carPlate: '' },
      };
    case 'orderStatus':
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, status: action.status } : o)) };
    case 'favorite': {
      // Favouriting an order also saves (or un-saves) its items under "Favorite Orders".
      const order = state.orders.find((o) => o.id === action.id);
      if (!order) return state;
      const on = !order.favorite;
      const ids = order.lines.map((l) => l.productId);
      const favoriteProducts = on
        ? [...new Set([...state.favoriteProducts, ...ids])]
        : state.favoriteProducts.filter((id) => !ids.includes(id));
      return { ...state, favoriteProducts, orders: state.orders.map((o) => (o.id === action.id ? { ...o, favorite: on } : o)) };
    }
    case 'rate':
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, rating: action.rating } : o)) };
    case 'usual':
      return { ...state, usualMode: action.mode };
    case 'filters':
      return { ...state, searchFilters: action.filters };
    case 'favPlace':
      return {
        ...state,
        favoritePlaces: state.favoritePlaces.includes(action.id)
          ? state.favoritePlaces.filter((x) => x !== action.id)
          : [action.id, ...state.favoritePlaces],
      };
    case 'favProduct': {
      const has = state.favoriteProducts.includes(action.id);
      const on = action.on ?? !has;
      if (on === has) return state;
      return { ...state, favoriteProducts: on ? [action.id, ...state.favoriteProducts] : state.favoriteProducts.filter((x) => x !== action.id) };
    }
    case 'updateUser':
      return state.user ? { ...state, user: { ...state.user, ...action.patch } } : state;
    case 'addCard':
      return { ...state, cards: [...state.cards, action.card] };
    case 'defaultPayment':
      return { ...state, defaultPayment: action.id };
    case 'pref':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case 'chat':
      return { ...state, chat: [...state.chat, action.message] };
    case 'car':
      return { ...state, car: action.car };
    case 'acceptInvitation':
      return state.invitations?.includes(action.id) ? state : { ...state, invitations: [...(state.invitations ?? []), action.id] };
    case 'pickup':
      return { ...state, cart: { ...state.cart, pickup: action.mode } };
    case 'arrived':
      return { ...state, orders: state.orders.map((o) => (o.id === action.id && !o.arrivedAt ? { ...o, arrivedAt: action.at } : o)) };
    case 'patchOrder':
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, ...action.patch } : o)) };
    case 'syncOrders':
      // Another tab (e.g. the restaurant screen) changed an order: take its copy, unless it's the same.
      return JSON.stringify(action.orders) === JSON.stringify(state.orders) ? state : { ...state, orders: action.orders };
  }
}

// A function declaration (hoisted) because the seed orders above use it at module load.
export function lineKey(productId: string, size: Size, addons: AddonSelection) {
  return [productId, size, ...Object.entries(addons).sort().map(([g, o]) => `${g}:${o}`)].join('|');
}

const STORAGE_KEY = 'grabngo.state.v1';

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Forms that start from saved data (e.g. Personal Details) wait for this.
  const ready = state.hydrated;

  // Load once. Saving waits until the loaded data is in the store, so the empty starting
  // state can never overwrite what's saved (that would log people out on refresh).
  useEffect(() => {
    let saved: Partial<State> = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw) as Partial<State>;
    } catch {}
    dispatch({ type: 'hydrate', state: { ...saved, prefs: { ...initialState.prefs, ...saved.prefs } } });
  }, []);

  // Live sync between tabs on this device: the customer app and the restaurant screen share orders.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const orders = (JSON.parse(e.newValue) as Partial<State>).orders;
        if (orders) dispatch({ type: 'syncOrders', orders });
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const { hydrated: _omit, ...persisted } = state;
      void _omit;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {}
  }, [state]);

  const addToCart = useCallback(
    (args: { productId: string; placeId: string; size?: Size; addons?: AddonSelection; qty?: number }) => {
      // Priced from the merchant's own menu, so the same item can cost differently per place.
      const product = menuProduct(getMenu(args.placeId), args.productId);
      if (!product) return;
      const size = args.size ?? 'M';
      const addons = args.addons ?? {};
      flyToCart(product.image);
      dispatch({
        type: 'add',
        placeId: args.placeId,
        line: {
          key: lineKey(product.id, size, addons),
          productId: product.id,
          size,
          addons,
          qty: args.qty ?? 1,
          unitPrice: unitPrice(product, size, addons),
        },
      });
    },
    [],
  );

  const placeOrder = useCallback(
    (payment: PaymentMethod) => {
      const now = Date.now();
      // An accepted invitation whose rule the cart meets adds its gift, free.
      const inv = acceptedInvitationFor(state.cart.placeId, state.invitations);
      const giftLines: CartLine[] =
        inv && checkInvitation(inv, state.cart.lines).eligible
          ? [{ key: `gift|${inv.id}`, productId: inv.giftProductId, size: 'M', addons: {}, qty: 1, unitPrice: 0 }]
          : [];
      const order: Order = {
        id: `GNG-${String(now).slice(-6)}`,
        placeId: state.cart.placeId,
        lines: [...state.cart.lines, ...giftLines],
        total: orderTotals(state.cart.lines).total,
        createdAt: now,
        readyAt: now + PREP_SECONDS * 1000,
        status: 'preparing',
        favorite: false,
        payment,
        ...(state.cart.pickup === 'car' && state.car ? { car: state.car, carPlate: plateText(state.car), bay: (now % 6) + 1 } : {}),
      };
      dispatch({ type: 'placeOrder', order });
      return order.id;
    },
    [state.cart, state.car, state.invitations],
  );

  const reorder = useCallback((order: Order) => {
    dispatch({ type: 'setCart', placeId: order.placeId, lines: order.lines });
  }, []);

  const cartCount = state.cart.lines.reduce((n, l) => n + l.qty, 0);
  const activeOrder = state.orders.find((o) => o.status !== 'completed');

  return useMemo(
    () => ({
      ...state,
      ready,
      cartCount,
      activeOrder,
      addToCart,
      placeOrder,
      reorder,
      setQty: (key: string, qty: number) => dispatch({ type: 'qty', key, qty }),
      setCarPlate: (value: string) => dispatch({ type: 'carPlate', value }),
      setCar: (car: Car | null) => dispatch({ type: 'car', car }),
      acceptInvitation: (id: string) => dispatch({ type: 'acceptInvitation', id }),
      setPickupMode: (mode: PickupMode) => dispatch({ type: 'pickup', mode }),
      markArrived: (id: string) => dispatch({ type: 'arrived', id, at: Date.now() }),
      patchOrder: (id: string, patch: Partial<Order>) => dispatch({ type: 'patchOrder', id, patch }),
      sendSpot: (id: string, label: string) => dispatch({ type: 'patchOrder', id, patch: { spot: { label, at: Date.now() } } }),
      walkOut: (id: string, staff: string) => dispatch({ type: 'patchOrder', id, patch: { staff, walkingAt: Date.now(), status: 'ready' } }),
      handOver: (id: string) => dispatch({ type: 'patchOrder', id, patch: { handedAt: Date.now(), status: 'ready' } }),
      login: (user: User) => {
        setOnboarded();
        dispatch({ type: 'login', user });
      },
      logout: () => dispatch({ type: 'logout' }),
      setOrderStatus: (id: string, status: OrderStatus) => dispatch({ type: 'orderStatus', id, status }),
      toggleFavorite: (id: string) => dispatch({ type: 'favorite', id }),
      rateOrder: (id: string, rating: number) => dispatch({ type: 'rate', id, rating }),
      setUsualMode: (mode: UsualMode) => dispatch({ type: 'usual', mode }),
      setSearchFilters: (filters: SearchFilters) => dispatch({ type: 'filters', filters }),
      toggleFavoritePlace: (id: string) => dispatch({ type: 'favPlace', id }),
      toggleFavoriteProduct: (id: string, on?: boolean) => dispatch({ type: 'favProduct', id, on }),
      updateUser: (patch: Partial<User>) => dispatch({ type: 'updateUser', patch }),
      addCard: (card: SavedCard) => dispatch({ type: 'addCard', card }),
      setDefaultPayment: (id: string) => dispatch({ type: 'defaultPayment', id }),
      setPref: (key: string, value: boolean) => dispatch({ type: 'pref', key, value }),
      sendChat: (from: ChatMessage['from'], text: string) =>
        dispatch({ type: 'chat', message: { id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`, from, text, at: Date.now() } }),
    }),
    [state, ready, cartCount, activeOrder, addToCart, placeOrder, reorder],
  );
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  // Always render (so pages prerender); screens that seed forms from saved data wait for `ready`.
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside AppStoreProvider');
  return store;
}
