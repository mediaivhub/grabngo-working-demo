'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Place } from '@/data/mock';
import { useNow } from '@/lib/useNow';

/** Metres between two points (haversine). */
export function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Inside this distance of the restaurant counts as arrived. */
export const ARRIVE_M = 120;
/** Further than this, the customer isn't driving in yet (or is testing from elsewhere). */
const FAR_M = 30_000;
/** Average city speed when the phone doesn't report one: about 32 km/h. */
const CITY_MPS = 9;
/** The demo drive: from 3.2 km out (further when the kitchen waits for you), arriving in 40 seconds. */
const DEMO_FROM = 3200;
const DEMO_SECONDS = 40;
/** Metres that take `sec` seconds at city speed. */
export const metresFor = (sec: number) => sec * CITY_MPS;

export type JourneyMode = 'locating' | 'live' | 'off' | 'far' | 'demo';
export type Journey = {
  mode: JourneyMode;
  metres: number | null;
  etaSec: number | null;
  /** The demo runs sped up; this is when it really ends (ms), so the kitchen can finish in step. */
  demoEndsAt: number | null;
  startM: number;
  startDemo: () => void;
  retry: () => void;
};

/**
 * The customer's drive to the restaurant, from the phone's location.
 * Works only while the app is open (web apps can't track in the background), which is why
 * the order screen stays on during the drive. If location is off or the customer is far away,
 * a demo drive shows how it works.
 */
export function useJourney(place: Place | undefined, active: boolean, demoFrom = DEMO_FROM): Journey {
  const [fix, setFix] = useState<{ m: number; speed: number | null; first: number } | null>(null);
  const [error, setError] = useState(false);
  const [demoAt, setDemoAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const now = useNow(demoAt ? 250 : 1000);

  useEffect(() => {
    if (!active || !place || demoAt) return;
    if (!('geolocation' in navigator)) {
      const t = setTimeout(() => setError(true), 0);
      return () => clearTimeout(t);
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const m = metresBetween({ lat: pos.coords.latitude, lng: pos.coords.longitude }, place.geo);
        setError(false);
        setFix((f) => ({ m, speed: pos.coords.speed, first: f?.first ?? m }));
      },
      () => setError(true),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [active, place, demoAt, attempt]);

  const startDemo = useCallback(() => setDemoAt(Date.now()), []);
  const retry = useCallback(() => {
    setError(false);
    setAttempt((a) => a + 1);
  }, []);

  const base = { demoEndsAt: null, startDemo, retry };
  if (demoAt) {
    const t = now ? Math.min(1, (now - demoAt) / 1000 / DEMO_SECONDS) : 0;
    // Ease out: slower as you pull in, like a real arrival.
    const metres = Math.round(demoFrom * (1 - t) ** 1.6);
    return { ...base, mode: 'demo', metres, etaSec: Math.round(metres / CITY_MPS), startM: demoFrom, demoEndsAt: demoAt + DEMO_SECONDS * 1000 };
  }
  if (error && !fix) return { ...base, mode: 'off', metres: null, etaSec: null, startM: demoFrom };
  if (!fix) return { ...base, mode: 'locating', metres: null, etaSec: null, startM: demoFrom };
  if (fix.m > FAR_M) return { ...base, mode: 'far', metres: fix.m, etaSec: null, startM: fix.first };
  const speed = fix.speed && fix.speed > 2 ? fix.speed : CITY_MPS;
  return { ...base, mode: 'live', metres: fix.m, etaSec: Math.round(fix.m / speed), startM: Math.max(fix.first, fix.m) };
}

export const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
export const formatEta = (s: number) => (s < 60 ? 'Under a minute' : `${Math.round(s / 60)} min`);
