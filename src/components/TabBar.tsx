'use client';

import { House, Map, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/home', label: 'Home', Icon: House },
  { href: '/map', label: 'Map', Icon: Map },
  { href: '/orders', label: 'Orders', Icon: ShoppingBasket },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="pb-safe flex bg-black px-10 pt-[18px]" aria-label="Main">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex flex-1 flex-col items-center gap-1.5 ${active ? 'text-white' : 'text-[#8A8A8A]'}`}>
            <Icon size={26} fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 1.5 : 1.8} />
            <span className="text-[15px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
