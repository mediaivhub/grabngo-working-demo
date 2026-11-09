import { places, products, type Place, type Product } from '@/data/mock';
import type { SearchFilters } from '@/store/AppStore';

// Words that mean a kind of place or menu section rather than a name.
const CAFE_WORDS = ['cafe', 'café', 'cafes', 'coffee', 'coffees'];
const RESTAURANT_WORDS = ['restaurant', 'restaurants', 'food', 'dining'];
const STOP_WORDS = ['and', '&', 'the', 'or', 'with'];

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function tokens(query: string) {
  return normalize(query)
    .split(/[\s,]+/)
    .filter((t) => t && !STOP_WORDS.includes(t));
}

function productMatches(p: Product, t: string) {
  if (normalize(p.name).includes(t)) return true;
  if (CAFE_WORDS.includes(t)) return p.categories.some((c) => c === 'coffee' || c === 'cold-coffee');
  if (RESTAURANT_WORDS.includes(t)) return p.categories.includes('food');
  return p.foodTags.some((tag) => tag.startsWith(t));
}

function placeMatches(p: Place, t: string) {
  if (normalize(p.name).includes(t)) return true;
  if (CAFE_WORDS.includes(t)) return p.kind === 'cafe' || normalize(p.name).includes('coffee');
  if (RESTAURANT_WORDS.includes(t)) return p.kind === 'restaurant';
  // A place matches if it serves a matching dish (every place shares the demo menu).
  return products.some((prod) => normalize(prod.name).includes(t));
}

function productPasses(p: Product, f: SearchFilters) {
  if (f.minPrice !== null && p.price < f.minPrice) return false;
  if (f.maxPrice !== null && p.price > f.maxPrice) return false;
  if (f.foodTag && !p.foodTags.includes(f.foodTag)) return false;
  return true;
}

/** Items that match any query word, filtered by price/category. Empty query → popular items. */
export function searchProducts(query: string, f: SearchFilters) {
  const ts = tokens(query);
  const byPopularity = (a: Product, b: Product) => b.ratings - a.ratings;
  if (!ts.length) return [...products].sort(byPopularity).filter((p) => productPasses(p, f));
  // Direct name hits first, then category/synonym hits; most popular first within each.
  const nameHit = (p: Product) => ts.some((t) => normalize(p.name).includes(t));
  return products
    .filter((p) => ts.some((t) => productMatches(p, t)) && productPasses(p, f))
    .sort((a, b) => Number(nameHit(b)) - Number(nameHit(a)) || byPopularity(a, b));
}

/** Places that match any query word, filtered by rating. */
export function searchPlaces(query: string, f: SearchFilters) {
  const ts = tokens(query);
  const base = ts.length ? places.filter((p) => ts.some((t) => placeMatches(p, t))) : places;
  return base.filter((p) => f.minRating === null || p.rating >= f.minRating);
}

export const filtersActive = (f: SearchFilters) =>
  f.minPrice !== null || f.maxPrice !== null || f.foodTag !== null || f.minRating !== null;

export const countLabel = (n: number) => `${String(n).padStart(2, '0')} Results found`;
