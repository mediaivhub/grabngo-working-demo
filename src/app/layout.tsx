import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { DeviceFrame } from '@/components/DeviceFrame';
import { AppStoreProvider } from '@/store/AppStore';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GrabnGo',
  description: 'Order ahead. Your food, ready when you arrive.',
  icons: { icon: '/favicon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <DeviceFrame>
          <AppStoreProvider>{children}</AppStoreProvider>
        </DeviceFrame>
      </body>
    </html>
  );
}
