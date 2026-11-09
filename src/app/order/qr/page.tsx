'use client';

import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Button, NavHeader } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export default function QrScreen() {
  const router = useRouter();
  const { activeOrder, setOrderStatus } = useStore();
  const back = () => {
    // Staff scan the code at the counter; for the demo, leaving this screen completes the pickup.
    if (activeOrder) setOrderStatus(activeOrder.id, 'completed');
    router.replace('/home');
  };
  return (
    <main className="screen pt-safe pb-safe">
      <NavHeader title="QR code" fallback="/order/status" />
      <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
        <div className="rounded-[40px] border border-divider p-[26px]">
          <QRCodeSVG value={`grabngo:${activeOrder?.id ?? 'demo'}`} size={250} level="H" imageSettings={{ src: '/images/logo.png', height: 62, width: 62, excavate: true }} />
        </div>
        <h1 className="mt-11 text-[26px] font-bold tracking-tight">QR Code</h1>
        <p className="mt-2.5 text-[16px] leading-[23px] text-gray">This QR code ensures a secure pickup and protects your order.</p>
      </div>
      <div className="px-5 pb-3">
        <Button size="lg" onClick={back}>
          Back to home
        </Button>
      </div>
    </main>
  );
}
