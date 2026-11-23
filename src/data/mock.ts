
export type PlaceKind = 'restaurant' | 'cafe';

/** Minutes after midnight; null = closed that day. Index 0 = Sunday. */
export type WeekSchedule = ([number, number] | null)[];

export type Place = {
  id: string;
  name: string;
  kind: PlaceKind;
  image: string;
  hero: string;
  address: string;
  eta: string;
  rating: number;
  details: string;
  schedule: WeekSchedule;
  /** Position on the stylised map, 0..1 */
  map: { x: number; y: number };
};

export type Category = 'for-you' | 'new' | 'coffee' | 'cold-coffee' | 'not-coffee' | 'food' | 'dessert';

export type Nutrition = { kcal: number; protein: number; fats: number; carbs: number };

/** Buckets used by the search "Food Categories" filter. */
export type FoodTag = 'sandwiches' | 'breakfast' | 'dessert' | 'sweet';

export type Product = {
  id: string;
  /** The place this item is best known from (shown in search suggestions). */
  placeId: string;
  foodTags: FoodTag[];
  name: string;
  price: number;
  largeExtra: number;
  sizes: { M: string; L: string };
  image: string;
  hero?: string;
  /** One-line description used by the food turntable and dessert deck. */
  tagline?: string;
  /** Background tint for dessert cards. */
  tint?: string;
  categories: Category[];
  signature?: boolean;
  ratings: number;
  nutrition: Nutrition;
  details: string;
  ingredients: string[];
  addonGroups: string[];
};

export type AddonOption = { id: string; name: string; short: string; price: number; image: string };
export type AddonGroup = { id: string; label: string; options: AddonOption[] };

export type Ingredient = { id: string; name: string; amount: string; unit: 'drop' | 'spoon'; image: string };

export type Review = { id: string; author: string; ago: string; stars: number; text: string };

export type AppNotification = {
  id: string;
  day: string;
  time: string;
  title: string;
  body?: string;
  big?: string;
  icon: 'bell-check' | 'cup' | 'laptop';
};

const img = {
  float: '/images/products/iced-coffee-float.png',
  hummus: '/images/products/hummus-plate.png',
  latte: '/images/products/iced-latte.png',
  dumplings: '/images/products/soup-dumplings.png',
  katsu: '/images/products/katsu-bowl.png',
  macchiatoHero: '/images/products/coconut-macchiato-hero.jpg',
  heroOrfali: '/images/places/hero-orfali.jpg',
  r: [
    '/images/places/r1.jpg',
    '/images/places/r2.jpg',
    '/images/places/r3.jpg',
    '/images/places/r4.jpg',
    '/images/places/r5.jpg',
  ],
  c: [
    '/images/places/c1.jpg',
    '/images/places/c2.jpg',
    '/images/places/c3.jpg',
    '/images/places/c4.jpg',
    '/images/places/c5.jpg',
  ],
  n: [
    '/images/places/n1.jpg',
    '/images/places/n2.jpg',
    '/images/places/n3.jpg',
    '/images/places/n4.jpg',
    '/images/places/n5.jpg',
  ],
};

const h = (hh: number, mm = 0) => hh * 60 + mm;
const WEEKDAYS_ONLY: WeekSchedule = [null, [h(7, 30), h(20)], [h(7, 30), h(20)], [h(7, 30), h(20)], [h(7, 30), h(20)], [h(7, 30), h(20)], null];
const ALL_WEEK: WeekSchedule = [[h(10), h(21)], [h(10), h(21)], [h(10), h(21)], [h(10), h(21)], [h(10), h(21)], [h(10), h(22)], [h(10), h(22)]];
const DETAILS =
  'Savor culinary excellence at One&Only The Palm with Michelin-starred French dining. Innovative techniques create stunning dishes that honor French traditions.';

type PlaceSeed = [id: string, name: string, kind: PlaceKind, image: string, eta: string, rating: number, x: number, y: number];

