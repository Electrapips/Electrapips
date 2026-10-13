import { supabase } from "./supabaseClient";

// Loads ONLY the signed-in trader's rows. Supabase RLS enforces ownership on every table below.
export async function loadPortalData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null };
  const q = (t) => supabase.from(t).select("*");
  const [accs, mets, progs, sizes, phases, trs, pays, profs, eqs, viols, certs, affs, offs] = await Promise.all([
    q("trading_accounts"), q("account_metrics"), q("programs"), q("account_sizes"),
    q("program_phases").order("phase_no"), q("trades").order("close_time", { ascending: false, nullsFirst: false }),
    q("payouts").order("requested_at", { ascending: false }), q("profiles").eq("id", user.id).maybeSingle(),
    q("equity_snapshots").order("ts", { ascending: true }), q("rule_violations"),
    q("certificates").order("issued_at", { ascending: false }), q("affiliates").eq("trader_id", user.id).maybeSingle(),
    q("offers").eq("status", "active").order("created_at", { ascending: false }),
  ]);
  let refs = { data: [] }, comms = { data: [] };
  if (affs.data) {
    [refs, comms] = await Promise.all([
      supabase.from("affiliate_referrals").select("*").eq("affiliate_id", affs.data.id).order("created_at", { ascending: false }),
      supabase.from("affiliate_commissions").select("*").eq("affiliate_id", affs.data.id),
    ]);
  }
  return {
    user, profile: profs.data, accounts: accs.data || [], metrics: mets.data || [], programs: progs.data || [],
    sizes: sizes.data || [], phases: phases.data || [], trades: trs.data || [], payouts: pays.data || [],
    equity: eqs.data || [], violations: viols.data || [], certs: certs.data || [], affiliate: affs.data || null,
    referrals: refs.data || [], commissions: comms.data || [], offers: offs.data || [],
  };
}

export const EMPTY_VIEW = null; // pages show their own empty states when view is null

const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctOf = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const dayKey = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const durStr = (a, b) => {
  if (!a || !b) return "—";
  const m = Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
  return Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m";
};
const plOf = (t) => Number(t.profit || 0) + Number(t.swap || 0) + Number(t.commission || 0);

function linePath(points, w = 400, h = 170) {
  if (!points.length) return "";
  const ys = points.map((p) => p.y);
  const min = Math.min(...ys), max = Math.max(...ys), span = max - min || 1;
  return points.map((p, i) => {
    const x = points.length === 1 ? w : (i / (points.length - 1)) * w;
    const y = h - ((p.y - min) / span) * (h - 20) - 10;
    return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }).join(" ");
}


