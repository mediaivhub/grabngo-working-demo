'use client';

import { BellRing, Coffee, Laptop } from 'lucide-react';
import { Fragment } from 'react';
import { NavHeader } from '@/components/ui';
import { useStore } from '@/store/AppStore';

const ICON = { 'bell-check': BellRing, cup: Coffee, laptop: Laptop } as const;

export default function NotificationsScreen() {
  const { notifications } = useStore();
  const days = [...new Set(notifications.map((n) => n.day))];
  return (
    <main className="screen pt-safe bg-surface">
      <NavHeader title="Notifications" />
      <div className="scroll pb-safe px-5 pt-1.5">
        {days.map((day) => (
          <Fragment key={day}>
            <p className="mx-auto my-[18px] w-fit rounded-full bg-card px-3.5 py-2 text-[14px] text-gray">{day}</p>
            <div className="flex flex-col gap-1.5">
              {notifications
                .filter((n) => n.day === day)
                .map((n) => {
                  const Icon = ICON[n.icon];
                  return (
                    <div key={n.id} className="flex items-end gap-2.5">
                      <span className="mb-2 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#E6E6E4]">
                        <Icon size={19} />
                      </span>
                      <div className="flex-1 rounded-[22px] bg-white p-[18px]">
                        <div className="flex justify-between gap-2">
                          <p className="text-[16px] font-medium">{n.title}</p>
                          <span className="text-[14px] text-gray">{n.time}</span>
                        </div>
                        {n.big && <p className="mt-2 text-[42px] font-extrabold tracking-tight">{n.big}</p>}
                        {n.body && <p className="mt-1.5 text-[16px] leading-[22px] text-gray">{n.body}</p>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Fragment>
        ))}
      </div>
    </main>
  );
}