const seeds: PlaceSeed[] = [
  ['stay', 'STAY by Yannick Alléno', 'restaurant', img.r[0], '30-40 mins', 4.5, 0.72, 0.62],
  ['orfali', 'Orfali Bros Bistro', 'restaurant', img.r[1], '35-40 mins', 4.3, 0.24, 0.3],
  ['nightjar', 'Nightjar Coffee Roasters', 'restaurant', img.r[2], '25-30 mins', 4.0, 0.36, 0.19],
  ['ldc', 'LDC Kitchen + Coffee', 'restaurant', img.r[3], '40-45 mins', 4.1, 0.42, 0.44],
  ['arabian-tea', 'Arabian Tea House', 'restaurant', img.r[4], '35-40 mins', 4.2, 0.12, 0.58],
  ['tom-serg', 'Tom & Serg', 'restaurant', img.r[2], '25-30 mins', 4.4, 0.72, 0.28],
  ['la-petite', 'La Petite Maison', 'restaurant', img.r[0], '30-40 mins', 4.6, 0.47, 0.5],
  ['morning-brew', 'The Morning Brew House', 'cafe', img.c[0], '30-40 mins', 4.5, 0.83, 0.12],
  ['coffee-corner', 'Coffee Corner & Co.', 'cafe', img.c[1], '35-40 mins', 4.3, 0.92, 0.3],
  ['beans', 'Beans Everyday Café', 'cafe', img.c[2], '25-30 mins', 4.0, 0.08, 0.41],
  ['daily-grind', 'The Daily Grind Café', 'cafe', img.c[3], '40-45 mins', 4.1, 0.26, 0.62],
  ['golden-hour', 'Golden Hour Coffee', 'cafe', img.c[4], '35-40 mins', 4.2, 0.5, 0.66],
  ['urban-dining', 'The Urban Dining House', 'restaurant', img.n[0], '30-40 mins', 4.5, 0.38, 0.24],
  ['golden-spoon', 'Golden Spoon Family Kitchen', 'restaurant', img.n[1], '35-40 mins', 4.3, 0.22, 0.35],
  ['cozy-bean', 'Cozy Bean Coffee Lounge', 'cafe', img.n[2], '25-30 mins', 4.0, 0.46, 0.3],
  ['street-style', 'Street Style Flavor Bistro', 'restaurant', img.n[3], '40-45 mins', 4.1, 0.14, 0.2],
  ['fresh-roast', 'Fresh Roast Coffee House', 'cafe', img.n[4], '35-40 mins', 4.2, 0.4, 0.37],
];

export const places: Place[] = seeds.map(([id, name, kind, image, eta, rating, x, y]) => ({
  id,
  name,
  kind,
  image,
  hero: id === 'orfali' ? img.heroOrfali : image,
  address: '123 Al Fahidi St, Bur Dubai',
  eta,
  rating,
  details: DETAILS,
  schedule: id === 'orfali' ? WEEKDAYS_ONLY : ALL_WEEK,
  map: { x, y },
}));

/** Where the user is on the stylised map. */
export const USER_MAP_POSITION = { x: 0.3, y: 0.3 };

export const getPlace = (id?: string) => places.find((p) => p.id === id);

