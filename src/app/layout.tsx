import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { FlyLayer } from '@/components/CartFly';
import { PwaRegister } from '@/components/PwaRegister';
import { Warm3D } from '@/components/car';
import { DeviceFrame } from '@/components/DeviceFrame';
import { AppStoreProvider } from '@/store/AppStore';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GrabnGo',
  applicationName: 'GrabnGo',
  description: 'Order ahead. Your food, ready when you arrive.',
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  // iPhone "Add to Home Screen": open full screen (no Safari bars) on every page.
  appleWebApp: { capable: true, title: 'GrabnGo', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  // Older iOS versions still look for the Apple-prefixed tag.
  other: { 'apple-mobile-web-app-capable': 'yes' },
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
      <head>
        {/* The 3D cars load from Sketchfab: open those connections early. */}
        <link rel="preconnect" href="https://sketchfab.com" />
        <link rel="preconnect" href="https://static.sketchfab.com" />
        <link rel="preconnect" href="https://media.sketchfab.com" crossOrigin="" />
      </head>
      <body>
        <Warm3D />
        <FlyLayer />
        <PwaRegister />
        <DeviceFrame>
          <AppStoreProvider>{children}</AppStoreProvider>
        </DeviceFrame>
      </body>
    </html>
  );
}
