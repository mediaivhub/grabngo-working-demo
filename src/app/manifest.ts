import type { MetadataRoute } from 'next';

/** Makes GrabnGo installable: added to the home screen it opens full screen, like a native app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'GrabnGo',
    short_name: 'GrabnGo',
    description: 'Order ahead. Your food, ready when you arrive.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    categories: ['food', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