export const addonGroups: AddonGroup[] = [
  {
    id: 'healthy',
    label: 'Healthy add-ons',
    options: [
      { id: 'almonds', name: 'Almonds', short: 'Almonds', price: 4.5, image: '/images/addons/almonds.png' },
      { id: 'coconut', name: 'Coconut Flakes', short: 'Coconut', price: 3.5, image: '/images/ingredients/coconut-milk.png' },
    ],
  },
  {
    id: 'milk',
    label: 'Add Cow Milk',
    options: [
      { id: 'cow-milk', name: 'Cow Milk', short: 'Cow Milk', price: 4.5, image: '/images/addons/cow-milk.png' },
      { id: 'almond-milk', name: 'Almond Milk', short: 'Almond Milk', price: 5, image: '/images/ingredients/almond-milk.png' },
    ],
  },
  {
    id: 'sugar',
    label: 'Add Sugur',
    options: [
      { id: 'honey', name: 'Honey', short: 'Honey', price: 4.09, image: '/images/addons/honey.png' },
      { id: 'brown-sugar', name: 'Brown Sugar', short: 'Brown Sugar', price: 2, image: '/images/ingredients/brown-sugar.png' },
    ],
  },
  {
    id: 'syrup',
    label: 'Add Syrup',
    options: [
      { id: 'honey-syrup', name: 'Honey Syrup', short: 'Honey Syrup', price: 4.09, image: '/images/addons/honey-syrup.png' },
      { id: 'caramel', name: 'Caramel', short: 'Caramel', price: 4.09, image: '/images/addons/caramel.png' },
    ],
  },
  {
    id: 'topping',
    label: 'Add Topping',
    options: [
      { id: 'whipped-cream', name: 'Whipped Cream', short: 'Cream', price: 3, image: '/images/ingredients/whipped-cream.png' },
      { id: 'milk-foam', name: 'Milk Foam', short: 'Foam', price: 2.5, image: '/images/ingredients/milk-foam.png' },
    ],
  },
];

export const getAddonGroup = (id: string) => addonGroups.find((g) => g.id === id);

export const ingredients: Ingredient[] = [
  { id: 'almond-milk', name: 'Almond Milk', amount: '30–50 ml', unit: 'drop', image: '/images/ingredients/almond-milk.png' },
  { id: 'coconut-milk', name: 'Coconut Milk', amount: '20–25 ml', unit: 'drop', image: '/images/ingredients/coconut-milk.png' },
  { id: 'brown-sugar', name: 'Brown Sugar', amount: '4–5 g', unit: 'spoon', image: '/images/ingredients/brown-sugar.png' },
  { id: 'agave-syrup', name: 'Agave Syrup', amount: '5–7 ml', unit: 'spoon', image: '/images/ingredients/agave-syrup.png' },
  { id: 'whipped-cream', name: 'Whipped Cream', amount: '15–20 g', unit: 'drop', image: '/images/ingredients/whipped-cream.png' },
  { id: 'milk-foam', name: 'Milk Foam / Microfoam', amount: '30–60 ml', unit: 'drop', image: '/images/ingredients/milk-foam.png' },
];

const NUTRITION: Nutrition = { kcal: 160, protein: 1.4, fats: 9.9, carbs: 15.2 };
const DRINK_DETAILS = 'Surprising cookie: the crunch of corn flakes, the gooey sweetness of white chocolate and the salty spice of miso paste';
const DRINK_ADDONS = ['healthy', 'milk', 'sugar', 'syrup', 'topping'];
const ALL_INGREDIENTS = ingredients.map((i) => i.id);

type ProductSeed = Partial<Product> & Pick<Product, 'id' | 'name' | 'price' | 'image' | 'categories'>;