function accountCharts(rows, start) {
  const make = (days) => {
    const cutoff = days ? Date.now() - days * 86400000 : 0;
    const r = rows.filter((x) => x.t >= cutoff);
    if (!r.length) return null;
    const pl = r.map((x) => x.eq - start);
    const all = [...r.map((x) => x.bal), ...r.map((x) => x.eq), ...pl];
    const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
    const toPath = (vals) => vals.map((v, i) => {
      const x = r.length === 1 ? 400 : (i / (r.length - 1)) * 400;
      const y = 170 - ((v - min) / span) * 150 - 10;
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    return { balance: toPath(r.map((x) => x.bal)), equity: toPath(r.map((x) => x.eq)), pl: toPath(pl) };
  };
  return { "7D": make(7), "30D": make(30), "90D": make(90), "All Time": make(0) };
}


// Payout schedule & eligibility per account (rules: first payout after first trade, then every 7 days for Direct, weekly for others)
const PAYOUT_RULES = {
  "Direct": { firstDays: 7, shares: [50, 65, 75] },
  "2-Step Challenge": { firstDays: 14, shares: [85, 85, 90] },
  "1-Step Challenge": { firstDays: 14, shares: [85, 85, 90] },
  "Pay After Pass": { firstDays: 21, shares: [75] },
};
function payoutInfo(a, d, pName, profit) {
  const base = PAYOUT_RULES[pName[a.program_id]] || PAYOUT_RULES["2-Step Challenge"];
  const wait = a.payout_wait_days ? Number(a.payout_wait_days) : null; // admin override per account
  const rule = { ...base, firstDays: wait ?? base.firstDays, interval: wait ?? 7 };
  const trs = d.trades.filter((t) => t.account_id === a.id && t.open_time);
  const firstTrade = trs.length ? new Date(Math.min(...trs.map((t) => new Date(t.open_time).getTime()))) : null;
  const reqs = d.payouts.filter((p) => p.account_id === a.id && !["rejected", "cancelled"].includes(String(p.status).toLowerCase()));
  const count = reqs.length;
  const share = rule.shares[Math.min(count, rule.shares.length - 1)];
  const already = reqs.reduce((s2, p) => s2 + Number(p.requested_amount || 0), 0);
  const withdrawable = Math.max(0, Math.round((Math.max(0, profit) * share / 100 - already) * 100) / 100);
  let nextAt = null;
  if (firstTrade) {
    if (count === 0) nextAt = new Date(firstTrade.getTime() + rule.firstDays * 86400000);
    else nextAt = new Date(Math.max(...reqs.map((p) => new Date(p.requested_at).getTime())) + rule.interval * 86400000);
  }
  const dayReached = !!nextAt && Date.now() >= nextAt.getTime();
  const profitOk = profit > 25;
  const st = String(a.status || "").toUpperCase();
  const eligible = (st === "ACTIVE" || st === "PASSED") && dayReached && profitOk && withdrawable > 0;
  let reason = "";
  if (!firstTrade) reason = "No trades yet";
  else if (!profitOk) reason = "Profit must be above $25";
  else if (!dayReached) reason = "Payout day not reached";
  else if (withdrawable <= 0) reason = "Nothing available";
  return {
    profitShare: share,
    withdrawable,
    nextPayoutAt: nextAt ? nextAt.toISOString() : null,
    payoutEligible: eligible,
    payoutReason: eligible ? "" : reason,
  };
}

export function buildView(d) {
  if (!d || !d.user) return null;
  const pName = Object.fromEntries(d.programs.map((p) => [p.id, p.name]));
  const sAmt = Object.fromEntries(d.sizes.map((s) => [s.id, Number(s.amount)]));
  const mBy = Object.fromEntries(d.metrics.map((m) => [m.account_id, m]));
  const phOf = (programId, label) => {
    const list = d.phases.filter((p) => p.program_id === programId);
    return list.find((p) => p.name === label) || list[0] || {};
  };
  const name = d.profile?.full_name || d.user.email || "Trader";
  const ID = d.profile?.id ? "JS-" + String(d.user.id).slice(0, 4).toUpperCase() : "";

  // ---- accounts (+ their open / closed trades) ----
  const openAll = d.trades.filter((t) => t.status === "open");
  const closedAll = d.trades.filter((t) => t.status === "closed");
  const accounts = [...d.accounts].filter((a) => String(a.status || "").toLowerCase() !== "removed")
    .sort((x, y) => new Date(y.created_at || 0) - new Date(x.created_at || 0)).map((a) => {
    const m = mBy[a.id] || {};
    const size = sAmt[a.size_id] || 0;
    const ph = phOf(a.program_id, a.phase_label);
    const bal = Number(m.balance ?? a.start_balance ?? 0);
    const eq = Number(m.equity ?? bal);
    const profit = Number(m.profit ?? bal - Number(a.start_balance || 0));
    const rules = d.programs.find((p) => p.id === a.program_id) || {};
    return {
      id: a.account_number || a.id, rowId: a.id,
      program: pName[a.program_id] || "", size: "$" + size.toLocaleString(), sizeNum: size,
      phase: a.phase_label || ph.name || null, status: String(a.status || "").toUpperCase(),
      balance: bal, equity: eq, profit, floating: Number(m.floating_pl ?? 0),
      dailyDD: Number(m.daily_dd_pct ?? 0), dailyDDMax: Number(ph.daily_loss_pct ?? 0),
      maxDD: Number(m.max_dd_pct ?? 0), maxDDMax: Number(ph.max_loss_pct ?? 0),
      target: ph.profit_target_pct ?? null,
      targetProgress: ph.profit_target_pct && size ? Math.max(0, (profit / size) * 100) : null,
      days: Number(m.trading_days ?? 0), minDays: Number(ph.min_trading_days ?? 0),
      dailyLimitPct: ph.daily_loss_pct, maxLimitPct: ph.max_loss_pct, leverage: rules.name ? null : null,
      openedAt: a.created_at,
      archived: !!a.archived_at,
      ...payoutInfo(a, d, pName, profit),
      rawStatus: String(a.status || "").toLowerCase(),
      charts: accountCharts(
        d.equity.filter((r) => r.account_id === a.id).map((r) => ({ t: new Date(r.ts).getTime(), bal: Number(r.balance), eq: Number(r.equity) })),
        Number(a.start_balance || 0)
      ),
    };
  });
  const accById = Object.fromEntries(accounts.map((a) => [a.rowId, a]));

  // ---- trades ----
  const mapTrade = (t) => ({
    id: t.id, accountId: t.account_id, symbol: t.symbol, dir: String(t.side || "").toUpperCase(),
    lot: Number(t.volume || 0), entry: Number(t.open_price || 0), exit: t.close_price != null ? Number(t.close_price) : null,
    sl: t.sl, tp: t.tp, current: t.close_price != null ? Number(t.close_price) : null,
    pl: plOf(t), openTime: t.open_time, closeTime: t.close_time, riskPct: t.risk_pct,
    dur: durStr(t.open_time, t.close_time), date: t.close_time ? new Date(t.close_time).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—",
  });
  const openTrades = openAll.map(mapTrade);
  const closedTrades = closedAll.map(mapTrade);
  const trades = closedTrades.slice(0, 10);

  // ---- stats (closed trades) ----
  const wins = closedTrades.filter((t) => t.pl > 0), losses = closedTrades.filter((t) => t.pl < 0);
  const sumW = wins.reduce((s, t) => s + t.pl, 0), sumL = losses.reduce((s, t) => s + t.pl, 0);
  const avgW = wins.length ? sumW / wins.length : 0, avgL = losses.length ? sumL / losses.length : 0;
  const holds = closedTrades.filter((t) => t.openTime && t.closeTime).map((t) => (new Date(t.closeTime) - new Date(t.openTime)) / 60000);
  const avgHold = holds.length ? holds.reduce((s, x) => s + x, 0) / holds.length : 0;
  const stats = [
    ["Total Trades", String(d.trades.length)],
    ["Winning Trades", String(wins.length)],
    ["Losing Trades", String(losses.length)],
    ["Win Rate", closedTrades.length ? pctOf(wins.length, closedTrades.length) + "%" : "—"],
    ["Average Win", wins.length ? money(avgW) : "—"],
    ["Average Loss", losses.length ? "−" + money(Math.abs(avgL)) : "—"],
    ["Largest Win", wins.length ? money(Math.max(...wins.map((t) => t.pl))) : "—"],
    ["Largest Loss", losses.length ? "−" + money(Math.abs(Math.min(...losses.map((t) => t.pl)))) : "—"],
    ["Profit Factor", losses.length && sumL ? (sumW / Math.abs(sumL)).toFixed(2) : "—"],
    ["Average R:R", avgL ? "1:" + (avgW / Math.abs(avgL)).toFixed(2) : "—"],
    ["Avg. Holding Time", holds.length ? Math.floor(avgHold / 60) + "h " + String(Math.round(avgHold % 60)).padStart(2, "0") + "m" : "—"],
  ];

  // ---- pairs ----
  const bySym = {};
  d.trades.forEach((t) => { bySym[t.symbol] = bySym[t.symbol] || { n: 0, pl: 0 }; bySym[t.symbol].n++; if (t.status === "closed") bySym[t.symbol].pl += plOf(t); });
  const totalN = d.trades.length || 1;
  const topPairs = Object.entries(bySym).sort((a, b) => b[1].n - a[1].n).slice(0, 3).map(([s, v]) => [s, v.n, Math.round((v.n / totalN) * 1000) / 10]);
  const bestPairs = Object.entries(bySym).filter(([, v]) => v.pl !== 0).sort((a, b) => b[1].pl - a[1].pl).slice(0, 3).map(([s, v]) => [s, v.pl]);

  // ---- per-day aggregation (closed trades by close date) ----
  const byDay = {};
  closedTrades.forEach((t) => { const k = dayKey(t.closeTime); if (!k) return; byDay[k] = byDay[k] || { n: 0, pl: 0, w: 0 }; byDay[k].n++; byDay[k].pl += t.pl; if (t.pl > 0) byDay[k].w++; });
  const dayRows = Object.entries(byDay).map(([k, v]) => ({ date: k, ...v, winRate: v.n ? Math.round((v.w / v.n) * 100) : 0 }));
  const fmtDay = (k) => new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const best = dayRows.slice().sort((a, b) => b.pl - a.pl)[0], worst = dayRows.slice().sort((a, b) => a.pl - b.pl)[0];
  const bestDay = best ? { date: fmtDay(best.date), pl: best.pl, trades: best.n, winRate: best.winRate } : null;
  const worstDay = worst ? { date: fmtDay(worst.date), pl: worst.pl, trades: worst.n, winRate: worst.winRate } : null;

  // activity heat for the current month
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
  const dim = new Date(y, mo + 1, 0).getDate();
  const activity = Array.from({ length: dim }, (_, i) => {
    const k = `${y}-${String(mo + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    const v = byDay[k];
    return { day: i + 1, trades: v ? v.n : 0, pl: v ? v.pl : 0, win: v && v.n ? Math.round((v.w / v.n) * 100) : 0 };
  });

  // ---- discipline (analytics from real trades + violations) ----
  const allN = d.trades.length || 0;
  const withSL = d.trades.filter((t) => t.sl != null).length;
  const risks = d.trades.filter((t) => t.risk_pct != null).map((t) => Number(t.risk_pct));
  const within1 = risks.filter((r) => r <= 1).length;
  const tradeDays = Object.keys(d.trades.reduce((o, t) => { const k = dayKey(t.open_time); if (k) o[k] = 1; return o; }, {})).length;
  const violDays = new Set(d.violations.filter((v) => v.rule === "daily_loss_limit").map((v) => dayKey(v.detected_at))).size;
  const overDays = Object.values(d.trades.reduce((o, t) => { const k = dayKey(t.open_time); if (k) o[k] = (o[k] || 0) + 1; return o; }, {})).filter((n) => n > 20).length;
  const discipline = allN ? [
    ["Risk Consistency", risks.length ? pctOf(within1, risks.length) : 0],
    ["Daily Risk Control", tradeDays ? Math.max(0, 100 - pctOf(violDays, tradeDays)) : 0],
    ["Stop Loss Usage", pctOf(withSL, allN)],
    ["Rule Adherence", Math.max(0, 100 - pctOf(d.violations.length, allN))],
    ["Overtrading Control", tradeDays ? Math.max(0, 100 - pctOf(overDays, tradeDays)) : 0],
  ] : [];
  const avgRisk = risks.length ? (risks.reduce((s, x) => s + x, 0) / risks.length).toFixed(2) + "%" : "—";
  const avgLots = allN ? (d.trades.reduce((s, t) => s + Number(t.volume || 0), 0) / allN).toFixed(2) + " lots" : "—";

  // ---- chart (equity over time; All accounts, or the first account) ----
  const eqRows = d.equity.map((r) => ({ t: new Date(r.ts).getTime(), eq: Number(r.equity), bal: Number(r.balance) }));
  const cutoff = (days) => (days ? Date.now() - days * 86400000 : 0);
  const series = (days) => eqRows.filter((r) => r.t >= cutoff(days)).map((r) => ({ y: r.eq }));
  const chart = { "7D": linePath(series(7)), "30D": linePath(series(30)), "90D": linePath(series(90)), "All Time": linePath(series(0)) };
  const first = eqRows[0], last = eqRows[eqRows.length - 1];
  const chartStats = {
    totalProfit: last && first ? money(last.eq - first.eq) : "—",
    avgDaily: dayRows.length ? money(dayRows.reduce((s, r) => s + r.pl, 0) / dayRows.length) : "—",
    best: bestDay ? money(bestDay.pl) : "—",
    worst: worstDay ? money(worstDay.pl) : "—",
  };

  // ---- withdrawals / payouts ----
  const withdrawals = d.payouts.map((p) => ({
    date: fmtDate(p.requested_at), amount: Number(p.requested_amount || 0),
    method: "USDT (TRC20)", status: String(p.status || "pending").charAt(0).toUpperCase() + String(p.status || "pending").slice(1),
    raw: String(p.status || "").toLowerCase(),
  }));
  const paid = withdrawals.filter((w) => w.raw === "paid");
  const pending = withdrawals.filter((w) => !["paid", "rejected"].includes(w.raw));
  const available = d.payouts.filter((p) => ["eligible", "approved"].includes(String(p.status).toLowerCase())).reduce((s, p) => s + Number(p.eligible_amount || p.requested_amount || 0), 0);

  // ---- certificates ----
  const certs = d.certs.map((c) => ({ type: c.cert_type, certNo: c.certificate_no, date: fmtDate(c.issued_at), issuedAt: c.issued_at, name, ...(c.data || {}) }));

  // ---- affiliate ----
  const affiliate = d.affiliate ? {
    code: d.affiliate.code, status: d.affiliate.status,
    registrations: d.referrals.length,
    paid: d.commissions.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount || 0), 0),
    pending: d.commissions.filter((c) => c.status !== "paid").reduce((s, c) => s + Number(c.amount || 0), 0),
    history: d.referrals.map((r) => {
      const c = d.commissions.filter((x) => x.referral_id === r.id);
      return { date: fmtDate(r.created_at), commission: money(c.reduce((s, x) => s + Number(x.amount || 0), 0)), status: c.length && c.every((x) => x.status === "paid") ? "Paid" : "Pending" };
    }),
  } : null;

  return {
    user: d.user, profile: { name, id: ID, email: d.user.email },
    accounts, openTrades, closedTrades, accById, trades, withdrawals, certs, affiliate,
    offers: d.offers.map((o) => ({ title: o.title, description: o.description, discount: o.discount_pct, cta: o.cta_text || "Claim Offer", url: o.cta_url, endsAt: o.ends_at ? fmtDate(o.ends_at) : null })),
    summary: {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((a) => a.status === "ACTIVE").length,
      totalCapital: accounts.reduce((s, a) => s + a.sizeNum, 0),
      totalProfit: accounts.reduce((s, a) => s + a.profit, 0),
      totalWithdrawn: paid.reduce((s, w) => s + w.amount, 0),
      availableWithdrawal: available,
      pendingWithdrawal: pending.reduce((s, w) => s + w.amount, 0),
      lastWithdrawal: withdrawals[0] ? withdrawals[0].amount : 0,
      totalTrades: d.trades.length,
      winRate: closedTrades.length ? pctOf(wins.length, closedTrades.length) : 0,
    },
    stats, topPairs, bestPairs, discipline, activity, bestDay, worstDay, chart, chartStats, avgRisk, avgLots,
  };
}
