/** Resolves once the browser's location prompt is answered (or fails / times out). */
export function requestLocation() {
  return new Promise<void>((resolve) => {
    if (!('geolocation' in navigator)) return resolve();
    navigator.geolocation.getCurrentPosition(
      () => resolve(),
      () => resolve(),
      { timeout: 15000 },
    );
  });
}