const productSeeds: ProductSeed[] = [
  { id: 'coconut-macchiato', name: 'Coconut Macchiato', price: 16.39, image: img.float, hero: img.macchiatoHero, categories: ['for-you', 'coffee', 'new'], ratings: 124 },
  { id: 'iced-coffee-float', name: 'Iced Coffee Float', price: 28, image: img.float, categories: ['for-you', 'cold-coffee'], ratings: 86 },
  { id: 'hummus-plate', name: 'Hummus Plate', price: 32, image: img.hummus, categories: ['for-you', 'food'], ratings: 114 },
  { id: 'iced-latte', name: 'Iced Latte', price: 22, image: img.latte, categories: ['for-you', 'cold-coffee', 'coffee'], ratings: 203 },
  { id: 'iced-shaken-espresso', name: 'Iced Shaken Espresso', price: 26, image: img.float, categories: ['for-you', 'cold-coffee', 'new'], signature: true, ratings: 96 },
  { id: 'iced-mocha', name: 'Iced Mocha', price: 26, image: img.latte, categories: ['for-you', 'cold-coffee'], signature: true, ratings: 77 },
  { id: 'caramel-latte', name: 'Caramel Latte', price: 24, image: img.latte, categories: ['coffee', 'new'], signature: true, ratings: 58 },
  { id: 'vanilla-float', name: 'Vanilla Float', price: 27, image: img.float, categories: ['not-coffee', 'new'], signature: true, ratings: 41 },
  { id: 'soup-dumplings', name: 'Soup Dumplings', price: 25.39, image: img.dumplings, categories: ['for-you', 'food'], ratings: 64 },
  { id: 'katsu-bowl', name: 'Chicken Katsu Bowl', price: 25.39, image: img.katsu, categories: ['for-you', 'food', 'new'], ratings: 88 },
  { id: 'sweet-brioche', name: 'Sweet Brioche', price: 40.75, image: img.r[0], categories: ['food'], ratings: 24 },
  { id: 'caramel-biscuit-donut', name: 'Caramel Biscuit Donut', price: 30.5, image: img.r[0], categories: ['food'], ratings: 51 },
  { id: 'caramelized-dates', name: 'Caramelized Dates', price: 6.1, image: img.latte, categories: ['food'], ratings: 33 },
  { id: 'signature-morning-brew', name: 'Signature Morning Brew', price: 10.25, image: img.float, categories: ['coffee'], ratings: 72 },
  { id: 'cortado', name: 'Cortado', price: 18, image: img.latte, categories: ['coffee'], placeId: 'stay', ratings: 64 },
  { id: 'cappuccino', name: 'Cappuccino', price: 19, image: img.latte, categories: ['coffee'], placeId: 'orfali', ratings: 140 },
  { id: 'coffee-cake', name: 'Coffee Cake', price: 22, image: img.r[3], categories: ['food'], placeId: 'ldc', foodTags: ['sweet', 'breakfast'], ratings: 45 },
  { id: 'latte', name: 'Latte', price: 20, image: img.latte, categories: ['coffee'], placeId: 'morning-brew', ratings: 180 },
  { id: 'espresso', name: 'Espresso', price: 14, image: img.float, categories: ['coffee'], placeId: 'coffee-corner', ratings: 95 },
  { id: 'iced-coffee', name: 'Iced Coffee', price: 21, image: img.float, categories: ['cold-coffee'], placeId: 'nightjar', ratings: 110 },
  { id: 'club-sandwich', name: 'Club Sandwich', price: 38, image: img.r[1], categories: ['food'], placeId: 'arabian-tea', foodTags: ['sandwiches'], ratings: 57 },
  { id: 'mille-crepe', name: 'Mille Crêpe Cake', price: 32, image: img.n[1], hero: img.n[1], categories: ['dessert', 'for-you'], placeId: 'golden-spoon', foodTags: ['dessert', 'sweet'], tagline: 'Twenty paper-thin layers with vanilla cream', tint: '#F4E6D6', ratings: 88 },
  { id: 'date-pudding', name: 'Date Bread Pudding', price: 28, image: img.n[0], hero: img.n[0], categories: ['dessert', 'for-you'], placeId: 'urban-dining', foodTags: ['dessert', 'sweet'], tagline: 'Warm Medjool dates, salted caramel', tint: '#F1DFC9', ratings: 73 },
  { id: 'hazelnut-crepes', name: 'Hazelnut Crêpes', price: 26, image: img.n[3], hero: img.n[3], categories: ['dessert', 'for-you'], placeId: 'street-style', foodTags: ['dessert', 'sweet'], tagline: 'Folded crêpes, cocoa-hazelnut, crushed nuts', tint: '#EDE2D8', ratings: 64 },
  { id: 'almond-croissant', name: 'Almond Croissant', price: 18, image: img.r[3], hero: img.r[3], categories: ['dessert', 'for-you'], placeId: 'ldc', foodTags: ['dessert', 'breakfast'], tagline: 'Twice-baked, frangipane filled, flaked almonds', tint: '#F3E8DA', ratings: 102 },
  { id: 'kunafa-cheesecake', name: 'Kunafa Cheesecake', price: 34, image: img.r[1], hero: img.r[1], categories: ['dessert', 'for-you'], placeId: 'orfali', foodTags: ['dessert', 'sweet'], tagline: 'Crisp kataifi crust, orange-blossom syrup', tint: '#F5E3CF', ratings: 121 },
  { id: 'halloumi-sandwich', name: 'Halloumi Sandwich', price: 34, image: img.r[4], categories: ['food'], placeId: 'arabian-tea', foodTags: ['sandwiches', 'breakfast'], ratings: 39 },
];

