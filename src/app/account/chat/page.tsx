'use client';

import { Plus, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavHeader } from '@/components/ui';
import { getPlace } from '@/data/mock';
import { useStore, type Order } from '@/store/AppStore';

const QUICK_REPLIES = ['Where is my order?', 'Resend my QR code', 'I need a refund', 'Talk to a person'];

/** Canned support replies until a real chat backend is connected. */
function botReply(text: string, order?: Order) {
  const t = text.toLowerCase();
  const place = order ? getPlace(order.placeId) : undefined;
  if (/where|status|ready|order/.test(t) && !/refund/.test(t)) {
    if (!order) return 'You don’t have an active order right now. Anything else I can help with?';
    const mins = Math.max(0, Math.ceil((order.readyAt - Date.now()) / 60000));
    return mins > 0 ? `Your order ${order.id} is being prepared at ${place?.name} — about ${mins} min to go. We’ll notify you when it’s ready.` : `Your order ${order.id} is ready for pickup at ${place?.name}, ${place?.address}.`;
  }
  if (/qr/.test(t)) return 'No worries! I’ve re-sent your QR code — find it under Order Status → Show QR code.';
  if (/refund|cancel/.test(t)) return 'Sorry about that. Share your order number and what went wrong, and I’ll start the refund right away.';
  if (/person|human|agent/.test(t)) return 'Connecting you with a teammate — typical wait is under 2 minutes.';
  if (/thank/.test(t)) return 'You’re welcome! 😊 Let us know if you need anything else.';
  return 'Thanks for the message! A member of our team will reply shortly.';
}

export default function LiveChatScreen() {
  const { chat, sendChat, activeOrder } = useStore();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Braces matter: newer browsers return a Promise from scrollIntoView, which React would treat as a cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, typing]);

  const send = (value: string) => {
    const msg = value.trim();
    if (!msg) return;
    sendChat('me', msg);
    setText('');
    setShowQuick(false);
    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        sendChat('agent', botReply(msg, activeOrder));
      }, 1200),
    );
  };

  return (
    <main className="screen pt-safe pb-safe bg-surface">
      <NavHeader title="Live chat" fallback="/profile" />
      <div className="scroll flex flex-col gap-6 px-6 py-4" aria-live="polite">
        {chat.map((m) =>
          m.from === 'me' ? (
            <p key={m.id} className="relative mr-2.5 max-w-[72%] self-end rounded-[22px] rounded-tr-[10px] bg-white px-5 py-3.5 text-[18px] leading-[25px] text-muted fade-in">
              {m.text}
              <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-white" />
            </p>
          ) : (
            <p key={m.id} className="max-w-[88%] text-[18px] leading-[27px] text-muted fade-in">
              {m.text}
            </p>
          ),
        )}
        {typing && <p className="text-[14px] text-gray">Support is typing…</p>}
        <div ref={end} />
      </div>
      {showQuick && (
        <div className="hscroll gap-2 px-5 pb-2.5">
          {QUICK_REPLIES.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="h-9 shrink-0 rounded-full bg-white px-3.5 text-[14px]">
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        className="flex items-center gap-2.5 px-5 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}>
        <button type="button" aria-label="Quick replies" onClick={() => setShowQuick((s) => !s)} className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-white text-gray">
          {showQuick ? <X size={24} /> : <Plus size={26} />}
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." aria-label="Message" enterKeyHint="send" className="h-[58px] min-w-0 flex-1 rounded-full bg-white px-[22px] text-[17px] placeholder:text-gray" />
        <button type="submit" aria-label="Send" disabled={!text.trim()} className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-black text-white disabled:opacity-50">
          <Send size={22} />
        </button>
      </form>
    </main>
  );
}
