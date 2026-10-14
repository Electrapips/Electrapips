import React, { useEffect, useState } from "react";
import { readConsent, writeConsent, applyConsent, SETTINGS_EVENT } from "./lib/cookieConsent";

export default function CookieConsent() {
  const [banner, setBanner] = useState(false);
  const [modal, setModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // On load: if consent exists, apply it (loads only consented scripts). Otherwise show the banner.
  useEffect(() => {
    const c = readConsent();
    if (c) { applyConsent(c); setAnalytics(c.analytics); setMarketing(c.marketing); }
    else setBanner(true);
    const open = () => {
      const cur = readConsent();
      setAnalytics(cur ? cur.analytics : false);
      setMarketing(cur ? cur.marketing : false);
      setModal(true);
    };
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => { if (e.key === "Escape") setModal(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modal]);

  const save = (a, m) => {
    const c = writeConsent({ analytics: a, marketing: m });
    applyConsent(c);
    setBanner(false);
    setModal(false);
  };

  return (
    <>
      {banner && (
        <div className="cc-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <div className="cc-banner-inner">
            <div className="cc-text">
              <h3>We use cookies</h3>
              <p>We use cookies to improve your experience, understand how our website is used, and provide relevant functionality. You can manage your cookie preferences at any time.</p>
            </div>
            <div className="cc-actions">
              <button type="button" className="btn btn-ghost cc-btn" onClick={() => save(false, false)}>Reject All</button>
              <button type="button" className="btn btn-ghost cc-btn" onClick={() => { setBanner(false); setModal(true); }}>Cookie Settings</button>
              <button type="button" className="btn btn-primary cc-btn" onClick={() => save(true, true)}>Accept All</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="cc-overlay" onClick={() => setModal(false)}>
          <div className="cc-modal" role="dialog" aria-modal="true" aria-labelledby="cc-title" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-head">
              <h3 id="cc-title">Cookie Settings</h3>
              <button type="button" className="cc-close" aria-label="Close" onClick={() => setModal(false)}>×</button>
            </div>
            <p className="cc-modal-intro">Choose which cookies you allow. Necessary cookies are always on because the website cannot work without them.</p>

            <div className="cc-cat">
              <div className="cc-cat-text"><b>Necessary Cookies</b><span>Required for essential website functionality such as security, navigation and remembering your cookie choice. These cannot be disabled.</span></div>
              <span className="cc-always">Always on</span>
            </div>

            <div className="cc-cat">
              <div className="cc-cat-text"><b>Analytics Cookies</b><span>Help us understand website traffic and how visitors use the site. Off until you consent.</span></div>
              <label className="pt-switch" aria-label="Analytics cookies"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)}/><i/></label>
            </div>

            <div className="cc-cat">
              <div className="cc-cat-text"><b>Marketing Cookies</b><span>Used for marketing and advertising purposes. Off until you consent.</span></div>
              <label className="pt-switch" aria-label="Marketing cookies"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)}/><i/></label>
            </div>

            <div className="cc-modal-actions">
              <button type="button" className="btn btn-ghost cc-btn" onClick={() => save(false, false)}>Reject All</button>
              <button type="button" className="btn btn-ghost cc-btn" onClick={() => save(analytics, marketing)}>Save Preferences</button>
              <button type="button" className="btn btn-primary cc-btn" onClick={() => save(true, true)}>Accept All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