const FOOD_TAGS: Record<string, FoodTag[]> = {
  'hummus-plate': ['breakfast'],
  'sweet-brioche': ['breakfast', 'sweet'],
  'caramel-biscuit-donut': ['sweet'],
  'caramelized-dates': ['sweet'],
};

const FOOD = new Set(productSeeds.filter((p) => p.categories.includes('food') || p.categories.includes('dessert')).map((p) => p.id));

const TAGLINES: Record<string, string> = {
  'hummus-plate': 'Silky chickpeas, tahini, smoked paprika oil',
  'soup-dumplings': 'Six hand-folded dumplings in rich broth',
  'katsu-bowl': 'Crispy chicken, soft egg, sticky rice',
  'club-sandwich': 'Triple-decker, roast chicken, crispy beef bacon',
  'halloumi-sandwich': 'Grilled halloumi, za’atar, tomato jam',
  'sweet-brioche': 'Buttery brioche, whipped ricotta, honey',
};

export const products: Product[] = productSeeds.map((p) => ({
  largeExtra: 4,
  sizes: { M: '150 ml', L: '250 ml' },
  ratings: 0,
  nutrition: NUTRITION,
  details: DRINK_DETAILS,
  ingredients: ALL_INGREDIENTS,
  addonGroups: FOOD.has(p.id) ? [] : DRINK_ADDONS,
  placeId: 'orfali',
  foodTags: FOOD_TAGS[p.id] ?? [],
  tagline: TAGLINES[p.id],
  ...p,
}));

export const getProduct = (id?: string) => products.find((p) => p.id === id);

export const menuTabs: { id: Category; label: string }[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'new', label: 'New arrivals' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'cold-coffee', label: 'Cold coffee' },
  { id: 'not-coffee', label: 'Not coffee' },
  { id: 'food', label: 'Food' },
  { id: 'dessert', label: 'Desserts' },
];

/** Dishes shown on the Lazy Susan turntable (round plates look best). */
export const TURNTABLE_FOOD = ['hummus-plate', 'katsu-bowl', 'club-sandwich', 'soup-dumplings', 'halloumi-sandwich', 'sweet-brioche'];

export const USUAL = {
  recent: ['iced-coffee-float', 'hummus-plate', 'iced-latte'],
  favorite: ['iced-latte', 'hummus-plate', 'iced-coffee-float'],
  frequent: ['iced-latte', 'coconut-macchiato', 'soup-dumplings'],
};

export const FEATURED = ['iced-coffee-float', 'hummus-plate', 'iced-latte', 'coconut-macchiato', 'katsu-bowl'];

export const BETTER_TOGETHER = ['iced-coffee-float', 'hummus-plate', 'iced-latte', 'soup-dumplings'];

