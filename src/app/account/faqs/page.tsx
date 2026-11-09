'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cx, NavHeader, SectionChevron } from '@/components/ui';

const FAQS = [
  { q: 'How do I place a pickup order?', a: 'Browse items, add to cart, and tap Confirm Pickup.' },
  { q: 'Where do I pick up my order?', a: 'At the restaurant’s pickup counter. Open Order Status → Open in Maps for directions.' },
  { q: 'Can I change or cancel my order?', a: 'You can cancel from Live Chat until the restaurant starts preparing it.' },
  { q: 'How do I request a refund?', a: 'Open Live Chat from your profile and share your order number — we’ll sort it out.' },
  { q: 'How will I know my order is ready?', a: 'We send a notification and your Home screen shows a live countdown until pickup.' },
  { q: 'Can I save restaurants for later?', a: 'Yes — tap the heart on any restaurant to add it to Favorite Restaurants.' },
  { q: 'Is my card information secure?', a: 'Card details are encrypted and only the last four digits are stored on your device.' },
];

export default function FaqsScreen() {
  const [open, setOpen] = useState(0);
  return (
    <main className="screen pt-safe">
      <NavHeader title="FAQs" fallback="/profile" />
      <div className="scroll pb-safe px-5 pb-10">
        <p className="mb-2 mt-5 text-[15px] font-medium text-gray">Frequently Asked Questions</p>
        {FAQS.map((f, i) => {
          const expanded = open === i;
          return (
            <button key={f.q} type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : i)} className="flex w-full items-start gap-4 text-left">
              <HelpCircle size={25} strokeWidth={1.6} className="mt-[17px] shrink-0" />
              <span className={cx('flex-1 py-[18px]', i > 0 && 'border-t border-divider')}>
                <span className="flex items-center justify-between gap-2.5">
                  <span className="text-[17px]">{f.q}</span>
                  <SectionChevron open={expanded} />
                </span>
                {expanded && <span className="mt-2 block max-w-[260px] text-[15px] leading-[21px] text-gray fade-in">{f.a}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
