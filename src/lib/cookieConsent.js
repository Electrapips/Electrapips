// Cookie consent: storage + optional script loaders.
// Optional tracking scripts are injected ONLY after the visitor grants consent.
// Set the URLs below when you have the real analytics / marketing tags. Leaving them null loads nothing.
export const CONSENT_KEY = "ep_cookie_consent_v1";
export const CONSENT_VERSION = 1;
export const SETTINGS_EVENT = "ep:cookie-settings";

// Replace with your real script URLs when available (null = nothing is loaded)
export const ANALYTICS_SCRIPT_URL = null;
export const MARKETING_SCRIPT_URL = null;

export function readConsent() {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || c.version !== CONSENT_VERSION) return null;
    return { necessary: true, analytics: !!c.analytics, marketing: !!c.marketing, date: c.date };
  } catch (e) {
    return null;
  }
}

export function writeConsent({ analytics, marketing }) {
  const value = { version: CONSENT_VERSION, necessary: true, analytics: !!analytics, marketing: !!marketing, date: new Date().toISOString() };
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch (e) {}
  return value;
}

const loaded = new Set();
function injectScript(id, src) {
  if (!src || loaded.has(id) || document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id; s.async = true; s.src = src;
  document.head.appendChild(s);
  loaded.add(id);
}

// Called after consent is read/granted. Only consented categories load.
export function applyConsent(c) {
  if (!c) return;
  if (c.analytics) injectScript("ep-analytics", ANALYTICS_SCRIPT_URL);
  if (c.marketing) injectScript("ep-marketing", MARKETING_SCRIPT_URL);
}