export const reviews: Review[] = [
  { id: '1', author: 'Evgenia D', ago: '4 days ago', stars: 5, text: 'The Pho Bo is very delicious, the portion is big, all the sauces are included, and the rice chips are amazing.' },
  { id: '2', author: 'Irina', ago: '4 days ago', stars: 5, text: 'Whenever we want Pho Bo, we order only from here. The food is very tasty!' },
  { id: '3', author: 'Yan Chebykin', ago: '4 days ago', stars: 5, text: 'I love the Pho Bo, and yours is especially delicious. Thank you.' },
  { id: '4', author: 'David', ago: '5 days ago', stars: 4.5, text: 'They cook extremely delicious food!!!' },
  { id: '5', author: 'Nikita', ago: '6 days ago', stars: 4, text: 'Everything is great, as always.' },
  { id: '6', author: 'Mariam', ago: '1 week ago', stars: 5, text: 'Ready exactly when I pulled up. Love it.' },
];

export const REVIEW_SUMMARY = { average: 4.89, count: 311 };

export const RATING_TAGS = ['Wrong order', 'Comment was ignored', 'Didn’t receive utensils', 'Tastes bad', 'Took too long to prepare'];

export const SERVICE_FEE = 2.04;
export const TAX_RATE = 0.05;

/** How long an order takes to prepare in the mock backend. */
export const PREP_SECONDS = 15 * 60 + 42;

export const OTP_DEMO_CODE = '12345';

export const seedNotifications: AppNotification[] = [
  { id: 'n1', day: 'Yesterday • September 2', time: '22:38', title: 'Getting ready to leave?', body: 'Your order will be ready soon. Head out now.', icon: 'bell-check' },
  { id: 'n2', day: 'Yesterday • September 2', time: '14:00', title: 'Until it’s ready for pickup.', big: '15:42', body: 'Estimated wait time may vary.', icon: 'cup' },
  { id: 'n3', day: 'September 1', time: '20:21', title: 'Heading out?', body: 'You can start heading pickup point.', icon: 'laptop' },
];

export const foodTagOptions: { id: FoodTag; label: string }[] = [
  { id: 'sandwiches', label: 'Sandwiches' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'sweet', label: 'Sweet Items' },
];

export const ratingOptions = [4, 3.5, 2.5, 2];

/** Upper bound of the price filter slider (AED). */
export const PRICE_CEILING = 100;

// ─── Per-merchant menus ──────────────────────────────────────────────────────
// Each merchant decides what it sells, what goes in each showcase section, its own
// prices and its accent colours. With a backend this whole object comes from one
// `GET /merchants/:id/menu` call; the screens just render whatever is loaded.

export type MerchantTheme = {
  /** Background arch behind the Signature drinks wheel. */
  arch: string;
  /** Disc behind each drink, and the active page dot. */
  disc: string;
  /** Turntable surface colour. */
  table: string;
  /** Sponge colours for the dessert layers (cycled). */
  sponges: string[];
  /** Section titles, so a café can say "House Pours" instead of "Signature Coffee". */
  titles?: { signature?: string; food?: string; desserts?: string };
};

export type MerchantMenu = {
  /** Everything on sale here (drives the category tabs and grids). */
  items: string[];
  /** Showcase sections; an empty list hides that section. */
  signature: string[];
  food: string[];
  desserts: string[];
  /** Merchant-specific prices (AED), overriding the catalogue price. */
  prices?: Record<string, number>;
  theme: MerchantTheme;
};

const WARM_THEME: MerchantTheme = {
  arch: '#FDF3EA',
  disc: '#EE9C57',
  table: '#F7F1EA',
  sponges: ['#F2E8E3', '#EBECE2', '#F4EEE3', '#ECE3DA', '#EAE8EE'],
};

const ALL_DESSERTS = ['mille-crepe', 'date-pudding', 'hazelnut-crepes', 'almond-croissant', 'kunafa-cheesecake'];
const SIGNATURE = ['iced-shaken-espresso', 'iced-mocha', 'caramel-latte', 'vanilla-float'];

