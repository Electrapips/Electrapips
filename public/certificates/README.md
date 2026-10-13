# ElectraPips Certificate Generator — Source Files

Split source for the ElectraPips certificate generator: 5 certificate types
(Phase 1 Passed, Performance Trader, Payout, Total Payout, Affiliate Payout).

## File structure

```
index.html                 All 5 types in one page, switchable by tabs
phase1.html                 Phase 1 Passed only (tabs hidden, locked to this type)
performance-trader.html     Performance Trader (CML) only
payout.html                 Payout only
total-payout.html           Total Payout only
affiliate-payout.html       Affiliate Payout only
css/style.css               All styles (theme colors, layout, fonts, print rules)
js/script.js                All logic (form handling, certificate rendering, URL
                             parameter automation, Save as Image, Print)
assets/logo.png              The ElectraPips "ep" logo mark (transparent PNG)
assets/signature.png         The signatory's signature (transparent PNG)
```

Use `index.html` if you want one page where staff can pick the type from
tabs. Use the 5 individual files if you want a separate, dedicated page (and
link) per certificate type — e.g. `yoursite.com/payout.html` always opens
straight into the Payout form, with no other types visible. All 6 pages
share the same `css/style.css` and `js/script.js`, so editing either file
updates every page at once.

## Setup

Upload the whole folder to your web server, keeping the structure intact
(every HTML file references the CSS/JS/images by relative path, so `css/`,
`js/` and `assets/` must stay alongside the `.html` files). Then open
whichever page you need, e.g.:

```
https://yoursite.com/payout.html
```

No build step, no npm install, no dependencies — plain HTML/CSS/JS.

## Auto-generating certificates from your backend

Append URL parameters and the page fills itself in automatically. Add
`&embed=1` to hide the edit panel (useful for iframes or links you send
straight to a trader).

```
payout.html?name=Hodan+Ali&payout=7500&payoutno=3&program=pap&date=2026-10-01&id=EP-PO-2026-000777&embed=1
```

(On the individual per-type pages you don't need `type=...` — the page is
already locked to that type. `type=` still works if you want to override it,
or if you're using `index.html`.)

### Parameters

| Param      | Used by                  | Notes                                             |
|------------|---------------------------|----------------------------------------------------|
| `type`     | index.html (or to override)| `phase1`, `funded` (Performance Trader), `payout`, `totalpayout`, `affiliate` |
| `name`     | all                       | Trader's full name                                 |
| `size`     | phase1, funded            | Account size (USD)                                 |
| `program`  | phase1, funded, payout    | `2step`, `1step`, `pap`, `direct` (phase1 excludes `direct`) |
| `target`   | phase1                    | Profit target % (auto: 8% for 2-step, 10% for 1-step/PAP) |
| `split`    | funded                    | Profit split % (auto: 85% 2-step/1-step, 75% PAP, 50% direct) |
| `award`    | funded                    | Award level label, default `CML`                   |
| `payout`   | payout                    | Payout amount (USD)                                 |
| `payoutno` | payout                    | Payout number                                       |
| `totalamt` | totalpayout               | Cumulative payout total (USD)                        |
| `paycount` | totalpayout               | Number of payouts                                    |
| `since`    | totalpayout               | Trader-since date (YYYY-MM-DD)                       |
| `affamt`   | affiliate                 | Affiliate payout amount (USD)                        |
| `affno`    | affiliate                 | Affiliate payout number                              |
| `affid`    | affiliate                 | Affiliate ID / referral code                         |
| `date`     | all                       | Date issued (YYYY-MM-DD)                              |
| `id`       | all                       | Certificate number                                    |
| `signer`   | all                       | Signatory name (defaults to Luqman)                   |
| `title`    | all                       | Signatory title (defaults to CEO and Founder)          |
| `embed`    | all                       | `1` hides the edit panel — clean output for iframes    |
| `print`    | all                       | `1` auto-opens the print/PDF dialog on load            |

### Example: embed a Performance Trader certificate in an iframe

```html
<iframe
  src="https://yoursite.com/performance-trader.html?name=Hodan+Ali&size=200000&program=pap&award=CML&embed=1"
  style="width:100%; aspect-ratio:297/210; border:0;">
</iframe>
```

## What's built in

- **Logo** — the blue "ep" mark (`assets/logo.png`)
- **Signature** — signed "Luqman, CEO and Founder" by default (`assets/signature.png`)
- **Theme** — ElectraPips dark navy + blue (Performance Trader uses a gold/premium
  accent with a trophy icon and "AWARDED" ribbon)
- **Fonts** — Inter, Space Grotesk, JetBrains Mono (loaded from Google Fonts —
  requires internet access when the page is viewed)
- **Save as Image** — renders the certificate to a PNG via html2canvas
  (loaded from cdnjs.cloudflare.com) and downloads it through the browser
- **Print / Save as PDF** — formatted for A4 landscape

## Editing

- **Colors / theme**: CSS custom properties at the top of `css/style.css`
  (`--primary`, `--bg`, `--gold`, etc.)
- **Default signatory**: any `.html` file, search for `id="f-signer"` and
  `id="f-title"`
- **Certificate number prefixes**: `js/script.js`, search for `idPrefix`
  inside the `TYPES` object
- **Logo / signature images**: replace `assets/logo.png` and
  `assets/signature.png` directly (keep transparent PNG, similar crop)

## Requirements

- Any standard web server or static host (no backend required)
- Internet access in the visitor's browser for Google Fonts and the
  html2canvas script (both loaded from public CDNs: fonts.googleapis.com
  and cdnjs.cloudflare.com)
