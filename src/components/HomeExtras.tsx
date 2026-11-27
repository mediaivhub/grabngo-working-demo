'use client';

import { ChevronRight, Clock, Gift, Plus, RotateCcw, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProductTile } from '@/components/cards';
import { cx, Price } from '@/components/ui';
import { getMenu, getPlace, menuProduct, places, products, type Place, type Product } from '@/data/mock';
import { openStatus } from '@/lib/hours';
import { dayPart, distanceKm, driveMinutes, readyMinutes, type DayPart } from '@/lib/pickup';
import { useNow } from '@/lib/useNow';
import { InvitationsSheet } from '@/components/Invitations';
import { invitationFor } from '@/lib/invitations';
import { orderTotals } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

/* ---------------- Smart greeting + one-tap reorder ---------------- */

function greeting(now: number | null) {
  const h = now ? new Date(now).getHours() : 12;
  return h < 5 ? 'Late night cravings' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const GREETING_LINE: Record<DayPart, string> = {
  morning: 'Coffee first?',
  midday: 'Something cold for the heat?',
  evening: 'Something sweet tonight?',
  late: 'A few places are still open near you.',
};

const USUAL_WORD: Record<DayPart, string> = { morning: 'morning', midday: 'lunch', evening: 'evening', late: 'late-night' };

export function SmartGreeting() {
  const router = useRouter();
  const now = useNow(60_000);
  const { user, orders, reorder, submitOrder, car, cards, defaultPayment, activeOrder } = useStore();
  const part = dayPart(now);
  const done = orders.filter((o) => o.status === 'completed');
  // The usual for this time of day: the latest order placed in the same part of the day.
  const last = done.find((o) => dayPart(o.createdAt) === part) ?? done[0] ?? orders[0];
  const place = last ? getPlace(last.placeId) : undefined;
  const first = last ? products.find((p) => p.id === last.lines[0]?.productId) : undefined;
  const paidLines = last ? last.lines.filter((l) => l.unitPrice > 0) : [];
  const more = paidLines.length - 1;
  const eta = place ? readyMinutes(place) : 10;
  const sameTime = !!last && dayPart(last.createdAt) === part;

  // One tap arms it, the second tap (within a few seconds) pays. No cart, no checkout.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  const card = cards.find((c) => c.id === defaultPayment);
  const method = defaultPayment === 'apple-pay' || defaultPayment === 'google-pay' ? defaultPayment : card ? 'card' : 'apple-pay';
  const payLabel = method === 'card' && card ? `•••• ${card.last4}` : method === 'google-pay' ? 'Google Pay' : 'Apple Pay';
  const total = last ? orderTotals(paidLines).total : 0;

  const go = () => {
    if (!last) return;
    if (!armed) {
      navigator.vibrate?.(8);
      return setArmed(true);
    }
    navigator.vibrate?.([10, 40, 10]);
    submitOrder(method, { placeId: last.placeId, lines: paidLines, pickup: car ? 'car' : 'counter', timing: car ? 'arrive' : 'say' });
    router.push('/order/status');
  };

  return (
    <div className="mx-5">
      <h1 className="text-[26px] font-bold leading-8 tracking-tight">
        {greeting(now)}
        {user?.nickname && user.nickname !== 'Guest' ? `, ${user.nickname}` : ''}
      </h1>
      <p className="mt-0.5 text-[15px] text-gray">{GREETING_LINE[part]}</p>

      {last && first && place && !activeOrder && (
        <div className="mt-4 overflow-hidden rounded-[24px] bg-[#141414] p-3.5 text-white">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={first.image} alt="" className="h-[66px] w-[66px] shrink-0 rounded-2xl bg-white object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{sameTime ? `Your ${USUAL_WORD[part]} usual` : 'Your usual'}</p>
              <p className="truncate text-[16px] font-semibold">
                {first.name}
                {more > 0 && <span className="font-normal text-white/60"> +{more} more</span>}
              </p>
              <p className="mt-1 truncate text-[12.5px] text-white/65">
                {car ? `Hot when you pull in · ${place.name}` : `Starts when you say · ${place.name}`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Change it first"
              onClick={() => {
                reorder(last);
                router.push('/cart');
              }}
              className="grid h-10 w-10 shrink-0 place-items-center self-start rounded-full bg-white/10 text-white/80 active:scale-95">
              <RotateCcw size={15} />
            </button>
          </div>
          <button
            type="button"
            onClick={go}
            className={cx(
              'relative mt-3.5 flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-full text-[15px] font-semibold transition-colors active:scale-[0.99]',
              armed ? 'bg-brand text-white' : 'bg-white text-ink',
            )}>
            {armed && <span key="arm" className="arm-drain absolute inset-y-0 left-0 bg-black/15" />}
            <span className="relative">
              {armed ? (
                <>
                  Tap again to pay <Price amount={total} size={15} color="currentColor" weight={700} fixed /> · {payLabel}
                </>
              ) : car ? (
                `Order it, ready as I arrive`
              ) : (
                `Order it, start when I say`
              )}
            </span>
          </button>
          <p className="mt-2 text-center text-[11.5px] text-white/45">{car ? `${place.name} starts it when you’re ${eta} min away` : `${place.name} needs about ${eta} min`}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Today's drops (stories) ---------------- */

/**
 * A merchant's story: what they're promoting today, with how many people picked it.
 * Demo data for now; merchants will post these from their portal (kind, dish, photo).
 */
export type StoryKind = 'bestseller' | 'exclusive' | 'new';
type Drop = { place: Place; dish: Product; kind: StoryKind; picks: number; postedHoursAgo: number };

export const STORY_LABEL: Record<StoryKind, string> = { bestseller: 'Best seller today', exclusive: 'Exclusive drop', new: 'New today' };

/** Stable pseudo-random number per id, so counts don't jump around between visits. */
const seeded = (id: string, min: number, max: number) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return min + (h % (max - min + 1));
};

function useDrops(): Drop[] {
  const kinds: StoryKind[] = ['bestseller', 'exclusive', 'bestseller', 'new'];
  return places
    .slice(0, 10)
    .map((place, i) => {
      const menu = getMenu(place.id);
      const id = menu.signature[0] ?? menu.desserts[0] ?? menu.items[0];
      const dish = id ? menuProduct(menu, id) : undefined;
      return dish ? { place, dish, kind: kinds[i % kinds.length], picks: seeded(place.id, 38, 240), postedHoursAgo: seeded(place.id + 'h', 1, 9) } : null;
    })
    .filter((d): d is Drop => !!d)
    .sort((a, b) => b.picks - a.picks); // most picked first
}

const STORY_MS = 5000;

export function TodaysDrops() {
  const drops = useDrops();
  const [open, setOpen] = useState<{ i: number; host: Element } | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  return (
    <>
      <div className="mt-5">
        <div className="mx-5 mb-2.5 flex items-baseline justify-between">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray">Picked today</p>
          <p className="text-[12px] text-gray">What people are ordering now</p>
        </div>
        <div className="hscroll gap-3.5 px-5 pb-1">
          {drops.map((d, i) => (
            <button key={d.place.id} type="button" onClick={(e) => setOpen({ i, host: e.currentTarget.closest('.screen') ?? document.body })} className="flex w-[70px] shrink-0 flex-col items-center gap-1.5 active:scale-95">
              <span className={cx('relative rounded-full p-[2.5px]', seen.has(d.place.id) ? 'bg-divider' : 'bg-[conic-gradient(from_200deg,#E60E0D,#FF7F7E,#FFB37A,#E60E0D)]')}>
                <span className="block rounded-full bg-white p-[2.5px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.place.image} alt="" className="h-[58px] w-[58px] rounded-full object-cover" />
                </span>
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-1.5 py-px text-[10px] font-semibold text-white ring-2 ring-white">{d.picks} today</span>
              </span>
              <span className="mt-1 w-full truncate text-center text-[11.5px] text-ink">{d.place.name.replace(/^(The|La|Le|Al) /, '')}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Rendered at the screen level so it covers the whole phone screen. */}
      {open &&
        createPortal(<StoryViewer drops={drops} start={open.i} onSeen={(id) => setSeen((s) => new Set(s).add(id))} onClose={() => setOpen(null)} />, open.host)}
    </>
  );
}

function StoryViewer({ drops, start, onSeen, onClose }: { drops: Drop[]; start: number; onSeen: (placeId: string) => void; onClose: () => void }) {
  const { addToCart } = useStore();
  const [i, setI] = useState(start);
  const [progress, setProgress] = useState(0);
  const [addedFor, setAddedFor] = useState<string | null>(null);
  const paused = useRef(false);
  const [invOpen, setInvOpen] = useState(false);
  const d = drops[i];
  const added = addedFor === d.place.id;

  useEffect(() => {
    onSeen(d.place.id);
    let raf = 0;
    let last = performance.now();
    let p = 0;
    const tick = (t: number) => {
      if (!paused.current) p += (t - last) / STORY_MS;
      last = t;
      setProgress(Math.min(1, p));
      if (p >= 1) {
        if (i < drops.length - 1) setI(i + 1);
        else onClose();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const go = (k: number) => (k < 0 ? setI(Math.max(0, i - 1)) : i < drops.length - 1 ? setI(i + 1) : onClose());

  return (
    <div
      className="absolute inset-0 z-50 bg-black text-white"
      onPointerDown={() => (paused.current = true)}
      onPointerUp={() => (paused.current = false)}
      onPointerLeave={() => (paused.current = false)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={d.place.id} src={d.place.hero} alt="" className="story-zoom absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_24%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.85)_100%)]" />

      {invOpen && (
        <div className="absolute inset-0 z-50" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onPointerLeave={(e) => e.stopPropagation()}>
        <InvitationsSheet
          only={invitationFor(d.place.id)?.id}
          onClose={() => {
            setInvOpen(false);
            paused.current = false;
          }}
        />
        </div>
      )}
      {/* progress bars */}
      <div className="absolute inset-x-3 flex gap-1" style={{ top: 'calc(var(--safe-top) + 10px)' }}>
        {drops.map((x, k) => (
          <span key={x.place.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <span className="block h-full bg-white" style={{ width: `${k < i ? 100 : k > i ? 0 : progress * 100}%` }} />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-4 flex items-center gap-2.5" style={{ top: 'calc(var(--safe-top) + 24px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.place.image} alt="" className="h-9 w-9 rounded-full border border-white/40 object-cover" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-semibold">{d.place.name}</p>
          <p className="text-[12px] text-white/70">Posted by {d.place.name} · {d.postedHoursAgo}h ago</p>
        </div>
        <button type="button" aria-label="Close" onClick={(e) => (e.stopPropagation(), onClose())} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur">
          <X size={18} />
        </button>
      </div>

      {/* tap zones: left = back, right = next */}
      <button type="button" aria-label="Previous" className="absolute bottom-40 left-0 top-24 w-1/3" onClick={() => go(-1)} />
      <button type="button" aria-label="Next" className="absolute bottom-40 right-0 top-24 w-2/3" onClick={() => go(1)} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={`p-${d.place.id}`} src={d.dish.image} alt="" className="rise-in absolute right-5 h-[120px] w-[120px] rounded-full border-4 border-white/90 bg-white object-cover shadow-2xl" style={{ bottom: 'calc(var(--safe-bottom) + 210px)' }} />
      <div key={`t-${d.place.id}`} className="pb-safe absolute inset-x-5 bottom-6">
        <p className="rise-in text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">{STORY_LABEL[d.kind]}</p>
        <p className="rise-in mt-1 text-[32px] font-bold leading-9 tracking-tight [animation-delay:80ms]">{d.dish.name}</p>
        {d.dish.tagline && <p className="rise-in mt-1.5 text-[15px] leading-5 text-white/80 [animation-delay:140ms]">{d.dish.tagline}</p>}
        <p className="rise-in mt-2.5 flex items-center gap-1.5 text-[13.5px] font-medium text-white [animation-delay:160ms]">
          <TrendingUp size={15} /> {d.picks} people picked this today
        </p>
        {invitationFor(d.place.id) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paused.current = true;
              setInvOpen(true);
            }}
            className="rise-in mt-4 flex h-9 items-center gap-2 rounded-full bg-white/15 px-3.5 text-[13.5px] font-medium backdrop-blur [animation-delay:170ms]">
            <Gift size={16} /> An invitation for you
          </button>
        )}
        <div className="rise-in mt-5 flex items-center gap-3 [animation-delay:200ms]">
          <button
            type="button"
            onClick={() => {
              addToCart({ productId: d.dish.id, placeId: d.place.id });
              setAddedFor(d.place.id);
            }}
            className={cx('flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full text-[16px] font-semibold active:scale-[0.98]', added ? 'bg-green text-white' : 'bg-white text-ink')}>
            {added ? 'Added to cart' : (
              <>
                <Plus size={18} /> Add · <Price amount={d.dish.price} size={16} color="currentColor" weight={600} />
              </>
            )}
          </button>
          <Link href={`/restaurant/${d.place.id}`} className="flex h-[52px] items-center rounded-full border border-white/40 px-5 text-[15px] font-medium backdrop-blur">
            Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hero food carousel ---------------- */

export function HeroCarousel() {
  const drops = useDrops().slice(0, 5);
  const track = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0); // fractional slide index while scrolling
  const touching = useRef(false);

  // Auto-advance every 5s unless the user is swiping.
  useEffect(() => {
    const id = setInterval(() => {
      const el = track.current;
      if (!el || touching.current) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % drops.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 5000);
    return () => clearInterval(id);
  }, [drops.length]);

  return (
    <div className="mt-5">
      <div
        ref={track}
        className="hscroll snap-x snap-mandatory"
        onScroll={(e) => setPos(e.currentTarget.scrollLeft / e.currentTarget.clientWidth)}
        onPointerDown={() => (touching.current = true)}
        onPointerUp={() => (touching.current = false)}
        onTouchStart={() => (touching.current = true)}
        onTouchEnd={() => (touching.current = false)}>
        {drops.map((d, i) => {
          const dx = i - pos;
          return (
            <Link key={d.place.id} href={`/restaurant/${d.place.id}`} className="block w-full shrink-0 snap-center px-5">
              <div className="relative h-[210px] overflow-hidden rounded-[26px] bg-[#1a1a1a]">
                {/* parallax: the photo drifts slower than the card */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.place.hero} alt="" className="absolute inset-0 h-full w-[130%] max-w-none object-cover" style={{ transform: `translateX(${Math.round(-15 + dx * 60)}px)` }} />
                <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0)_100%)]" />
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-ink backdrop-blur">
                  <Clock size={12} /> Ready in {readyMinutes(d.place)} min
                </span>
                <div className="absolute bottom-4 left-4 w-[56%] text-white">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">New at {d.place.name}</p>
                  <p className="mt-1 line-clamp-2 text-[21px] font-bold leading-[25px] tracking-tight">{d.dish.name}</p>
                </div>
                {/* the dish, in its own space on the right */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.dish.image}
                  alt=""
                  className="absolute bottom-5 right-4 h-[112px] w-[112px] rounded-full border-4 border-white/90 bg-white object-cover shadow-[0_18px_30px_-10px_rgba(0,0,0,0.6)]"
                  style={{ transform: `translateX(${Math.round(dx * -30)}px)` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {drops.map((d, i) => (
          <span key={d.place.id} className="h-1.5 rounded-full bg-ink transition-all duration-300" style={{ width: Math.round(pos) === i ? 18 : 6, opacity: Math.round(pos) === i ? 1 : 0.2 }} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Craving chips ---------------- */

const CRAVINGS: { id: string; label: string; pick: (p: Product) => boolean }[] = [
  { id: 'for-you', label: 'For you', pick: (p) => p.categories.includes('for-you') },
  { id: 'coffee', label: 'Coffee fix', pick: (p) => p.categories.includes('coffee') },
  { id: 'iced', label: 'Iced & cold', pick: (p) => p.categories.includes('cold-coffee') || p.categories.includes('not-coffee') },
  { id: 'bite', label: 'Quick bite', pick: (p) => p.categories.includes('food') && !p.foodTags.includes('sweet') },
  { id: 'sweet', label: 'Sweet tooth', pick: (p) => p.categories.includes('dessert') || p.foodTags.includes('sweet') },
  { id: 'new', label: 'New today', pick: (p) => p.categories.includes('new') },
];

const CRAVING_FOR: Record<DayPart, { id: string; title: string }> = {
  morning: { id: 'coffee', title: 'Your morning coffee' },
  midday: { id: 'iced', title: 'Something cold?' },
  evening: { id: 'sweet', title: 'Something sweet tonight?' },
  late: { id: 'bite', title: 'A late bite?' },
};

export function CravingPicks() {
  const now = useNow(60_000);
  const auto = CRAVING_FOR[dayPart(now)];
  // Follows the time of day until the customer picks a chip themselves.
  const [picked, setPicked] = useState<string | null>(null);
  const sel = picked ?? auto.id;
  const setSel = setPicked;
  const craving = CRAVINGS.find((c) => c.id === sel)!;
  const list = products.filter(craving.pick).slice(0, 10);
  return (
    <div className="mt-7">
      <h2 className="mx-5 text-[21px] text-ink">{picked ? 'What are you craving?' : auto.title}</h2>
      <div className="hscroll mt-3 gap-2 px-5">
        {CRAVINGS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSel(c.id)}
            className={cx('flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition-colors active:scale-95', sel === c.id ? 'bg-ink text-white' : 'bg-surface text-ink')}>
            {c.label}
          </button>
        ))}
      </div>
      <div key={sel} className="hscroll mt-3.5 gap-2.5 px-5">
        {list.map((p, i) => (
          <div key={p.id} className="slide-in-right shrink-0" style={{ animationDelay: `${i * 45}ms` }}>
            <ProductTile product={p} placeId={p.placeId} className="min-h-[170px] w-[122px] shrink-0" imageSize={96} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Ready fast, near you ---------------- */

/**
 * Order-ahead is about time, so this row says it plainly: places sorted by how soon
 * you could have your order in hand (the longer of the kitchen and your drive).
 */
export function ReadyFast() {
  const now = useNow(60_000);
  const list = places
    .map((p) => {
      const ready = readyMinutes(p);
      const drive = driveMinutes(p);
      return { p, ready, drive, inHand: Math.max(ready, drive), open: now ? openStatus(p.schedule, new Date(now)).open : true };
    })
    .filter((x) => x.open)
    .sort((a, b) => a.inHand - b.inHand)
    .slice(0, 6);
  if (!list.length) return null;

  return (
    <div className="mt-7">
      <div className="mx-5 flex items-end justify-between">
        <div>
          <h2 className="text-[21px] text-ink">Ready fast, near you</h2>
          <p className="mt-0.5 text-[13px] text-gray">Sorted by how soon it’s in your hands</p>
        </div>
        <Link href="/places/cafes" className="flex items-center gap-0.5 pb-0.5 text-[14px] text-gray">
          All <ChevronRight size={16} />
        </Link>
      </div>
      <div className="hscroll mt-3.5 gap-2.5 px-5">
        {list.map(({ p, inHand }, i) => (
          <Link key={p.id} href={`/restaurant/${p.id}`} className="w-[232px] shrink-0 rounded-[24px] bg-card p-2 transition active:scale-[0.98]">
            <div className="relative h-[118px] overflow-hidden rounded-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[12px] font-semibold text-ink backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-green" /> Open
              </span>
              {i === 0 && <span className="absolute right-2.5 top-2.5 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-semibold text-white">Fastest</span>}
            </div>
            <div className="px-2 pb-1.5 pt-2.5">
              <p className="truncate text-[15.5px] font-medium text-ink">{p.name}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold tabular-nums tracking-tight text-ink">{inHand} min</span>
                <span className="truncate text-[12.5px] text-gray">to pickup · {distanceKm(p)} km</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
