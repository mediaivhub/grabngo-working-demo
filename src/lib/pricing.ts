import { getAddonGroup, getProduct, SERVICE_FEE, TAX_RATE, type Product } from '@/data/mock';

export type Size = 'M' | 'L';
export type AddonSelection = Record<string, string>;

export function addonPrice(selection: AddonSelection) {
  return Object.entries(selection).reduce((sum, [groupId, optionId]) => {
    const option = getAddonGroup(groupId)?.options.find((o) => o.id === optionId);
    return sum + (option?.price ?? 0);
  }, 0);
}

export function unitPrice(product: Product, size: Size, selection: AddonSelection) {
  return round2(product.price + (size === 'L' ? product.largeExtra : 0) + addonPrice(selection));
}

export type PricedLine = { productId: string; qty: number; unitPrice: number };

export function orderTotals(lines: PricedLine[]) {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  const serviceFee = lines.length ? SERVICE_FEE : 0;
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal, serviceFee, tax, total: round2(subtotal + serviceFee + tax) };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** 28 → "28", 16.3 → "16.3", 16.39 → "16.39"; `fixed` forces two decimals (30.50). */
export function formatAmount(n: number, fixed = false) {
  return fixed ? n.toFixed(2) : String(round2(n));
}

export const productFor = (id: string) => getProduct(id);
