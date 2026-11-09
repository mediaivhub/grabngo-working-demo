const KEY = 'grabngo.onboarded';
const STATE_KEY = 'grabngo.state.v1';

export function hasOnboarded() {
  try {
    if (window.localStorage.getItem(KEY) === '1') return true;
    // Someone who has logged in has clearly been through the intro.
    const saved = JSON.parse(window.localStorage.getItem(STATE_KEY) ?? 'null');
    return Boolean(saved?.user);
  } catch {
    return false;
  }
}

export function setOnboarded() {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {}
}
