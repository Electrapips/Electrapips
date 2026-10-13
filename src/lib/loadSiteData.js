import { supabase } from "./supabaseClient";

// Maps database program slugs to the canonical names the site's UI is built around.
// Any extra/legacy program rows (e.g. "2-Step Evaluation", sprint variants) are ignored
// here so they can never break the layout. Data stays in Supabase; only the mapping is local.
const CANON = {
  "two-step": "2-Step Challenge", "2-step": "2-Step Challenge",
  "one-step": "1-Step Challenge", "1-step": "1-Step Challenge",
  "pay-after-pass": "Pay After Pass",
  "direct": "Direct",
};
const ORDER = ["2-Step Challenge", "1-Step Challenge", "Pay After Pass", "Direct"];

const fmtSize = (amt) => (amt >= 1000 ? "$" + (amt / 1000).toString().replace(/\.0$/, "") + "K" : "$" + amt);
const fmtMoney = (n) => (n == null ? null : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 }));
const fmtPct = (n) => (n == null ? "None" : Number(n) + "%");

export async function loadSiteData() {
  const { data: rows, error: pErr } = await supabase
    .from("programs").select("id,slug,name,sort_order,status").eq("status", "enabled");
  if (pErr) throw pErr;

  // Keep one row per canonical program (first by sort_order), ignore unknown slugs.
  const picked = {};
  for (const p of (rows || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    const canon = CANON[p.slug];
    if (canon && !picked[canon]) picked[canon] = p;
  }
  const programs = ORDER.filter((n) => picked[n]).map((n) => ({ ...picked[n], canon: n }));
  if (!programs.length) throw new Error("No matching programs found in Supabase");

  const { data: sizes } = await supabase.from("account_sizes").select("id,amount").eq("status", "enabled");
  const { data: phases } = await supabase.from("program_phases")
    .select("program_id,phase_no,name,profit_target_pct,daily_loss_pct,max_loss_pct,min_trading_days").order("phase_no");
  const { data: rules } = await supabase.from("program_rules")
    .select("program_id,sl_required,max_risk_pct,leverage,news_trading,weekend_holding").eq("status", "published");
  const { data: prices } = await supabase.from("program_prices")
    .select("program_id,size_id,price,charged_on_pass").eq("status", "enabled");

  const sizeMap = Object.fromEntries((sizes || []).map((s) => [s.id, s.amount]));
  const cmp = [], INFO = {}, PRICES = {}, SIZES = {}, PASS = {};

  for (const p of programs) {
    const name = p.canon;
    const r = (rules || []).find((x) => x.program_id === p.id) || {};
    const ph = (phases || []).filter((x) => x.program_id === p.id).sort((a, b) => a.phase_no - b.phase_no);
    const first = ph[0] || {};
    const last = ph[ph.length - 1] || first;

    const target = ph.length > 1 ? `${fmtPct(first.profit_target_pct)} → ${fmtPct(last.profit_target_pct)}` : fmtPct(first.profit_target_pct);
    const mySizePrices = (prices || []).filter((x) => x.program_id === p.id && sizeMap[x.size_id] != null);
    const sizeLabels = mySizePrices.map((x) => fmtSize(sizeMap[x.size_id]))
      .sort((a, b) => parseFloat(a.replace(/[$K]/g, "")) - parseFloat(b.replace(/[$K]/g, "")));

    cmp.push({
      n: name,
      s: sizeLabels.length ? sizeLabels[0] + " – " + sizeLabels[sizeLabels.length - 1] : "",
      t: target,
      d: fmtPct(first.daily_loss_pct),
      m: fmtPct(first.max_loss_pct),
      l: r.leverage || "—",
      x: r.sl_required ? "Stop Loss required at all times" + (r.max_risk_pct ? ` · Max ${r.max_risk_pct}% risk/trade` : "")
        : (first.min_trading_days ? `${first.min_trading_days} minimum trading days` : "Unlimited period"),
    });

    INFO[name] = { phases: ph.map((x) => ({ n: x.phase_no, t: x.name, b: "EVALUATION", d: x.profit_target_pct != null ? `Target: ${x.profit_target_pct}% profit` : "No profit target" })) };
    SIZES[name] = sizeLabels;
    PRICES[name] = {};
    mySizePrices.forEach((x) => { PRICES[name][fmtSize(sizeMap[x.size_id])] = fmtMoney(x.price); });
    if (p.slug === "pay-after-pass") {
      mySizePrices.forEach((x) => { if (x.charged_on_pass != null) PASS[fmtSize(sizeMap[x.size_id])] = fmtMoney(x.charged_on_pass); });
    }
  }
  const { data: faqRows } = await supabase.from("content_items")
    .select("title,body,category").eq("type", "faq").eq("status", "published").order("updated_at", { ascending: true });
  const faqs = (faqRows || []).map((r) => [r.title, r.body, r.category || "General"]);
  return { cmp, INFO, PRICES, SIZES, PASS, faqs };
}