/** Used for any merchant without its own menu yet. */
const DEFAULT_MENU: MerchantMenu = {
  items: products.map((p) => p.id),
  signature: SIGNATURE,
  food: TURNTABLE_FOOD,
  desserts: ALL_DESSERTS,
  theme: WARM_THEME,
};

export const merchantMenus: Record<string, MerchantMenu> = {
  // Levantine bistro: the full experience.
  orfali: {
    ...DEFAULT_MENU,
    food: ['hummus-plate', 'halloumi-sandwich', 'katsu-bowl', 'soup-dumplings', 'sweet-brioche'],
    desserts: ['kunafa-cheesecake', 'date-pudding', 'almond-croissant'],
    theme: { ...WARM_THEME, titles: { desserts: 'Sweets from the Levant' } },
  },
  // French fine dining: patisserie-led, a short savoury list, premium prices.
  stay: {
    items: ['caramel-latte', 'cortado', 'cappuccino', 'latte', 'club-sandwich', 'sweet-brioche', 'caramel-biscuit-donut', 'mille-crepe', 'hazelnut-crepes', 'almond-croissant'],
    signature: ['caramel-latte', 'cortado', 'cappuccino', 'latte'],
    food: ['sweet-brioche', 'club-sandwich', 'caramel-biscuit-donut'],
    desserts: ['mille-crepe', 'hazelnut-crepes', 'almond-croissant'],
    prices: { 'caramel-latte': 32, cortado: 26, cappuccino: 28, latte: 28, 'mille-crepe': 48, 'hazelnut-crepes': 38, 'almond-croissant': 26, 'sweet-brioche': 44, 'club-sandwich': 58 },
    theme: {
      arch: '#EEF0F3',
      disc: '#9AA7B8',
      table: '#F1F2F4',
      sponges: ['#F1EFEC', '#ECEEF1', '#F3EFEA', '#EDEBEF'],
      titles: { signature: 'Maison Coffee', food: 'From the Kitchen', desserts: 'La Pâtisserie' },
    },
  },
  // Specialty roaster: all about the coffee, no kitchen, one pastry.
  nightjar: {
    items: ['espresso', 'cortado', 'iced-coffee', 'iced-shaken-espresso', 'iced-latte', 'latte', 'almond-croissant'],
    signature: ['espresso', 'cortado', 'iced-coffee', 'iced-shaken-espresso', 'iced-latte'],
    food: [],
    desserts: ['almond-croissant'],
    prices: { espresso: 16, cortado: 20, 'iced-coffee': 23 },
    theme: {
      arch: '#EFECE6',
      disc: '#6F5B4B',
      table: '#F2EFEA',
      sponges: ['#ECE5DC'],
      titles: { signature: 'House Pours', desserts: 'With your coffee' },
    },
  },
  // Neighbourhood café: drinks and bakes, no hot food.
  'morning-brew': {
    items: ['latte', 'cappuccino', 'coconut-macchiato', 'iced-latte', 'coffee-cake', 'almond-croissant', 'date-pudding'],
    signature: ['coconut-macchiato', 'latte', 'cappuccino', 'iced-latte'],
    food: [],
    desserts: ['coffee-cake', 'almond-croissant', 'date-pudding'],
    theme: { ...WARM_THEME, arch: '#F1F4EC', disc: '#9DB08A', table: '#F2F4EE', titles: { signature: 'Morning Favourites', desserts: 'Fresh from the oven' } },
  },
};

export const getMenu = (placeId?: string): MerchantMenu => (placeId && merchantMenus[placeId]) || DEFAULT_MENU;

/** A catalogue product with this merchant's price applied. */
export function menuProduct(menu: MerchantMenu, id: string): Product | undefined {
  const p = getProduct(id);
  if (!p) return undefined;
  const price = menu.prices?.[id];
  return price === undefined ? p : { ...p, price };
}

export const menuProducts = (menu: MerchantMenu, ids: string[]) =>
  ids.map((id) => menuProduct(menu, id)).filter((p): p is Product => Boolean(p));
