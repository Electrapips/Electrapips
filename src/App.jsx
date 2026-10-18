
import React,{useEffect,useState,useRef} from "react";
import { loadSiteData } from "./lib/loadSiteData";
import CookieConsent from "./CookieConsent.jsx";
import { supabase } from "./lib/supabaseClient";
import { loadPortalData, buildView, EMPTY_VIEW } from "./lib/portalData";
import {ShieldCheck,Layers,Target,Globe,Compass,TrendingUp,Zap,Check,X,Wallet,Clock,Repeat,ArrowRight,CreditCard,Rocket,Star,Info,RotateCcw,ChevronDown,MessageCircle,User,Search,Mail,Lock,Eye,EyeOff,Send,Trophy,UserPlus,Share2,LifeBuoy,Users,LayoutDashboard,Award,Gift,Copy,ArrowDownToLine,ArrowUpRight,ArrowDownRight,CheckCircle2,XCircle,Timer,Tag,LogOut,Bell,Download,QrCode,Percent,FileText,BarChart3,Settings,Upload,Phone,Globe2,Smartphone} from "lucide-react";
import { HashRouter, Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import "./styles.css";
import {siInstagram,siX,siYoutube,siTelegram,siFacebook,siTiktok,siDiscord,siWhatsapp} from "simple-icons";
import logo from "./logo.jpg";
import proof1 from "./proofs/EP-PO-2026-000123__1_.jpg";
import proof2 from "./proofs/EP-PO-2026-000124.jpg";
import proof3 from "./proofs/EP-PO-2026-000125.jpg";
import proof4 from "./proofs/EP-PO-2026-000126.jpg";
import proof5 from "./proofs/EP-PO-2026-000127.jpg";
import proof6 from "./proofs/EP-PO-2026-000128.jpg";
import proof7 from "./proofs/EP-PO-2026-000130.jpg";
import proof8 from "./proofs/EP-PO-2026-000132.jpg";
import proof9 from "./proofs/EP-PO-2026-000133.jpg";

const programs = [
  {name:"2-Step Challenge", tag:"01 / CHALLENGE", size:"$2.5K — $100K", bullets:["Phase 1: 8% target","Phase 2: 5% target","5% daily loss","10% max drawdown","1:100 leverage"]},
  {name:"1-Step Challenge", tag:"02 / CHALLENGE", size:"$2.5K — $100K", bullets:["10% profit target","4% daily loss","6% max drawdown","3 minimum trading days","1:50 leverage"]},
  {name:"Pay After Pass", tag:"03 / PAY AFTER PASS", size:"$5K — $100K", bullets:["6% profit target","3% daily loss","6% max drawdown","3 profitable days","1:30 leverage"]},
  {name:"Direct", tag:"04 / DIRECT", size:"$5K — $100K", bullets:["No profit target","3.5% daily loss","7% max drawdown","1:50 leverage","Unlimited period"]}
];

function FloatingChat(){
 const [open,setOpen]=useState(false),[tab,setTab]=useState("home"),[uid,setUid]=useState(null),[ready,setReady]=useState(false);
 const [convs,setConvs]=useState([]),[active,setActive]=useState(null),[msgs,setMsgs]=useState([]),[view,setView]=useState("list");
 const [text,setText]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState("");
 const [email,setEmail]=useState(""),[pw,setPw]=useState(""),[lbusy,setLbusy]=useState(false),[lerr,setLerr]=useState("");
 const endRef=useRef(null);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUid(data?.user?.id||null);setReady(true)});const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setUid(s?.user?.id||null));return()=>sub?.subscription?.unsubscribe()},[]);
 // conversation list (own rows only, RLS)
 useEffect(()=>{if(!open||!uid)return;let live=true;
   const load=async()=>{const {data}=await supabase.from("support_conversations").select("id,subject,status,last_message_at,created_at").eq("trader_id",uid).order("last_message_at",{ascending:false}).limit(50);if(live&&data)setConvs(data)};
   load();const t=setInterval(load,5000);return()=>{live=false;clearInterval(t)}},[open,uid]);
 // messages of the open thread
 useEffect(()=>{if(!open||!uid||!active)return;let live=true;
   const load=async()=>{const {data}=await supabase.from("support_messages").select("id,sender_type,body,created_at").eq("conversation_id",active).order("created_at",{ascending:true}).limit(300);if(live&&data)setMsgs(data)};
   load();const t=setInterval(load,3000);return()=>{live=false;clearInterval(t)}},[open,uid,active]);
 useEffect(()=>{endRef.current&&endRef.current.scrollIntoView({block:"end"})},[msgs,view]);
 const openThread=(id)=>{setActive(id);setMsgs([]);setView("thread");setErr("")};
 const newChat=()=>{setActive(null);setMsgs([]);setView("thread");setErr("")};
 const send=async(e)=>{e.preventDefault();const v=text.trim();if(!v||!uid||busy)return;setBusy(true);setErr("");
   try{let id=active;
     if(!id){const {data:c,error:ce}=await supabase.from("support_conversations").insert({trader_id:uid,subject:"Website chat",status:"active"}).select("id").single();if(ce)throw ce;id=c.id;setActive(id)}
     const {error:me}=await supabase.from("support_messages").insert({conversation_id:id,sender_id:uid,sender_type:"trader",body:v});if(me)throw me;
     setText("");const {data:m}=await supabase.from("support_messages").select("id,sender_type,body,created_at").eq("conversation_id",id).order("created_at",{ascending:true}).limit(300);if(m)setMsgs(m);
     const {data:cl}=await supabase.from("support_conversations").select("id,subject,status,last_message_at,created_at").eq("trader_id",uid).order("last_message_at",{ascending:false}).limit(50);if(cl)setConvs(cl);
   }catch(e2){setErr("Message could not be sent. Please try again.")}
   setBusy(false)};
 const login=async(e)=>{e.preventDefault();setLerr("");setLbusy(true);const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pw});setLbusy(false);if(error){setLerr(error.message);return}setPw("");setTab("messages")};
 const go=(to)=>{setOpen(false);window.location.hash=to};
 const fmt=(iso)=>new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
 const current=convs.find(c=>c.id===active);
 return <>
  {open&&<div className="fc-panel" role="dialog" aria-label="ElectraPips support">
   <div className="fc-head"><div className="fc-brand"><img src={logo} alt=""/><div><b>ElectraPips Support</b><small>We usually reply in a few minutes</small></div></div><button className="fc-x" aria-label="Close" onClick={()=>setOpen(false)}><X size={18}/></button></div>
   <div className="fc-body">
    {tab==="home"&&<div className="fc-home">
      <div className="fc-hello"><span>Welcome 👋</span><h3>How can we help you today?</h3></div>
      <button className="fc-card" onClick={()=>{setTab("messages");setView("list")}}><span><Send size={16}/> Send us a message</span><ArrowRight size={16}/></button>
      <button className="fc-card" onClick={()=>go("#/faq")}><span><Info size={16}/> Frequently asked questions</span><ArrowRight size={16}/></button>
      <button className="fc-card" onClick={()=>go("#/challenges")}><span><Layers size={16}/> Programs &amp; pricing</span><ArrowRight size={16}/></button>
      <button className="fc-card" onClick={()=>go("#/contact")}><span><Mail size={16}/> Contact page</span><ArrowRight size={16}/></button>
    </div>}

    {tab==="messages"&&(!ready?null:!uid?<form className="fc-login" onSubmit={login}>
      <h3>Sign in to chat</h3><p>Your conversations are saved to your account.</p>
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
      <label>Password<input type="password" autoComplete="current-password" value={pw} onChange={e=>setPw(e.target.value)} required/></label>
      {lerr&&<p className="fc-err">{lerr}</p>}
      <button className="btn btn-primary" style={{width:"100%"}} disabled={lbusy||!email||!pw}>{lbusy?"Signing in…":"Sign in"}</button>
      <p className="fc-alt">No account? <a href="#/signup" onClick={()=>setOpen(false)}>Create one</a></p>
    </form>
    :view==="list"?<div className="fc-list">
      <button className="btn btn-primary fc-newbtn" onClick={newChat}>+ New chat</button>
      <div className="fc-list-title">Your conversations</div>
      {convs.length===0&&<p className="fc-empty">No conversations yet. Start a new chat.</p>}
      {convs.map(c=><button key={c.id} className="fc-conv" onClick={()=>openThread(c.id)}><b>{c.subject||"Support"}</b><span>{fmt(c.last_message_at||c.created_at)}</span><i className={"fc-st "+c.status}>{c.status}</i></button>)}
    </div>
    :<div className="fc-thread">
      <div className="fc-thead"><button className="fc-back" onClick={()=>{setView("list");setActive(null)}} aria-label="Back">←</button><div><b>{current?.subject||"New chat"}</b><small>{current?"Conversation":"Send your first message"}</small></div></div>
      <div className="fc-msgs">{msgs.length===0&&<p className="fc-empty">Hi 👋 Send us a message and our team will reply here.</p>}
        {msgs.map(m=><div key={m.id} className={"fc-msg "+(m.sender_type==="trader"?"me":"team")}>{m.sender_type!=="trader"&&<small>ElectraPips Team</small>}{m.body}<time>{fmt(m.created_at)}</time></div>)}
        <div ref={endRef}/></div>
      {err&&<p className="fc-err">{err}</p>}
      <form className="fc-compose" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Type your message…" maxLength={2000}/><button disabled={busy||!text.trim()} aria-label="Send"><Send size={16}/></button></form>
    </div>)}

    {tab==="help"&&<div className="fc-home">
      <div className="fc-hello"><span>Help</span><h3>Quick links</h3></div>
      <button className="fc-card" onClick={()=>go("#/faq")}><span><Info size={16}/> FAQ</span><ArrowRight size={16}/></button>
      <button className="fc-card" onClick={()=>go("#/legal/refunds")}><span><ShieldCheck size={16}/> Refund policy</span><ArrowRight size={16}/></button>
      <button className="fc-card" onClick={()=>go("#/legal/terms")}><span><FileText size={16}/> Terms &amp; conditions</span><ArrowRight size={16}/></button>
    </div>}
   </div>
   <nav className="fc-tabs">
     <button className={tab==="home"?"on":""} onClick={()=>setTab("home")}><Layers size={18}/>Home</button>
     <button className={tab==="messages"?"on":""} onClick={()=>{setTab("messages");setView("list")}}><MessageCircle size={18}/>Messages</button>
     <button className={tab==="help"?"on":""} onClick={()=>setTab("help")}><Info size={18}/>Help</button>
   </nav>
  </div>}
  <button type="button" className={"chat-fab"+(open?" on":"")} aria-label={open?"Close support chat":"Open support chat"} title="Support chat" onClick={()=>{setOpen(o=>!o);setTab("home")}}>{open?<X size={24}/>:<MessageCircle size={26}/>}</button>
 </>}

function Layout({children}) {
  const location = useLocation();
  const [dd,setDd]=useState(null);
  const topbarRef=useRef(null);
  useEffect(()=>{const el=topbarRef.current;if(!el)return;
    const set=()=>document.documentElement.style.setProperty("--topbar-h",el.offsetHeight+"px");
    set();window.addEventListener("resize",set);const ro=("ResizeObserver" in window)?new ResizeObserver(set):null;ro&&ro.observe(el);
    return()=>{window.removeEventListener("resize",set);ro&&ro.disconnect()}},[]);
  useEffect(()=>{const f=e=>{if(!e.target.closest(".dd"))setDd(null)};document.addEventListener("click",f);return()=>document.removeEventListener("click",f)},[]);
  useEffect(()=>{window.scrollTo(0,0);setDd(null);document.querySelector(".nav-links")?.classList.remove("open");
    const els=[...document.querySelectorAll(".card,.feature,.step,.mini,.notice,.section-head,.table-wrap,.stat,.pay,.gcard,.tl-card,.mkt,.founder,.abt-prog,.rule-col,.faq details,.login-card,.tp-card,.vt-card,.pod,.lb-row,.faq-help,.cinfo")];
    if(!("IntersectionObserver" in window))return;
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.06});
    els.forEach(el=>{el.classList.add("reveal");io.observe(el)});return()=>io.disconnect()},[location.pathname]);
  const menu=[
    {to:"/challenges",label:"Programs"},{to:"/faq",label:"FAQ"},
    {label:"Company",items:[["/about","About Us"],["/contact","Contact"],["/affiliate","Affiliate"]]},
    {label:"Resources",items:[["/how-it-works","How It Works"],["/leaderboard","Leaderboard"],["/start-challenge","Start a Challenge"],["__label","Tools"],["/tools/risk-calculator","Risk Calculator"],["/tools/position-size-calculator","Position Size Calculator"],["/tools/pip-calculator","Pip Calculator"],["/tools/trading-journal","Trading Journal"],["__label","Market"],["/market/economic-calendar","Economic Calendar"],["/market/sessions","Market Sessions"],["/market/news","Market News"]]},
    {label:"Legal",items:[["/legal/terms","Terms & Conditions"],["/legal/risk","Risk Disclosure"],["/legal/simulated","Simulated Trading Disclosure"],["/legal/privacy","Privacy Policy"],["/legal/cookies","Cookie Policy"],["/legal/refunds","Refund Policy"]]}
  ];
  return <>
    <div className="site-topbar" ref={topbarRef}>
    <div className="announce"><Link to="/challenges"><b>New:</b> Start Pay After Pass for just $9.99 <ArrowRight size={14}/></Link></div>
    <header className="nav"><div className="container nav-inner">
      <Link className="brand" to="/"><img src={logo} alt="ElectraPips"/><span>ElectraPips</span></Link>
      <nav className="nav-links">{menu.map(m=>m.items?<div key={m.label} className={"dd"+(dd===m.label?" open":"")+(m.items.some(i=>location.pathname===i[0])?" active":"")}><button className="dd-btn" aria-expanded={dd===m.label} onClick={()=>setDd(dd===m.label?null:m.label)}>{m.label}<ChevronDown size={14}/></button><div className="dd-menu">{m.items.map(([to,l])=>to==="__label"?<div key={"lbl"+l} className="dd-label">{l}</div>:<Link key={to} to={to} className={location.pathname===to?"active":""}>{l}</Link>)}</div></div>:<Link className={location.pathname===m.to?"active":""} key={m.to} to={m.to}>{m.label}</Link>)}<Link className="m-only m-login" to="/login">Login</Link></nav>
      <div className="actions"><Link className="btn btn-ghost login" to="/login">Login</Link><Link className="btn btn-primary" to="/challenges">Start Challenge</Link><button className="mobile-menu" onClick={()=>document.querySelector(".nav-links").classList.toggle("open")}>☰</button></div>
    </div></header>
    </div>
    <div className="site-topbar-spacer"/>
    {children}
    <footer><div className="container"><div className="foot-grid"><div><Link className="brand" to="/"><img src={logo} alt=""/><span>ElectraPips</span></Link><p className="foot-p">Simulated prop trading programs built around clear rules, accessible pricing and different ways to trade.</p><Socials/></div><div><h4>Programs</h4><Link to="/challenges">2-Step Challenge</Link><Link to="/challenges">1-Step Challenge</Link><Link to="/challenges">Pay After Pass</Link><Link to="/challenges">Direct</Link></div><div><h4>Company</h4><Link to="/about">About</Link><Link to="/how-it-works">How It Works</Link><Link to="/leaderboard">Leaderboard</Link><Link to="/affiliate">Affiliate</Link></div><div><h4>Support</h4><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link><Link to="/legal/simulated">Legal</Link><Link to="/login">Login</Link><Link to="/start-challenge">Start Challenge</Link></div></div><div className="foot-bottom"><span>© {new Date().getFullYear()} ElectraPips. All rights reserved.</span><span>Simulated trading environment — not real-money brokerage accounts.</span><button type="button" className="cc-footer-btn" onClick={()=>window.dispatchEvent(new Event("ep:cookie-settings"))}>Cookie Settings</button></div></div></footer>
    <FloatingChat/>
  </>;
}

const Eyebrow=({children})=><div className="eyebrow"><span className="dot"/>{children}</div>;
const Button=({to,children,primary=false})=><Link className={"btn "+(primary?"btn-primary":"btn-ghost")} to={to}>{children}</Link>;

function Home(){
 return <main>
  <section className="hero"><div className="container grid">
   <div><Eyebrow>SIMULATED PROP TRADING</Eyebrow><h1>Trade with <span className="gradient">clarity.</span><br/>Build with consistency.</h1>
   <p>ElectraPips provides simulated prop trading programs designed around clear rules, accessible pricing, and different ways to trade.</p>
   <div className="hero-buttons"><Button to="/challenges" primary>Start Your Challenge →</Button><Button to="/how-it-works">How It Works</Button></div>
   <div className="hero-note">Clear Rules • Multiple Programs • Simulated Trading</div></div>
   <TradingVisual/>
  </div></section>
   <PayoutProof/>
  <StatsBar/>
  <section className="light" id="programs"><div className="container"><div className="section-head center-head"><div className="mono-eye">CHOOSE YOUR PATH</div><h2>Choose the trading path that fits <span className="hl">you.</span></h2><p>Four account models, each with its own rules and conditions.</p></div><PlanPicker/></div></section>
  <Accounts/>
  <section><div className="container"><div className="section-head"><Eyebrow>WHY ELECTRAPIPS</Eyebrow><h2>Designed for a clearer trading experience.</h2></div><div className="features">
   {[
    ["01","Clear Rules","Program conditions are presented clearly so traders can understand the framework before they trade."],
    ["02","Multiple Models","Choose between 2-Step, 1-Step, Pay After Pass, and Direct programs."],
    ["03","Trader-Focused","A modern experience built around accessibility, transparency, and disciplined trading."],
    ["04","Flexible Instruments","Trade Forex, Gold/XAUUSD, Indices, Commodities, and Crypto where supported."],
    ["05","Simple Navigation","Program details, rules, FAQs, and the trading journey are organized in one place."],
    ["06","Built to Grow","ElectraPips is designed as a global simulated prop trading platform."]
   ].map((x,i)=>{const I=[ShieldCheck,Layers,Target,TrendingUp,Compass,Globe][i];return <div className="feature" key={x[1]}><div className="icon"><I size={22}/></div><h3>{x[1]}</h3><p>{x[2]}</p></div>})}
  </div></div></section>
  <section className="light"><div className="container"><div className="section-head"><div className="tag">MARKETS</div><h2>Explore multiple markets.</h2><p>Available instruments depend on the applicable program and platform conditions.</p></div><div className="instruments">{["Forex","Gold / XAUUSD","Indices","Commodities","Crypto"].map(x=><span className="pill" key={x}>{x}</span>)}</div></div></section>
  <HowPreview/><Rules/><Global/><Guarantees/><FAQTeaser/>
  <section><div className="container"><div className="notice"><strong>Important: Simulated Trading Environment.</strong><br/>All ElectraPips accounts, including Performance Accounts, operate in a simulated/demo environment. Account balances and trading results shown on the platform represent simulated capital. Trader rewards are separate payments made by ElectraPips according to applicable program terms.</div></div></section>
  <section className="cta"><div className="container"><h2>Ready to trade with clarity?</h2><p>Explore the programs, understand the rules, and choose the path that fits your trading style.</p><Button to="/challenges" primary>Explore Challenges →</Button></div></section>
 </main>
}

function TradingVisual(){const d="M0 210 L45 190 L80 198 L120 160 L165 175 L210 130 L250 145 L300 95 L345 118 L390 70 L430 86 L470 45 L500 25";return <div className="visual"><div className="chart"><div className="chart-label">SIMULATED PERFORMANCE</div><span className="live"><i/>DEMO</span><svg viewBox="0 0 500 260" preserveAspectRatio="none"><defs><linearGradient id="line" x1="0" x2="1"><stop offset="0" stopColor="#2563eb"/><stop offset="1" stopColor="#38bdf8"/></linearGradient><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".35"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><path d={d+" L500 260 L0 260Z"} fill="url(#area)"/><path className="draw" pathLength="1" d={d} fill="none" stroke="url(#line)" strokeWidth="4" strokeLinejoin="round"/></svg></div><div className="stat-row"><div className="mini"><small>Environment</small><strong>Simulated</strong></div><div className="mini"><small>Programs</small><strong>4 Models</strong></div><div className="mini"><small>Platform</small><strong>MT5</strong></div></div><div className="float f1"><Target size={14}/> Target 8%</div><div className="float f2"><ShieldCheck size={14}/> Max DD 10%</div></div>}

function ProgramCard(p){return <article className="card"><div className="tag">{p.tag}</div><h3>{p.name}</h3><p>{p.size}</p><ul>{p.bullets.map(x=><li key={x}>{x}</li>)}</ul><Button to="/challenges">View Rules</Button></article>}

function HowPreview(){return <section><div className="container"><div className="section-head"><Eyebrow>HOW IT WORKS</Eyebrow><h2>A simple journey from challenge to performance.</h2></div><div className="process">{[
 ["01","Choose a Program","Select the account model that matches your trading approach."],
 ["02","Trade the Rules","Trade in the simulated environment while respecting the applicable limits."],
 ["03","Complete Requirements","Meet the program conditions and applicable eligibility requirements."],
 ["04","Trader Rewards","Eligible traders can request rewards according to the applicable reward terms."]
 ].map(x=><div className="step" key={x[0]}><div className="num">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></div></section>}

function PageHero({eyebrow,title,text,children}){const t=typeof title==="string"?title.replace(/\.$/,"").split(" "):null;return <section className="page-hero ph"><div className="ph-glow"/><div className="container"><Eyebrow>{eyebrow}</Eyebrow><h1>{t?<>{t.slice(0,-1).join(" ")} <span className="hl">{t[t.length-1]}.</span></>:title}</h1><p>{text}</p>{children}</div></section>}

function Challenges(){return <div className="challenges-page"><PageHero eyebrow="ELECTRAPIPS PROGRAMS" title="Choose your challenge." text="Compare the four simulated trading models and review the rules that apply to each."/><section><div className="container"><PlanPicker/></div></section></div>}

function Feature({n:I,t,d}){return <div className="gcard"><I size={26}/><h3>{t}</h3><p>{d}</p></div>}
const CTABand=({title,text,to,label})=><section className="cta"><div className="container"><h2>{title}</h2><p>{text}</p><Button to={to} primary>{label} <ArrowRight size={16}/></Button></div></section>;

function How(){const steps=[["01","Pick your model","Compare 2-Step, 1-Step, Pay After Pass, and Direct.",Layers],["02","Open your account","Trade in the simulated environment using the platform provided.",TrendingUp],["03","Follow the rules","Respect daily loss, total drawdown, trading-day, news, and weekend conditions.",ShieldCheck],["04","Complete the program","Meet all applicable targets and requirements.",Target],["05","Eligibility & verification","Complete applicable verification and eligibility requirements before a Performance Account is provided or activated.",Check],["06","Trader rewards","Eligible traders may request rewards according to the applicable reward cycle and program terms.",Wallet]];return <><PageHero eyebrow="THE JOURNEY" title="How ElectraPips works." text="A simple, structured path from choosing a program to becoming eligible for trader rewards."/><section><div className="container"><div className="vt">{steps.map(([n,t,d,I])=><div className="vt-item" key={n}><span className="vt-num">{n}</span><div className="vt-card"><I size={24}/><div><h3>{t}</h3><p>{d}</p></div></div></div>)}</div></div></section><Payouts/><section><div className="container"><div className="notice"><strong>Simulated environment:</strong> ElectraPips accounts are simulated/demo accounts and do not represent real-money brokerage accounts or allocations of live trading capital.</div></div></section><CTABand title="Ready to begin?" text="Pick a program and start your simulated trading journey." to="/challenges" label="View Programs"/></>}

function Leaderboard(){const rows=[["01","Trader Alpha","2-Step","+18.40%"],["02","Trader Nova","1-Step","+15.75%"],["03","Trader Orion","Direct","+12.30%"],["04","Trader Atlas","Pay After Pass","+10.90%"]];const key=q=>({"2-Step":"2-Step Challenge","1-Step":"1-Step Challenge"}[q]||q);const av=r=>r[1].split(" ")[1][0];const top=[rows[1],rows[0],rows[2]];return <><PageHero eyebrow="COMMUNITY" title="Leaderboard." text="Track community performance in a transparent format. Figures shown below are illustrative demo data, not live trader claims."/><section><div className="container"><div className="demo-tag"><Info size={14}/> ILLUSTRATIVE DEMO DATA</div><div className="podium">{top.map(r=><div key={r[0]} className={"pod p"+Number(r[0])} style={vars(INFO[key(r[2])])}><span className="pod-rank">{Number(r[0])}</span><div className="lb-av">{av(r)}</div><h3>{r[1]}</h3><span className="lb-prog">{r[2]}</span><strong>{r[3]}</strong><small>RESULT · DEMO</small></div>)}</div><div className="lb">{rows.slice(3).map(r=><div className="lb-row" key={r[0]} style={vars(INFO[key(r[2])])}><span className="lb-rank">{r[0]}</span><span className="lb-av">{av(r)}</span><b className="lb-name">{r[1]}</b><span className="lb-prog">{r[2]}</span><span className="lb-bar"><i style={{width:Math.min(100,parseFloat(r[3])/20*100)+"%"}}/></span><strong className="lb-res">{r[3]}</strong></div>)}</div></div></section></>}

function Affiliate(){return <><PageHero eyebrow="PARTNER WITH US" title="Grow with ElectraPips." text="Share ElectraPips with your audience through an affiliate experience designed for creators, communities, and trading educators."><div className="abt-cta"><Button to="/contact" primary>Become a partner <ArrowRight size={16}/></Button></div></PageHero><section><div className="container"><div className="section-head center-head"><div className="mono-eye">HOW IT WORKS</div><h2>Three steps <span className="hl">to get started.</span></h2></div><div className="guar three"><Feature n={UserPlus} t="Join" d="Create or access your affiliate profile when the program is available to you."/><Feature n={Share2} t="Share" d="Use your referral tools and share ElectraPips with your audience."/><Feature n={TrendingUp} t="Track" d="Monitor eligible referrals and activity through the affiliate system."/></div></div></section><section className="light"><div className="container"><div className="section-head center-head"><div className="mono-eye">WHO IT'S FOR</div><h2>Built for <span className="hl">audiences that trade.</span></h2></div><div className="mkts">{[["Creators",Star],["Communities",Users],["Trading educators",Compass]].map(([n,I])=><div className="mkt" key={n}><I size={20}/>{n}</div>)}</div><div className="notice" style={{marginTop:36}}><strong>Affiliate terms:</strong> Commission rates, eligibility, payment schedules, and other commercial terms should come from the current ElectraPips affiliate agreement.</div></div></section><CTABand title="Interested in partnering?" text="Get in touch and we will share the current affiliate details." to="/contact" label="Contact us"/></>}

function About(){
 const solve=[[Globe,"Country restrictions","Built to be accessible to more traders, subject to applicable laws and eligibility."],[Layers,"Unclear or restrictive rules","Every rule for every program is published clearly in one place."],[Wallet,"Pricing challenges","Clear pricing for every account size, shown upfront."],[Clock,"Reward difficulties","Straightforward reward terms you can read before you start."]];
 const pillars=[[Target,"Our Mission","Build a clear simulated trading environment where traders can understand the rules and focus on disciplined execution."],[Compass,"Our Vision","Grow ElectraPips into a global simulated prop trading platform, subject to applicable laws and eligibility."],[ShieldCheck,"Our Commitment","Keep program information organized, transparent, and easy to understand."]];
 return <><section className="abt-hero"><div className="container abt-hero-grid"><div><Eyebrow>OUR STORY</Eyebrow><h1>Simulated prop trading, built around <span className="hl">traders.</span></h1><p>ElectraPips is a simulated prop trading platform created to offer a clearer and more accessible trading experience.</p><div className="abt-cta"><Button to="/challenges" primary>Explore Challenges <ArrowRight size={16}/></Button><Button to="/how-it-works">How It Works</Button></div></div>
 <div className="orbit"><div className="ring r1"/><div className="ring r2"/><div className="core"><img src={logo} alt="ElectraPips"/></div>{cmp.map((c,k)=>{const I=((INFO[c.n]||{}).icon||Info);return <span key={c.n} className={"sat s"+k} style={vars(INFO[c.n]||{})} title={c.n}><I size={20}/></span>})}</div></div></section>
 <section><div className="container about-grid"><div className="section-head"><div className="mono-eye">THE BEGINNING</div><h2>Started with a <span className="hl">simple idea.</span></h2><p>ElectraPips began in 2023. Founder Luqman, with more than 7 years of Forex market experience, started building the company after personal experiences with country restrictions, unclear or restrictive rules, pricing challenges, and reward difficulties.</p><p>The goal was to build a more straightforward simulated prop trading experience centered on clear rules, accessibility, and different program models.</p></div>
 <div className="founder"><div className="fd-top"><span className="fd-av">L</span><div><b>Luqman</b><small>Founder</small></div></div><ul><li><span>Started building</span><b>2023</b></li><li><span>Forex market experience</span><b>7+ years</b></li><li><span>Built around</span><b>Clear rules</b></li><li><span>Focus</span><b>Accessibility & program models</b></li></ul></div></div></section>
 <section className="light"><div className="container"><div className="section-head center-head"><div className="mono-eye">OUR JOURNEY</div><h2>From an idea <span className="hl">to a platform.</span></h2></div><div className="tl">{[["2023","ElectraPips begins","Founder Luqman starts building after personal experiences with country restrictions, unclear rules, pricing challenges and reward difficulties."],["Programs","Four ways to trade","2-Step, 1-Step, Pay After Pass and Direct — each with its own published rules and pricing."],["Today","A clearer experience","A simulated prop trading platform on MT5 with organized program information and straightforward reward terms."]].map(([y,t,d],k)=><div className="tl-item" key={y}><span className="tl-dot">{k+1}</span><div className="tl-card"><span className="tl-y">{y}</span><h3>{t}</h3><p>{d}</p></div></div>)}</div></div></section>
 <section className="stats"><div className="container stats-grid">{[["2023","Year started"],["7+","Years of Forex experience"],["4","Program models"],["MT5","Trading platform"]].map(([v,l])=><div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>)}</div></section>
 <section className="light"><div className="container"><div className="section-head center-head"><div className="mono-eye">WHY WE BUILT IT</div><h2>Problems we set out <span className="hl">to solve.</span></h2><p>ElectraPips started from real frustrations. Here is how we approach each one.</p></div><div className="guar">{solve.map(([I,t,d])=><div className="gcard" key={t}><I size={26}/><span className="lbl">THE PROBLEM</span><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
 <section><div className="container"><div className="section-head center-head"><div className="mono-eye">WHAT DRIVES US</div><h2>Mission, vision <span className="hl">& commitment.</span></h2></div><div className="guar three">{pillars.map(([I,t,d])=><div className="gcard big" key={t}><I size={30}/><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
 <section className="light"><div className="container"><div className="section-head center-head"><div className="mono-eye">OUR PROGRAMS</div><h2>Four ways <span className="hl">to trade.</span></h2><p>Different program models so every trader can find a path that fits.</p></div><div className="abt-progs">{cmp.map(c=>{const I=((INFO[c.n]||{}).icon||Info);return <Link key={c.n} to="/challenges" className="abt-prog" style={vars(INFO[c.n]||{})}><span className="abt-ico"><I size={22}/></span><h3>{c.n}</h3><span className="sz">{c.s}</span><small>{INFO[c.n].tag}</small><em>View program <ArrowRight size={14}/></em></Link>})}</div></div></section>
 <section><div className="container"><div className="section-head center-head"><div className="mono-eye">MARKETS</div><h2>Trade what <span className="hl">you know.</span></h2><p>Available markets depend on the applicable program and platform conditions.</p></div><div className="mkts">{[["Forex",Globe],["Gold / XAUUSD",Wallet],["Indices",TrendingUp],["Commodities",Layers],["Crypto",Zap]].map(([n,I])=><div className="mkt" key={n}><I size={20}/>{n}</div>)}</div></div></section>
 <section><div className="container"><div className="notice"><strong>Simulated environment:</strong> All ElectraPips accounts operate in a simulated/demo environment and are not real-money brokerage accounts.</div></div></section>
 <section className="cta"><div className="container"><h2>Ready to trade with clarity?</h2><p>Explore the programs, understand the rules, and choose the path that fits your trading style.</p><Button to="/challenges" primary>Explore Challenges →</Button></div></section></>}
let faqs=[
["Are ElectraPips accounts real-money live accounts?","No. All ElectraPips accounts, including Performance Accounts, operate in a simulated/demo environment."],
["What programs does ElectraPips offer?","2-Step Challenge, 1-Step Challenge, Pay After Pass, and Direct."],
["What trading platform does ElectraPips use?","MetaTrader 5 (MT5). Other platforms are coming soon."],
["What is the maximum trading period?","Unlimited on every program. There is no maximum trading period on the 2-Step Challenge, 1-Step Challenge, Pay After Pass, or Direct."],
["What are the profit targets for the 2-Step Challenge?","Phase 1 requires an 8% profit target, and Phase 2 requires a 5% profit target."],
["What leverage does each program offer?","2-Step Challenge: 1:100. 1-Step Challenge: 1:50. Pay After Pass: 1:30. Direct: 1:10."],
["Is a Stop Loss required?","No Stop Loss is required on 2-Step, 1-Step, or Pay After Pass. The Direct program requires a Stop Loss on every trade at all times — trading without one is not allowed on Direct accounts."],
["What can I trade?","Forex, Gold/XAUUSD, Indices, Commodities, and Crypto, subject to the applicable program and platform conditions."],
["Is there a position size or lot size limit?","No. There is no maximum position size and no maximum lot size on any account model."],
["When does the Daily Loss limit reset?","The Daily Loss limit resets when the calendar date changes at 00:00 server time."],
["How is Maximum Total Drawdown calculated?","Maximum Total Drawdown is static across all account models and based on the starting balance. It does not trail upward with profit, and floating losses are included."],
["Is weekend holding or news trading allowed?","2-Step and 1-Step allow weekend holding and news trading. Pay After Pass and Direct do not allow either."],
["What are the weekend holding rules where it's not allowed?","Positions must be closed 1 hour before Friday market close. Trading may resume after Monday market open."],
["What are the restricted news trading rules?","On Pay After Pass and Direct, positions must be closed 10 minutes before and remain closed until 10 minutes after a restricted news event (CPI, NFP, FOMC). If a restricted news event occurs while a trade is still open, this is a rule violation and may result in account closure."],
["What is the minimum number of trading days?","2-Step requires 3 minimum trading days in Phase 1 and 3 in Phase 2 (6 in total). 1-Step requires 3 minimum trading days. Pay After Pass requires 3 profitable days with at least 1% profit on each. Direct has no minimum trading day requirement."],
["Is copy trading allowed?","No. Copy trading is prohibited, and traders must not copy trades from another trader or account."],
["Are EAs or trading bots allowed?","No. Expert Advisors, automated trading bots, and automated execution systems are not allowed. Violation may result in account closure."],
["What other strategies are prohibited?","Arbitrage, High-Frequency Trading (HFT), latency abuse, martingale, and grid trading are prohibited on all account models."],
["Can I share my account with someone else?","No. Account sharing is strictly prohibited. Do not share login credentials or allow another person to operate the account."],
["What happens if my account is inactive?","At least one trade must be placed every 90 days. If no trade is placed for 90 consecutive days, the account is closed due to inactivity."],
["How often can I request a reward?","Direct: rewards are available every 7 days — your first reward can be requested 7 days after your first trade, then every 7 days if requirements are met. 2-Step and 1-Step: the first reward may be requested 14 days after the first trade. Pay After Pass: 21 days after the first trade."],
["What is the minimum reward?","The minimum reward is $25. Rewards are made through crypto under the current reward terms, and approved rewards are processed within 24 hours."],
["What is the Trader Reward Share for each program?","2-Step and 1-Step: 85% on the first and second rewards, 90% from the third reward onward. Pay After Pass: 75%. Direct: 50% on the first reward, 65% on the second, up to 75% from the third reward cycle onward (a scaling plan is coming soon)."],
["Is there a consistency requirement?","No. There is no consistency requirement on any account model."],
["What is KYC and when is it required?","KYC (identity verification) is required for all traders who successfully complete a challenge, and must be completed before a Performance Account is provided or activated. If KYC cannot be completed successfully, the account will not be activated."],
["Can I get a refund?","2-Step and 1-Step challenge fees are refundable after 3 rewards have been completed. Pay After Pass and Direct challenge fees are non-refundable once purchased."],
["Who is eligible to trade with ElectraPips?","Traders must be at least 18 years old. Traders from all countries are welcome, subject to applicable laws and regulations."],
["What payment methods are accepted?","Challenge fees can be paid using the payment methods available at checkout. Card payments are available where supported, and cryptocurrency may be used where available if card payment does not work or cannot be used."]
];
function FAQ(){const [q,setQ]=useState("");const [cat,setCat]=useState("All");const [open,setOpen]=useState({0:true});
 const catNames=[...new Set(faqs.map(f=>f[2]||"General"))];
 const cats=Object.fromEntries(catNames.map(c=>[c,faqs.map((f,i)=>((f[2]||"General")===c?i:-1)).filter(i=>i>=0)]));
 const ICON_OF={All:Layers,General:Info,"Trading Rules":ShieldCheck,"Prohibited & Compliance":X,Rewards:Wallet,"Account & Payments":User,"Performance Trader":Award};
 const icons=new Proxy(ICON_OF,{get:(t,k)=>t[k]||Info});
 const items=faqs.map(([a,b],i)=>({i,a,b,c:Object.keys(cats).find(k=>cats[k].includes(i))})).filter(x=>(cat==="All"||x.c===cat)&&(x.a+" "+x.b).toLowerCase().includes(q.toLowerCase()));
 const groups=Object.keys(cats).map(c=>({c,list:items.filter(x=>x.c===c)})).filter(g=>g.list.length);
 const allOpen=items.length>0&&items.every(x=>open[x.i]);
 const toggle=(i)=>setOpen(o=>({...o,[i]:!o[i]}));
 const setAll=(v)=>setOpen(()=>Object.fromEntries(items.map(x=>[x.i,v])));
 const goRules=()=>document.getElementById("all-rules")?.scrollIntoView({behavior:"smooth"});
 return <><PageHero eyebrow="QUESTIONS" title="Frequently asked questions." text="Quick answers to the most important ElectraPips questions, organized by topic.">
   <div className="abt-cta"><button className="btn btn-primary" onClick={goRules}>View all rules <ArrowRight size={16}/></button></div></PageHero>
 <section className="faq-page"><div className="container faq-layout">
  <aside className="faq-cats">
   <div className="faq-cats-title">Topics</div>
   {["All",...Object.keys(cats)].map(c=>{const I=icons[c];const n=c==="All"?faqs.length:cats[c].length;return <button key={c} className={"faq-cat"+(cat===c?" on":"")} onClick={()=>setCat(c)}><I size={18}/><span className="faq-cat-name">{c}</span><em>{n}</em></button>})}
  </aside>
  <div className="faq-main">
   <div className="faq-toolbar">
    <div className="faq-search"><Search size={18}/><input placeholder="Search questions…" value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button className="faq-clear" onClick={()=>setQ("")} aria-label="Clear search"><X size={15}/></button>}</div>
    <div className="faq-meta"><span>{items.length} {items.length===1?"question":"questions"}</span><button className="faq-toggle-all" onClick={()=>setAll(!allOpen)}>{allOpen?"Collapse all":"Expand all"}</button></div>
   </div>
   {groups.map((g)=>{const I=icons[g.c];return <div className="faq-group" key={g.c}>
     <h3><span className="faq-group-ico"><I size={18}/></span>{g.c}<small>{g.list.length}</small></h3>
     <div className="faq-list">{g.list.map((x)=>{const isOpen=!!open[x.i];return <div className={"faq-item"+(isOpen?" open":"")} key={x.i}>
       <button className="faq-q" aria-expanded={isOpen} onClick={()=>toggle(x.i)}><span>{x.a}</span><span className="faq-pm" aria-hidden="true"><i/><i/></span></button>
       <div className="faq-body"><div><p>{x.b}</p></div></div>
     </div>})}</div>
   </div>})}
   {!groups.length&&<div className="faq-empty"><Search size={22}/><p>No questions match “{q}”.</p><button className="btn btn-ghost" onClick={()=>{setQ("");setCat("All")}}>Reset search</button></div>}
   <div className="faq-help"><div><h3>Still have questions?</h3><p>Our support team replies within 24 hours.</p></div><Button to="/contact" primary>Contact us <ArrowRight size={16}/></Button></div>
  </div>
 </div></section>
 <section id="all-rules" className="rules-intro"><div className="container"><div className="section-head center-head"><div className="mono-eye">ALL RULES</div><h2>Every rule, <span className="hl">in one place.</span></h2><p>Numbers for each program, what is allowed, and how rewards, Trader Reward Share and refunds work.</p></div></div></section>
 <Accounts/><Rules/><FullSpecs/><Payouts/></>}

const SPECS=[
 ["2-Step Challenge",[["Trader Reward Share","85% · 85% · 90%+"],["News trading","Allowed"],["Weekend holding","Allowed"],["Min. trading days","3 per phase (6 total)"],["Stop Loss","Not required"],["Position / lot limit","None"],["Consistency requirement","None"]]],
 ["1-Step Challenge",[["Trader Reward Share","85% · 85% · 90%+"],["News trading","Allowed"],["Weekend holding","Allowed"],["Min. trading days","3 days"],["Stop Loss","Not required"],["Position / lot limit","None"],["Consistency requirement","None"]]],
 ["Pay After Pass",[["Trader Reward Share","75%"],["News trading","Not allowed (CPI, NFP, FOMC)"],["Weekend holding","Not allowed"],["Min. trading days","3 profitable days · 1% each"],["Stop Loss","Not required"],["Position / lot limit","None"],["Consistency requirement","None"]]],
 ["Direct",[["Trader Reward Share","50% · 65% · up to 75%"],["News trading","Not allowed (CPI, NFP, FOMC)"],["Weekend holding","Not allowed"],["Min. trading days","None"],["Stop Loss","Required at all times"],["Max risk per trade","1%"],["Position / lot limit","None"],["Consistency requirement","None"]]]
];
function FullSpecs(){return <section><div className="container"><div className="section-head center-head"><div className="mono-eye">PROGRAM SPECIFICATIONS</div><h2>Trader Reward Share <span className="hl">& program details.</span></h2><p>Daily Loss resets at 00:00 server time. Drawdown is static and based on the starting balance on every program.</p></div><div className="specs">{(SPECS||[]).map(([n,rows])=>{const f=INFO[n]||{};return <div className="spec-card" key={n} style={vars(f)}><h3>{n}</h3><ul>{(rows||[]).map(([l,v])=><li key={l}><span>{l}</span><b>{v}</b></li>)}</ul></div>})}</div></div></section>}
function ForgotPassword(){
 const [email,setEmail]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState(""),[sent,setSent]=useState("");
 const send=async(e)=>{e.preventDefault();setErr("");const v=email.trim();if(!/^\S+@\S+\.\S+$/.test(v)){setErr("Please enter a valid email address.");return}
   setBusy(true);
   const {error}=await supabase.auth.resetPasswordForEmail(v,{redirectTo:window.location.origin+"/?type=recovery"});
   setBusy(false);
   if(error){setErr(error.message);return}
   setSent(v)};
 return <section className="auth"><div className="container auth-grid"><div className="auth-side"><Eyebrow>ACCOUNT RECOVERY</Eyebrow><h1>Reset your <span className="hl">password.</span></h1><p>Enter the email you registered with. We will send you a secure link to choose a new password.</p></div>
  <div className="login-card">
   {sent?<div>
     <h3>Check your email</h3>
     <p style={{color:"#94a3b8"}}>If an account exists for <b style={{color:"#fff"}}>{sent}</b>, a password reset link has been sent. The link expires after a short time.</p>
     <p style={{color:"#94a3b8",fontSize:13}}>Didn't get it? Check your spam folder, or <button type="button" onClick={()=>setSent("")} style={{background:"none",border:0,color:"#5aa2ff",fontWeight:600,cursor:"pointer",padding:0}}>try another email</button>.</p>
     <Link className="btn btn-ghost" to="/login" style={{width:"100%",textAlign:"center"}}>Back to sign in</Link>
   </div>
   :<form onSubmit={send}>
     <label>Email<span className="inp"><Mail size={16}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></span></label>
     {err&&<p style={{color:"#fb7185",fontSize:13}}>{err}</p>}
     <button className="btn btn-primary" style={{width:"100%",textAlign:"center"}} disabled={busy||!email.trim()}>{busy?"Sending…":"Send reset link"}</button>
     <p style={{textAlign:"center",marginTop:14}}><Link to="/login" style={{color:"#5aa2ff",fontWeight:600}}>Back to sign in</Link></p>
   </form>}
  </div></div></section>}

function ResetPassword(){
 const [show,setShow]=useState(false);
 const [ready,setReady]=useState(false),[has,setHas]=useState(false),[pw,setPw]=useState(""),[pw2,setPw2]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState(""),[done,setDone]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setHas(!!data?.session);setReady(true)});const {data:sub}=supabase.auth.onAuthStateChange((ev,s)=>{if(ev==="PASSWORD_RECOVERY"||s)setHas(!!s);setReady(true)});return()=>sub?.subscription?.unsubscribe()},[]);
 const save=async(e)=>{e.preventDefault();setErr("");if(pw.length<8){setErr("Password must be at least 8 characters.");return}if(pw!==pw2){setErr("Passwords do not match.");return}setBusy(true);const {error}=await supabase.auth.updateUser({password:pw});setBusy(false);if(error){setErr(error.message);return}setDone(true);await supabase.auth.signOut();try{sessionStorage.setItem("ep_pw_reset","1")}catch(e){};setTimeout(()=>{window.location.hash="#/login"},1200)};
 return <section className="auth"><div className="container auth-grid"><div className="auth-side"><Eyebrow>ACCOUNT SECURITY</Eyebrow><h1>Set a new <span className="hl">password.</span></h1><p>Choose a strong password you have not used before.</p></div>
  <div className="login-card">
   {!ready?null:!has?<div><h3>Link expired or invalid</h3><p style={{color:"#94a3b8"}}>Request a new reset link from the sign-in page.</p><Link className="btn btn-primary" to="/login" style={{width:"100%",textAlign:"center"}}>Back to sign in</Link></div>
   :done?<div><h3>Password updated</h3><p style={{color:"#4ade80"}}>Taking you to the sign-in page…</p></div>
   :<form onSubmit={save}>
     <label>New password<span className="inp"><Lock size={16}/><input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password"/><button type="button" className="eye" aria-label="Show password" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>
     <label>Confirm new password<span className="inp"><Lock size={16}/><input type={show?"text":"password"} value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Repeat password" autoComplete="new-password"/></span></label>
     {err&&<p style={{color:"#fb7185",fontSize:13}}>{err}</p>}
     <button className="btn btn-primary" style={{width:"100%",textAlign:"center"}} disabled={busy||!pw||!pw2}>{busy?"Saving…":"Update password"}</button>
   </form>}
  </div></div></section>}

function Login(){const [show,setShow]=useState(false);const [em,setEm]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");const [busy,setBusy]=useState(false);const [notice]=useState(()=>{try{if(sessionStorage.getItem("ep_pw_reset")){sessionStorage.removeItem("ep_pw_reset");return "Password updated. Please sign in with your new password."}}catch(e){}return ""});
 const doSignIn=async()=>{setErr("");setBusy(true);const {error}=await supabase.auth.signInWithPassword({email:em,password:pw});setBusy(false);if(error){setErr(error.message);return}window.location.hash="#/portal"};return <section className="auth"><div className="container auth-grid"><div className="auth-side"><Eyebrow>TRADER ACCESS</Eyebrow><h1>Welcome <span className="hl">back.</span></h1><p>Sign in to your trader dashboard.</p><ul>{[[ShieldCheck,"Clear, published rules"],[Layers,"Four program models"],[Wallet,"Straightforward reward terms"]].map(([I,t])=><li key={t}><I/>{t}</li>)}</ul></div><form className="login-card" onSubmit={e=>e.preventDefault()}><h2>Sign in</h2><label>Email<span className="inp"><Mail size={16}/><input type="email" name="ep-login-email" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={em} onChange={e=>setEm(e.target.value)}/></span></label><label>Password<span className="inp"><Lock size={16}/><input type={show?"text":"password"} placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)}/><button type="button" className="eye" aria-label="Show password" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>{notice&&<p style={{color:"#4ade80",fontSize:13}}>{notice}</p>}<div style={{textAlign:"right",marginTop:-6}}><button type="button" onClick={()=>{window.location.hash="#/forgot-password"}} style={{background:"none",border:0,color:"#5aa2ff",fontWeight:600,fontSize:13,cursor:"pointer",padding:0}}>Forgot password?</button></div>{err&&<p style={{color:"#fb7185",fontSize:13}}>{err}</p>}<button type="button" className="btn btn-primary" style={{width:"100%",textAlign:"center"}} disabled={busy||!em||!pw} onClick={doSignIn}>{busy?"Signing in…":"Sign in"}</button><p>New to ElectraPips? <Link to="/signup">Create an account</Link></p><p className="auth-note">Demo build — sign-in isn't connected to a real account yet. This button opens the Trader Portal preview.</p></form></div></section>}
const COUNTRIES=["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
function Signup(){
 const [f,setF]=useState({first:"",last:"",email:"",country:"",password:"",agree:false});
 const [show,setShow]=useState(false),[busy,setBusy]=useState(false),[err,setErr]=useState(""),[sent,setSent]=useState(""),[resent,setResent]=useState("");
 const on=(k)=>(e)=>setF({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value});
 const pwOk=f.password.length>=6;
 const valid=f.first.trim()&&f.last.trim()&&/^\S+@\S+\.\S+$/.test(f.email.trim())&&f.country&&pwOk&&f.agree;
 const submit=async(e)=>{e.preventDefault();setErr("");
   if(!valid){setErr("Please complete every field. Password must be at least 6 characters.");return}
   setBusy(true);
   const email=f.email.trim();
   const {data,error}=await supabase.auth.signUp({email,password:f.password,options:{data:{full_name:(f.first.trim()+" "+f.last.trim()),country:f.country}}});
   setBusy(false);
   if(error){setErr(error.message);return}
   if(data&&data.session){window.location.hash="#/portal";return}
   setSent(email);
 };
 const resend=async()=>{setResent("");const {error}=await supabase.auth.resend({type:"signup",email:sent});setResent(error?error.message:"Verification email sent again.")};
 if(sent)return <section className="auth"><div className="container auth-grid"><div className="auth-side"><Eyebrow>VERIFY YOUR EMAIL</Eyebrow><h1>Almost <span className="hl">there.</span></h1><p>We sent a verification link to your email. Open it to activate your account, then sign in.</p></div>
  <div className="login-card"><h3>Check your inbox</h3><p style={{color:"#94a3b8"}}>Verification sent to <b style={{color:"#fff"}}>{sent}</b>. Didn't get it? Check spam, or resend below.</p>
   {resent&&<p style={{color:"#4ade80",fontSize:13}}>{resent}</p>}
   <button className="btn btn-ghost" style={{width:"100%",marginBottom:10}} onClick={resend}>Resend verification email</button>
   <Link className="btn btn-primary" to="/login" style={{width:"100%",textAlign:"center"}}>Go to sign in</Link></div></div></section>;
 return <section className="auth"><div className="container auth-grid"><div className="auth-side"><Eyebrow>CREATE ACCOUNT</Eyebrow><h1>Start trading <span className="hl">with us.</span></h1><p>Create your free ElectraPips account. Your trader dashboard opens as soon as you verify your email.</p></div>
  <div className="login-card signup-card">
   <form onSubmit={submit} className="su-form">
    <div className="su-row2"><label>First name<input value={f.first} onChange={on("first")} autoComplete="given-name" required/></label><label>Last name<input value={f.last} onChange={on("last")} autoComplete="family-name" required/></label></div>
    <label>Email<input type="email" value={f.email} onChange={on("email")} autoComplete="email" placeholder="you@example.com" required/></label>
    <label>Country of residence<select value={f.country} onChange={on("country")} required><option value="">Select your country</option>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    <label>Password<span className="inp"><Lock size={16}/><input type={show?"text":"password"} value={f.password} onChange={on("password")} autoComplete="new-password" placeholder="At least 6 characters" required/><button type="button" className="eye" aria-label={show?"Hide password":"Show password"} onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>
    <small className={"su-hint"+(f.password&&!pwOk?" bad":"")}>{pwOk?"Strong enough.":"Use at least 6 characters."}</small>
    <label className="su-check"><input type="checkbox" checked={f.agree} onChange={on("agree")}/><span>I accept the <Link to="/legal/terms">Terms &amp; Conditions</Link> and the <Link to="/legal/privacy">Privacy Policy</Link>.</span></label>
    {err&&<p className="sp-err">{err}</p>}
    <button className="btn btn-primary" style={{width:"100%",textAlign:"center"}} disabled={busy||!valid}>{busy?"Creating account…":"Create account"}</button>
    <p className="su-alt">Already have an account? <Link to="/login">Sign in</Link></p>
   </form>
  </div></div></section>}

function Start(){return <><PageHero eyebrow="START YOUR JOURNEY" title="Choose your program." text="Select the ElectraPips program that fits your trading approach."/><section><div className="container"><div className="abt-progs">{cmp.map(c=>{const f=INFO[c.n],I=f.icon,first=Object.values(PRICES[c.n])[0];return <Link key={c.n} to="/challenges" className="abt-prog" style={vars(f)}><span className="abt-ico"><I size={22}/></span><h3>{c.n}</h3><span className="sz">{c.s}</span><small>{f.badge} · From <b>{first}</b>{c.n==="Pay After Pass"?" entry":""}</small><em>Choose program <ArrowRight size={14}/></em></Link>})}</div></div></section><Guarantees/></>}

function PublicSite(){return <Layout><Routes>
  <Route path="/" element={<Home/>}/><Route path="challenges" element={<Challenges/>}/><Route path="support" element={<Support/>}/><Route path="how-it-works" element={<How/>}/>
  <Route path="leaderboard" element={<Leaderboard/>}/><Route path="affiliate" element={<Affiliate/>}/><Route path="about" element={<About/>}/>
  <Route path="faq" element={<FAQ/>}/><Route path="contact" element={<Contact/>}/><Route path="legal" element={<Legal/>}/><Route path="legal/:section" element={<Legal/>}/><Route path="login" element={<Login/>}/><Route path="reset-password" element={<ResetPassword/>}/><Route path="forgot-password" element={<ForgotPassword/>}/><Route path="signup" element={<Signup/>}/><Route path="start-challenge" element={<Start/>}/>
  <Route path="tools/risk-calculator" element={<RiskCalc/>}/><Route path="tools/position-size-calculator" element={<PositionCalc/>}/><Route path="tools/pip-calculator" element={<PipCalc/>}/><Route path="tools/trading-journal" element={<TradingJournal/>}/>
  <Route path="market/economic-calendar" element={<EconCalendar/>}/><Route path="market/sessions" element={<MarketSessions/>}/><Route path="market/news" element={<MarketNews/>}/>
 </Routes></Layout>}
function PortalSite(){return <Routes>
  <Route index element={<PortalOverview/>}/><Route path="challenges" element={<PortalChallenges/>}/><Route path="checkout" element={<PortalCheckout/>}/>
  <Route path="accounts" element={<PortalAccounts/>}/><Route path="accounts/:id" element={<PortalAccountDetail/>}/><Route path="withdrawals" element={<PortalWithdrawals/>}/>
  <Route path="certificates" element={<PortalCertificates/>}/><Route path="affiliate" element={<PortalAffiliate/>}/><Route path="offers" element={<PortalOffers/>}/><Route path="settings" element={<PortalSettings/>}/>
 </Routes>}
class EPErrorBoundary extends React.Component{
 constructor(p){super(p);this.state={err:null}}
 static getDerivedStateFromError(err){return {err}}
 componentDidCatch(err){console.error("ElectraPips render error:",err)}
 render(){
  if(this.state.err)return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#05070b",color:"#fff",fontFamily:"Inter,sans-serif",padding:24}}>
   <div style={{maxWidth:560,textAlign:"center"}}><h2 style={{marginBottom:10}}>Something went wrong</h2><p style={{color:"#94a3b8",fontSize:14,marginBottom:16}}>Open the browser console (F12) to see the error details.</p><code style={{color:"#fb7185",fontSize:12,wordBreak:"break-word"}}>{String(this.state.err&&this.state.err.message||this.state.err)}</code></div></div>;
  return this.props.children;
 }
}
export default function App(){
 const [,setVer]=useState(0);
 useEffect(()=>{if(window.location.hash.indexOf("type=recovery")>-1){setTimeout(()=>{window.location.hash="#/reset-password"},150)}},[]);
 useEffect(()=>{
   let live=true;
   // Site renders immediately with built-in data; Supabase data is applied in the background
   loadSiteData().then(d=>{if(!live)return;applySiteData(d);setVer(v=>v+1)}).catch(e=>console.error("Supabase load failed, using built-in data:",e));
   return()=>{live=false};
 },[]);
 return <EPErrorBoundary><HashRouter><Routes>
  <Route path="/portal/*" element={<PortalSite/>}/>
  <Route path="/*" element={<PublicSite/>}/>
 </Routes></HashRouter><CookieConsent/></EPErrorBoundary>
}

function applySiteData(d){
 if(d.cmp?.length){const ok=d.cmp.filter(c=>INFO[c.n]);if(ok.length){cmp.length=0;cmp.push(...ok);}}
 if(d.INFO){for(const name of Object.keys(d.INFO)){if(INFO[name])INFO[name].phases=d.INFO[name].phases;}}
 if(d.PRICES){for(const name of Object.keys(d.PRICES))PRICES[name]=d.PRICES[name];}
 if(d.SIZES){for(const name of Object.keys(d.SIZES))SIZES[name]=d.SIZES[name];}
 if(d.PASS&&Object.keys(d.PASS).length)PASS=d.PASS;
 if(d.faqs&&d.faqs.length)faqs=d.faqs;
}
let cmp=[
 {n:"2-Step Challenge",s:"$2.5K – $100K",t:"8% → 5%",d:"5%",m:"10%",l:"1:100",x:"Two phases"},
 {n:"1-Step Challenge",s:"$2.5K – $100K",t:"10%",d:"4%",m:"6%",l:"1:50",x:"3 minimum trading days"},
 {n:"Pay After Pass",s:"$5K – $100K",t:"6%",d:"3%",m:"6%",l:"1:30",x:"3 profitable days"},
 {n:"Direct",s:"$5K – $100K",t:"None",d:"3.5%",m:"7%",l:"1:50",x:"Unlimited period"}];
function Accounts(){return <section id="accounts"><div className="container"><div className="section-head"><Eyebrow>ACCOUNTS</Eyebrow><h2>Compare every account at a glance.</h2><p>Account sizes, targets, loss limits and leverage — all in one table.</p></div><div className="table-wrap acct"><table><thead><tr>{["Program","Account size","Profit target","Daily loss","Max drawdown","Leverage","Extra rule"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{cmp.map(r=><tr key={r.n}><td><strong className="pname">{r.n}</strong></td><td><span className="size">{r.s}</span></td><td><span className="chip c-target">{r.t}</span></td><td><span className="chip c-loss">{r.d}</span></td><td><span className="chip c-dd">{r.m}</span></td><td><span className="chip c-lev">{r.l}</span></td><td className="extra">{r.x}</td></tr>)}</tbody></table></div><div className="acct-foot"><span><Check size={14}/> Static drawdown</span><span><Check size={14}/> No stop loss required</span><span><Check size={14}/> Forex · Gold · Indices · Commodities · Crypto</span></div><div className="center" style={{marginTop:30}}><Button to="/challenges" primary>Start Your Challenge <ArrowRight size={16}/></Button></div></div></section>}
function Rules(){const ok=["Trade Forex, Gold, Indices, Commodities & Crypto","No stop loss requirement","Static drawdown from the starting balance","Manual trading on the platform provided"],no=["Copy trading","Expert Advisors & trading bots","Automated execution systems","Breaching daily loss or max drawdown"];return <section><div className="container"><div className="section-head"><Eyebrow>TRADING RULES</Eyebrow><h2>Know exactly what is allowed.</h2></div><div className="rules"><div className="rule-col ok"><h3><Check size={22}/> Allowed</h3><ul>{ok.map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul></div><div className="rule-col no"><h3><X size={22}/> Not allowed</h3><ul>{no.map(x=><li key={x}><X size={16}/>{x}</li>)}</ul></div></div></div></section>}
function Payouts(){return <section className="light"><div className="container"><div className="section-head"><div className="tag">REWARDS</div><h2>Clear reward terms.</h2><p>Trader rewards follow the applicable program terms. 2-Step and 1-Step fees are refundable after 3 rewards. Other programs are non-refundable once purchased.</p></div><div className="pays">{[[Clock,"7 days","Direct: first reward 7 days after your first trade, then every 7 days"],[Repeat,"14 days","2-Step & 1-Step: first reward 14 days after first trade, then weekly. Pay After Pass: 21 days"],[Wallet,"$25","Minimum reward amount"],[Zap,"Crypto","Reward method under current terms"]].map(([I,v,l])=><div className="pay" key={v}><I size={26}/><strong>{v}</strong><span>{l}</span></div>)}</div></div></section>}

const V=(pa,soft,dark,line)=>({pa,soft,dark,line});
let INFO={
"2-Step Challenge":{icon:Zap,badge:"Most Popular",tag:"Classic Path. Proven Results.",desc:"Our flagship evaluation model. Pass two phases of profit targets with consistent, disciplined trading — then receive your Performance Account.",label:"CHALLENGE PHASES",...V("#2f7bff","rgba(47,123,255,.16)","#0f2455","#1e3a8a"),phases:[{n:1,t:"Phase 1",b:"EVALUATION",d:"Target: 8% profit"},{n:2,t:"Phase 2",b:"EVALUATION",d:"Target: 5% profit"}]},
"1-Step Challenge":{icon:Target,badge:"Fastest Route",tag:"Single Phase. Faster Results.",desc:"Complete just one evaluation phase with a single profit target and get a Performance Trader account immediately. Built for experienced traders who want to move fast.",label:"CHALLENGE PHASES",...V("#22c7ee","rgba(6,182,212,.14)","#0b2a3c","#0e5a78"),phases:[{n:1,t:"Phase 1",b:"EVALUATION",d:"Target: 10% profit · 3 minimum trading days"}]},
"Pay After Pass":{icon:CreditCard,badge:"No Upfront Cost",tag:"Start for $9.99. Full Fee Charged When You Pass.",desc:"Start your evaluation for just $9.99. Once you pass the challenge, the full fee is charged at the point of account activation — no payment required until you prove your skills.",label:"CHALLENGE PHASES",...V("#a66bff","rgba(168,85,247,.16)","#231a4d","#4b2f9a"),phases:[{n:1,t:"Phase 1",b:"EVALUATION",d:"Target: 6% profit · 3 profitable days"}]},
"Direct":{icon:Rocket,badge:"Skip The Wait",tag:"No Challenge. Just Trade.",desc:"Skip evaluations entirely. Get a Performance Trader account immediately and start collecting profits from day one. For professionals who are ready now.",label:"ACCOUNT",...V("#f5a524","rgba(245,158,11,.15)","#2b2110","#5a4213"),phases:[{n:1,t:"Direct",b:"NO TARGET",d:"No profit target · Unlimited period"}]}};
/* Prices */
let PRICES={
"2-Step Challenge":{"$2.5K":"$18.5","$5K":"$36","$10K":"$60","$25K":"$155","$50K":"$299","$100K":"$555"},
"1-Step Challenge":{"$2.5K":"$24","$5K":"$45","$10K":"$79","$25K":"$189","$50K":"$349","$100K":"$629"},
"Pay After Pass":{"$5K":"$9.99","$10K":"$9.99","$25K":"$9.99","$50K":"$9.99","$100K":"$9.99"},
"Direct":{"$5K":"$229","$10K":"$439","$25K":"$1,100","$50K":"$2,229","$100K":"$4,400"}};
let PASS={"$5K":"$89","$10K":"$179","$25K":"$349","$50K":"$500","$100K":"$750"};
let SIZES={"2-Step Challenge":["$2.5K","$5K","$10K","$25K","$50K","$100K"],"1-Step Challenge":["$2.5K","$5K","$10K","$25K","$50K","$100K"],"Pay After Pass":["$5K","$10K","$25K","$50K","$100K"],"Direct":["$5K","$10K","$25K","$50K","$100K"]};
const vars=o=>({"--pa":o.pa,"--pa-soft":o.soft,"--pa-dark":o.dark,"--pa-line":o.line});
const SPRINT={badge:"New",tag:"Fast Track. Two Phases.",desc:"A faster two-phase evaluation with an equal profit target on both phases, no minimum trading days, and weekly rewards — built on the same trusted rules as our Classic 2-Step Challenge.",
 phases:[{n:1,t:"Phase 1",b:"EVALUATION",d:"Target: 6% profit"},{n:2,t:"Phase 2",b:"EVALUATION",d:"Target: 6% profit"}],
 d:"3%",m:"6%",l:"1:50",t:"6% / 6%",x:"Unlimited period · 0 minimum trading days",sizes:["$25K"],prices:{"$25K":"$105"}};
const SPRINT_CHECKS=["Weekend Holding Allowed","News Trading Allowed","0 Minimum Trading Days","No Stop Loss Required","Static Drawdown","Weekly Rewards"];
const refundNote=(n)=>(n==="2-Step Challenge"||n==="1-Step Challenge")?"2-Step and 1-Step fees are refundable after 3 rewards. ":"Fees for this program are non-refundable once purchased. ";
function PlanPicker(){
 const [i,setI]=useState(0);const [size,setSize]=useState(SIZES[cmp[0].n][0]);const [variant,setVariant]=useState("standard");
 const isSprint=cmp[i].n==="2-Step Challenge"&&variant==="sprint";
 const base=cmp[i],isDirect=base.n==="Direct";
 const f=isSprint?{...INFO[base.n],badge:SPRINT.badge,tag:SPRINT.tag,desc:SPRINT.desc,phases:SPRINT.phases}:INFO[base.n];
 const r=isSprint?{...base,d:SPRINT.d,m:SPRINT.m,l:SPRINT.l,t:SPRINT.t,x:SPRINT.x}:base;
 const sizes=isSprint?SPRINT.sizes:SIZES[base.n];
 const price=z=>isSprint?(SPRINT.prices[z]||"TBA"):(PRICES[base.n]?.[z]||"TBA");
 const pap=base.n==="Pay After Pass";
 const pick=k=>{setI(k);setSize(SIZES[cmp[k].n][0]);setVariant("standard")};
 const setVar=v=>{setVariant(v);setSize(v==="sprint"?SPRINT.sizes[0]:SIZES[base.n][0])};
 const progName=isSprint?"2-Step Sprint Challenge":base.n;
 const rules=[["Daily loss",r.d],["Max drawdown",r.m],["Leverage",r.l],["Extra rule",r.x],["Drawdown type","Static"],["Stop loss",isDirect?"Required at all times":"Not required"],...(isDirect?[["Max risk per trade","1%"]]:[])];
 const checks=isSprint?SPRINT_CHECKS:CHECKS[base.n];
 return <div className="fp" style={vars(f)}><div className="fp-tabs" role="tablist">{cmp.map((c,k)=>{const I=((INFO[c.n]||{}).icon||Info);return <button key={c.n} role="tab" aria-selected={k===i} style={vars(INFO[c.n]||{})} className={"fp-tab"+(k===i?" on":"")} onClick={()=>pick(k)}><I size={16}/>{c.n}</button>})}</div>
 {base.n==="2-Step Challenge"&&<div className="fp-variant"><button className={"fp-vbtn"+(variant==="standard"?" on":"")} onClick={()=>setVar("standard")}>Standard</button><button className={"fp-vbtn"+(variant==="sprint"?" on":"")} onClick={()=>setVar("sprint")}>Sprint Challenge<span className="fp-vnew">New</span></button></div>}
 <div className="fp-grid"><div className="fp-left">
  <div className="fp-card"><span className="fp-badge">{f.badge}</span><h3>{progName}</h3><div className="fp-tag">{f.tag}</div><p>{f.desc}</p>{pap&&<div className="fp-infobox"><Clock size={18}/><span>Entry fee is just <b>$9.99</b>. Full fee charged <b>when you pass</b> and your account is activated.</span></div>}</div>
  <div className="fp-card"><div className="fp-label">{f.label}</div>{f.phases.map(p=><div className="fp-phase" key={p.t}><span className="fp-num">{p.n}</span><div><div><b>{p.t}</b><span className="fp-pill">{p.b}</span></div><small>{p.d}</small></div></div>)}</div>
  <div className="fp-card"><div className="fp-label">TRADING RULES</div><ul className="fp-rules">{rules.map(([l,v])=><li key={l}><span>{l}</span><b>{v}</b></li>)}</ul></div></div>
 <div className="fp-card"><div className="fp-rhead"><div className="fp-label">SELECT ACCOUNT SIZE</div>{pap&&<span className="fp-badge">Entry: $9.99 only</span>}</div><div className="fp-sizes">{sizes.map(z=><div key={z} className={"fp-size"+(z===size?" on":"")} onClick={()=>setSize(z)}><strong>{z}</strong><span>Account size</span><em>{price(z)}{pap&&<small>entry</small>}</em>{pap&&<div className="fp-pass"><Clock size={12}/>{PASS[z]} charged on passing</div>}<Link className="fp-btn" to={"/signup?program="+encodeURIComponent(progName)+"&size="+encodeURIComponent(z)}>Get Started</Link></div>)}</div>
 <div className="fp-notice-stack"><div className="fp-infobox note"><ShieldCheck size={16}/>{refundNote(base.n)}{isDirect&&<> This Direct account requires a Stop Loss on every trade at all times and a maximum risk of 1% per trade.</>}</div></div>
 <ul className="fp-checks">{checks.map(c=><li key={c}><Check size={16}/>{c}</li>)}</ul></div></div></div>}
const CHECKS={
"2-Step Challenge":["Weekend Holding Allowed","News Trading Allowed","6 Minimum Trading Days (3 per phase)","No Stop Loss Required","Static Drawdown","5 Trading Instruments"],
"1-Step Challenge":["Weekend Holding Allowed","News Trading Allowed","3 Minimum Trading Days","No Stop Loss Required","Static Drawdown","5 Trading Instruments"],
"Pay After Pass":["$9.99 Entry Fee","3 Profitable Days Required","No Consistency Requirement","No Stop Loss Required","Static Drawdown","5 Trading Instruments"],
"Direct":["Unlimited Trading Days","No Profit Target","Stop Loss Required at All Times","Max 1% Risk per Trade","Static Drawdown","5 Trading Instruments"]};

/* ---- Trustpilot: replace these with your real page + real reviews ---- */
const TP_URL="https://www.trustpilot.com"; // your Trustpilot page link
const TP_SCORE=null; // e.g. 4.6 (leave null to hide)
const TP_COUNT=null; // e.g. 120 (leave null to hide)
const REVIEWS=[]; // [{name:"...",stars:5,title:"...",text:"...",date:"..."}]
const PLACEHOLDERS=[1,2,3,4,5,6].map(()=>({name:"Trader name",stars:5,title:"Review title",text:"Paste a real Trustpilot review here. Reviews you add to the REVIEWS list replace these placeholders.",date:"Date"}));
function Stars({n=5,size=16}){return <span className="tp-stars" aria-label={n+" out of 5 stars"}>{[0,1,2,3,4].map(k=><span key={k} className={"tp-star"+(k<n?"":" off")}><Star size={size} fill="#fff" strokeWidth={0}/></span>)}</span>}
function Reviews(){const list=(REVIEWS.length?REVIEWS:PLACEHOLDERS).slice(0,6);return <section><div className="container"><div className="section-head center-head"><div className="mono-eye">TRUSTPILOT</div><h2>What traders say <span className="hl">about us.</span></h2>
 <div className="tp-brand"><Star size={26} fill="#00b67a" strokeWidth={0}/><b>Trustpilot</b>{TP_SCORE&&<><Stars n={Math.round(TP_SCORE)} size={18}/><span>TrustScore <b>{TP_SCORE}</b>{TP_COUNT&&<> · {TP_COUNT} reviews</>}</span></>}</div></div>
 <div className="tp-grid">{list.map((r,i)=><article className="tp-card" key={i}><Stars n={r.stars}/><h3>{r.title}</h3><p>{r.text}</p><div className="tp-user"><span className="tp-av">{r.name[0]}</span><div><b>{r.name}</b><small>{r.date}</small></div></div></article>)}</div>
 {!REVIEWS.length&&<div className="tp-note">Preview placeholders — add real reviews to the REVIEWS list in App.jsx.</div>}
 <div className="center" style={{marginTop:28}}><a className="btn btn-ghost" href={TP_URL} target="_blank" rel="noreferrer">Read all reviews on Trustpilot <ArrowRight size={16}/></a></div></div></section>}

/* Social links: replace with your real profile URLs */
const SOCIALS=[["Instagram",siInstagram,"https://www.instagram.com/electrapips?igsh=MWQ1NGt4Mm1laGx6dQ=="],["X",siX,"https://x.com/Electrapips"],["YouTube",siYoutube,"https://youtube.com/@electrapips?si=HIiQny7iyCFqVaQS"],["Telegram",siTelegram,"https://t.me"],["Discord",siDiscord,"https://discord.com"],["TikTok",siTiktok,"https://tiktok.com/@electrapips?_r=1&_t=ZM-91dPB4oLCmm"],["Facebook",siFacebook,"https://facebook.com"],["WhatsApp",siWhatsapp,"https://wa.me"]];
function Socials({big}){return <div className={"socials"+(big?" big":"")}>{SOCIALS.map(([n,i,h])=><a key={n} href={h} target="_blank" rel="noreferrer" aria-label={n} title={n}><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d={i.path}/></svg></a>)}</div>}
function Guarantees(){return <section><div className="container"><div className="section-head center-head"><div className="mono-eye">TRADE WITH CONFIDENCE</div><h2>Built to <span className="hl">protect you.</span></h2><p>Every account comes with safeguards that put traders first.</p></div><div className="guar">{[[Clock,"24-hour rewards","Approved rewards are processed within 24 hours."],[ShieldCheck,"No Stop Loss required","No Stop Loss is required on 2-Step, 1-Step, or Pay After Pass. Direct requires a Stop Loss on every position."],[CreditCard,"Fixed, published pricing","Every program and account size has a clear, published price — no hidden fees."],[Target,"Static drawdown","Maximum drawdown is based on your starting balance and never trails upward with profit."]].map(([I,t,d])=><div className="gcard" key={t}><I size={26}/><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>}
function FAQTeaser(){return <section className="light"><div className="container"><div className="section-head center-head"><div className="mono-eye">QUESTIONS</div><h2>Quick answers, <span className="hl">before you start.</span></h2></div><div className="faq faq-mini">{faqs.slice(0,4).map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div><div className="center" style={{marginTop:26}}><Button to="/faq">View all FAQs <ArrowRight size={16}/></Button></div></div></section>}

const CONTACT_EMAIL="support@electrapips.com"; // replace with your real support email
function Contact(){const [f,setF]=useState({name:"",email:"",topic:"General question",msg:"",website:""});const on=k=>e=>setF({...f,[k]:e.target.value});const ok=f.name&&f.email&&f.msg;const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);const [err,setErr]=useState("");const submit=async(e)=>{e.preventDefault();if(busy)return;setErr("");setBusy(true);try{const {data,error}=await supabase.functions.invoke("contact-telegram",{body:{name:f.name,email:f.email,topic:f.topic,message:f.msg,website:f.website}});if(error||(data&&data.error)){let m=(data&&data.error)||"";if(!m&&error){try{const j=await error.context.json();m=j.error||""}catch(x){}}setErr(m||"Could not send your message. Please try again.");setBusy(false);return}setSent(true);setF({name:"",email:"",topic:"General question",msg:"",website:""})}catch(x){setErr("Network error. Please check your connection and try again.")}setBusy(false)};const tg=SOCIALS.find(x=>x[0]==="Telegram")[2];
 return <><PageHero eyebrow="CONTACT" title="Let's talk." text="Questions about programs, rewards or partnerships? Send us a message and we will get back to you."/><section><div className="container contact-grid"><div className="cstack"><a className="cinfo" href={"mailto:"+CONTACT_EMAIL}><Mail/><div><h3>Email us</h3><p>{CONTACT_EMAIL}</p></div></a><a className="cinfo" href={tg} target="_blank" rel="noreferrer"><Send/><div><h3>Message us on Telegram</h3><p>Chat with the team directly.</p></div></a><Link className="cinfo" to="/faq"><LifeBuoy/><div><h3>Quick answers</h3><p>Browse the most common questions.</p></div></Link><div className="csocial"><small>Follow us</small><Socials/></div></div>
 <form className="login-card cf" onSubmit={submit}><h2>Send a message</h2><div className="row"><label>Name<input value={f.name} onChange={on("name")} placeholder="Your name"/></label><label>Email<input type="email" value={f.email} onChange={on("email")} placeholder="you@example.com"/></label></div><label>Topic<select value={f.topic} onChange={on("topic")}>{["General question","Programs & pricing","Rewards","Affiliate","Technical issue"].map(t=><option key={t}>{t}</option>)}</select></label><label>Message<textarea value={f.msg} onChange={on("msg")} placeholder="How can we help?" maxLength={2000}/></label><input type="text" name="website" value={f.website} onChange={on("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-9999px",width:1,height:1,opacity:0}}/>{sent&&<p style={{color:"#4ade80",fontSize:14}}>Thank you! Your message was sent to our team. We will reply to your email soon.</p>}{err&&<p style={{color:"#fb7185",fontSize:14}}>{err}</p>}<button type="submit" className={"btn btn-primary"+(ok&&!busy?"":" off")} disabled={!ok||busy}>{busy?"Sending…":"Send message"} <Send size={16}/></button><p>Your message goes straight to the ElectraPips support team on Telegram.</p></form></div></section></>}

const LEGAL={
 terms:{t:"Terms & Conditions",items:["Traders must be at least 18 years old to use ElectraPips.","Traders from all countries are welcome, subject to applicable laws and regulations.","Account sharing is strictly prohibited — do not share login credentials or allow another person to operate the account.","Copy trading, Expert Advisors, automated trading bots and automated execution systems are not allowed.","At least one trade must be placed every 90 days, or the account is closed due to inactivity.","KYC is required before a Performance Account is provided or activated."]},
 risk:{t:"Risk Disclosure",items:["Trading carries a high level of risk and may not be suitable for everyone.","Simulated results do not represent, and are not indicative of, future results on real-money trading.","Past performance, including any figures shown on this website, is not a guarantee of future performance.","No profit target, program, or account model guarantees a profit or protects against loss."]},
 simulated:{t:"Simulated Trading Disclosure",items:["All ElectraPips accounts, including Performance Accounts, operate in a simulated/demo environment.","ElectraPips accounts are not real-money brokerage accounts.","Accounts do not represent allocations of live trading capital."]},
 privacy:{t:"Privacy Policy",items:["Information submitted to ElectraPips (such as account and KYC details) is used to operate your account and meet verification requirements.","ElectraPips does not sell personal information to third parties for marketing purposes."]},
 cookies:{t:"Cookie Policy",items:["This website may use cookies and similar technologies to keep you signed in and to understand how the site is used.","You can control or disable cookies through your browser settings; some site features may not work correctly without them."]},
 refunds:{t:"Refund Policy",items:["2-Step and 1-Step challenge fees are refundable after 3 rewards have been completed.","Pay After Pass and Direct challenge fees are non-refundable once purchased."]}};
function Legal(){const {section}=useParams();const cur=LEGAL[section]?section:"terms",d=LEGAL[cur];return <><PageHero eyebrow="LEGAL" title={d.t} text="A summary of the terms shown across the ElectraPips website."/><section><div className="container legal-grid"><aside className="legal-nav">{Object.entries(LEGAL).map(([k,v])=><Link key={k} to={"/legal/"+k} className={k===cur?"active":""}>{v.t}</Link>)}</aside><div className="legal-body"><ul>{d.items.map(x=><li key={x}><Check size={18}/>{x}</li>)}</ul><div className="notice"><strong>Need the full agreement?</strong> For complete terms and conditions, please <Link to="/contact">contact us</Link>.</div></div></div></section></>}

/* Payout wall: add REAL payouts (with each trader's permission). photo = image URL */
const PAYOUTS=[]; // [{name:"...",country:"SA",amount:"$4,254.82",photo:"https://..."}]
const PH_PAY=Array.from({length:8},()=>({name:"Trader name",country:"XX",amount:"$0,000.00"}));
function PayoutWall(){const real=PAYOUTS.length>0,list=real?PAYOUTS:PH_PAY,loop=[...list,...list];return <section className="pw"><div className="container"><div className="section-head center-head"><div className="mono-eye">REWARD WALL</div><h2>Traders <span className="hl">getting paid.</span></h2></div></div>
 <div className="pw-track-wrap"><div className="pw-track">{loop.map((p,i)=><div className={"pw-card v"+(i%list.length%3)} key={i} style={p.photo?{backgroundImage:"url("+p.photo+")"}:undefined}>{!p.photo&&<User className="pw-ph" size={96} strokeWidth={1.2}/>}<div className="pw-info"><div><b>{p.name}</b><span>{p.country}</span></div><strong>{p.amount}</strong></div></div>)}</div></div>
 {!real&&<div className="tp-note">Preview placeholders — add real rewards to the PAYOUTS list in App.jsx.</div>}</section>}

function Global(){const pts=[[Globe,"Accessible by design","Built to be accessible to more traders, subject to applicable laws and eligibility."],[Layers,"One set of clear rules","Every rule for every program is published clearly in one place."],[Wallet,"Crypto rewards","Rewards are made through crypto under the current reward terms."],[TrendingUp,"Five markets","Forex, Gold/XAUUSD, Indices, Commodities and Crypto."]];
 return <section className="light"><div className="container glb"><div><div className="mono-eye" style={{marginBottom:14}}>GLOBAL ACCESS</div><h2>Built for traders from <span className="hl">around the world.</span></h2><p className="glb-p">Simulated prop trading with clear rules, designed to be accessible to more traders.</p><ul className="glb-list">{pts.map(([I,t,d])=><li key={t}><I/><div><b>{t}</b><span>{d}</span></div></li>)}</ul></div>
 <svg viewBox="0 0 400 400" className="globe" aria-hidden="true"><defs><radialGradient id="gl" cx=".35" cy=".3"><stop offset="0" stopColor="#2f7bff" stopOpacity=".45"/><stop offset="1" stopColor="#0a1230" stopOpacity=".2"/></radialGradient></defs><circle cx="200" cy="200" r="170" fill="url(#gl)" stroke="#2f5bd0" strokeOpacity=".6"/>{[150,105,55].map(r=><ellipse key={r} cx="200" cy="200" rx={r} ry="170" fill="none" stroke="#5aa2ff" strokeOpacity=".28"/>)}{[-110,-55,0,55,110].map(y=><ellipse key={y} cx="200" cy={200+y} rx={Math.sqrt(170*170-y*y)} ry="14" fill="none" stroke="#5aa2ff" strokeOpacity=".22"/>)}{[[150,120],[240,150],[120,230],[280,260],[200,320],[210,95],[300,190]].map(([x,y],i)=><circle key={i} className="gd" style={{animationDelay:i*.35+"s"}} cx={x} cy={y} r="4.5" fill="#38bdf8"/>)}</svg></div></section>}

function Support(){
 const [uid,setUid]=useState(null),[ready,setReady]=useState(false);
 const [convs,setConvs]=useState([]),[active,setActive]=useState(null),[msgs,setMsgs]=useState([]);
 const [mode,setMode]=useState("list"),[text,setText]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState("");
 const [form,setForm]=useState({name:"",email:"",topic:"Programs & pricing",body:""});
 const TOPICS=["Programs & pricing","Rewards","Trading rules","Refunds","Account / technical","Other"];
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUid(data?.user?.id||null);setReady(true);if(data?.user?.email)setForm(f=>({...f,email:data.user.email}))})},[]);
 useEffect(()=>{if(!uid)return;let live=true;const load=async()=>{const {data}=await supabase.from("support_conversations").select("id,subject,status,last_message_at,created_at").eq("trader_id",uid).order("last_message_at",{ascending:false}).limit(100);if(live&&data)setConvs(data)};load();const t=setInterval(load,5000);return()=>{live=false;clearInterval(t)}},[uid]);
 useEffect(()=>{if(!active)return;let live=true;const load=async()=>{const {data}=await supabase.from("support_messages").select("id,sender_type,body,created_at").eq("conversation_id",active).order("created_at",{ascending:true}).limit(300);if(live&&data)setMsgs(data)};load();const t=setInterval(load,3000);return()=>{live=false;clearInterval(t)}},[active]);
 const openConv=(id)=>{setActive(id);setMode("thread");setErr("")};
 const startNew=async(e)=>{e.preventDefault();setErr("");
   if(!form.name.trim()||!form.email.trim()||!form.body.trim()){setErr("Please fill in your name, email and message.");return}
   if(!/^\S+@\S+\.\S+$/.test(form.email.trim())){setErr("Please enter a valid email address.");return}
   setBusy(true);
   const {data:c,error:ce}=await supabase.from("support_conversations").insert({trader_id:uid,subject:form.topic,status:"active",contact_name:form.name.trim(),contact_email:form.email.trim()}).select("id").single();
   if(ce){setBusy(false);setErr("Could not start the chat. Please try again.");return}
   const {error:me}=await supabase.from("support_messages").insert({conversation_id:c.id,sender_id:uid,sender_type:"trader",body:form.body.trim()});
   setBusy(false); if(me){setErr("Message could not be sent.");return}
   setForm(f=>({...f,body:""})); setConvs(v=>[{id:c.id,subject:form.topic,status:"active",last_message_at:new Date().toISOString(),created_at:new Date().toISOString()},...v]);
   openConv(c.id)};
 const sendMsg=async(e)=>{e.preventDefault();const v=text.trim();if(!v||!active)return;setBusy(true);setErr("");
   const {error}=await supabase.from("support_messages").insert({conversation_id:active,sender_id:uid,sender_type:"trader",body:v});
   setBusy(false); if(error){setErr("Message could not be sent.");return}
   setText(""); const {data}=await supabase.from("support_messages").select("id,sender_type,body,created_at").eq("conversation_id",active).order("created_at",{ascending:true}).limit(300); if(data)setMsgs(data)};
 const fmt=(iso)=>new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
 const current=convs.find(c=>c.id===active);
 return <>
  <PageHero eyebrow="SUPPORT" title="How can we help?" text="Chat with the ElectraPips support team. Your conversations are saved here."/>
  <section><div className="container">
   {!ready?null:!uid?<div className="sp-signin pt-card"><h3>Sign in to chat with our team</h3><p>Your conversations are saved to your account, so you can return to them at any time.</p><div className="sp-row"><Link className="btn btn-primary" to="/login">Sign in <ArrowRight size={15}/></Link><Link className="btn btn-ghost" to="/signup">Create account</Link></div></div>
   :<div className="sp-layout">
     <aside className="sp-side pt-card">
       <button className="btn btn-primary sp-new" onClick={()=>{setMode("new");setActive(null);setErr("")}}>+ New chat</button>
       <div className="sp-list-title">Your conversations</div>
       {convs.length===0&&<p className="sp-empty">No conversations yet.</p>}
       {convs.map(c=><button key={c.id} className={"sp-item"+(active===c.id?" on":"")} onClick={()=>openConv(c.id)}><b>{c.subject||"Support"}</b><span>{fmt(c.last_message_at||c.created_at)}</span><i className={"sp-st "+c.status}>{c.status}</i></button>)}
     </aside>
     <div className="sp-main pt-card">
       {mode==="new"&&<form className="sp-form" onSubmit={startNew}>
         <h3>Start a new chat</h3>
         <div className="sp-grid2">
           <label className="pt-field">Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>
           <label className="pt-field">Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
         </div>
         <label className="pt-field">Topic<select value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}>{TOPICS.map(t=><option key={t}>{t}</option>)}</select></label>
         <label className="pt-field">Message<textarea rows={5} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Describe how we can help…" maxLength={2000}/></label>
         {err&&<p className="sp-err">{err}</p>}
         <button className="btn btn-primary" disabled={busy}>{busy?"Sending…":"Start chat"}</button>
       </form>}
       {mode==="thread"&&current&&<>
         <div className="sp-thead"><div><h3>{current.subject||"Support"}</h3><span className={"sp-st "+current.status}>{current.status}</span></div></div>
         <div className="sp-msgs">{msgs.length===0&&<p className="sp-empty">Send a message to start the conversation.</p>}
           {msgs.map(m=><div key={m.id} className={"sp-msg "+(m.sender_type==="trader"?"me":"team")}>{m.sender_type!=="trader"&&<small>ElectraPips Team</small>}<p>{m.body}</p><time>{fmt(m.created_at)}</time></div>)}
         </div>
         {err&&<p className="sp-err">{err}</p>}
         <form className="sp-compose" onSubmit={sendMsg}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Type your message…" maxLength={2000}/><button className="btn btn-primary" disabled={busy||!text.trim()}>Send</button></form>
       </>}
       {mode==="list"&&<div className="sp-welcome"><h3>Select a conversation</h3><p>Pick one from the list, or start a new chat.</p><button className="btn btn-primary" onClick={()=>{setMode("new");setActive(null)}}>+ New chat</button></div>}
     </div>
   </div>}
  </div></section>
 </>}

function Counter({to,pre="",suf="",dur=1800}){const [v,setV]=useState(0),ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;let raf,done=false;
  if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches){setV(to);return}
  const run=()=>{const t0=performance.now(),tick=t=>{const p=Math.min(1,(t-t0)/dur);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
  const io=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!done){done=true;run();io.disconnect()}},{threshold:.4});io.observe(el);
  return()=>{io.disconnect();cancelAnimationFrame(raf)}},[to,dur]);
 return <span ref={ref}>{pre}{v.toLocaleString("en-US")}{suf}</span>}
const NUMS=[[600,"$","K","Max Funding","per account",Wallet],[90,"","%","Profit Split","up to",TrendingUp],[5000,"","","Customers","and counting",Users],[250,"$","K","Total Rewards","issued to date",Trophy],[160,"","+","Countries","supported",Globe],[1,"","-Day","Reward Speed","processing",Zap]];
function StatsBar(){return <section className="nums"><div className="container"><div className="section-head center-head"><div className="mono-eye">BY THE NUMBERS</div><h2>ElectraPips <span className="hl">in numbers.</span></h2></div><div className="nums-grid">{NUMS.map(([n,pre,x,l,sub,I])=><div className="num-item" key={l}><span className="ni-ico"><I size={22}/></span><strong><Counter to={n} pre={pre} suf={x}/></strong><b>{l}</b><em>{sub}</em></div>)}</div></div></section>}

/* Payout proof: add real, consented payouts. Use "photo" for a screenshot image, or name/country/amount/date for a text card */
const PROOFS=[{photo:"/proofs/EP-PO-2026-0006.png"},{photo:"/proofs/EP-PO-2026-0007.png"},{photo:"/proofs/EP-PO-2026-0008.png"},{photo:"/proofs/EP-PO-2026-0009.png"}]; // add more: [{photo:"https://..."}] or [{name:"...",country:"SA",amount:"$4,254.82",date:"Sep 2026"}]
const PH_PROOF=Array.from({length:10},()=>({name:"Trader name",country:"XX",amount:"$0,000.00",date:"— —"}));
function PayoutProof(){const real=PROOFS.length>0,base=(real?PROOFS:PH_PROOF).slice(0,10),loop=[...base,...base];
 return <section className="proof"><div className="container"><div className="section-head center-head"><div className="mono-eye">REWARD PROOF</div><h2>Real traders. <span className="hl">Real rewards.</span></h2><p>A snapshot of recent trader rewards.</p></div></div>
 <div className="proof-track-wrap"><div className="proof-track">{loop.map((p,i)=>p.photo?<div className="proof-shot" key={i}><img src={p.photo} alt="Reward proof"/></div>:<div className="proof-card" key={i}><span className="proof-av">{p.name[0]}</span><b>{p.name}</b><span className="proof-cc">{p.country}</span><strong>{p.amount}</strong><small>{p.date}</small></div>)}</div></div>
 <div className="container">{!real&&<div className="tp-note">Preview placeholders — send your reward screenshots and I'll add them to the PROOFS list in App.jsx.</div>}</div></section>}

const CERT_DEFS={
 "Phase 1 Passed":{badge:"PHASE 1 PASSED",title:"Phase 1 Certificate",lead:"has successfully passed Phase 1 of the ElectraPips Evaluation with an account size of",accent:"#2f7bff"},
 "Phase 2 Passed":{badge:"PHASE 2 PASSED",title:"Phase 2 Certificate",lead:"has successfully passed Phase 2 of the ElectraPips Evaluation with an account size of",accent:"#2f7bff"},
 "Challenge Passed":{badge:"CHALLENGE PASSED",title:"Challenge Certificate",lead:"has successfully completed the ElectraPips Challenge with an account size of",accent:"#4ade80"},
 "Funded Account":{badge:"PERFORMANCE ACCOUNT",title:"Performance Trader Certificate",lead:"has been awarded an ElectraPips Performance Account with an account size of",accent:"#f5a524"},
 "First Payout":{badge:"PAYOUT ISSUED",title:"Payout Certificate",lead:"has received a reward from their ElectraPips trading account in the amount of",accent:"#38bdf8"}};
function CertDoc({c}){const d=CERT_DEFS[c.type]||CERT_DEFS["Phase 1 Passed"];
 const boxes=c.type==="First Payout"?[["Program",c.program],["Reward No.",c.payoutNo]]
  :c.type==="Funded Account"?[["Program",c.program],["Trader Since",c.traderSince],["Award Level",c.awardLevel]]
  :c.type==="Challenge Passed"?[["Program",c.program],["Profit Split",c.profitSplit],["Award Level",c.awardLevel]]
  :[["Program",c.program],["Profit Target",c.profitTarget],["Award Level",c.awardLevel]];
 const big=c.type==="First Payout"?c.payoutAmount:c.accountSize;
 return <div className="cert-doc" style={{"--accent":d.accent}}>
  <div className="cert-doc-bar"/>
  <div className="cert-doc-head"><div className="cert-doc-brand"><img src={logo} alt=""/><b>ElectraPips</b></div><span className="cert-doc-no">Certificate No. {c.certNo}</span></div>
  <div className="cert-doc-mid">
   <span className="cert-doc-badge"><i/>{d.badge}</span>
   <h2>{d.title}</h2><div className="cert-doc-sub">THIS CERTIFICATE CONFIRMS THAT</div>
   <h1>{c.name}</h1>
   <p>{d.lead}</p>
   <div className="cert-doc-big">{big}</div>
   <div className="cert-doc-boxes">{boxes.filter(([,v])=>v!=null&&v!=="").map(([l,v])=><div className="cert-doc-box" key={l}><small>{l.toUpperCase()}</small><b><i/>{v}</b></div>)}</div>
  </div>
  <div className="cert-doc-foot"><div className="cert-doc-sig"><span className="cert-doc-sign">ElectraPips Management</span><small>Authorized signatory</small></div>
   <div className="cert-doc-seal"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1"/><text x="50" y="22" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" letterSpacing="1">PAYOUT · CONFIRMED</text><text x="50" y="85" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" letterSpacing="1">ELECTRAPIPS</text><text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">EP</text></svg></div>
   <div className="cert-doc-date"><small>DATE ISSUED</small><b>{c.date}</b></div></div>
 </div>}

const PORTAL_NAV_GROUPS=[
 ["Trading",[["/portal","Overview",LayoutDashboard],["/portal/accounts","My Accounts",Layers],["/portal/challenges","Buy a Challenge",Target]]],
 ["Finance",[["/portal/withdrawals","Rewards",Wallet],["/portal/affiliate","Affiliate",Share2]]],
 ["Rewards",[["/portal/certificates","Certificates",Award],["/portal/offers","Offers",Gift]]],
 ["Account",[["/portal/settings","Settings",Settings]]]
];
function PortalShell({active,children}){const [open,setOpen]=useState(false);const PV=usePortalData().view;const PN=PV?PV.profile.name:"Trader";const PI=(PN||"T")[0].toUpperCase();const PID=PV?PV.profile.id:"";
 useEffect(()=>{document.body.classList.add("portal-mode");return()=>document.body.classList.remove("portal-mode")},[]);
 return <div className="pt">
 <header className="pt-top"><button className="pt-burger" aria-label="Menu" onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<LayoutDashboard size={20}/>}</button>
  <Link to="/portal" className="pt-brand"><img src={logo} alt=""/><span>ElectraPips</span><em>Portal</em></Link>
  <div className="pt-top-right"><Link to="/" className="pt-ghost">View Website</Link><button className="pt-icon-btn" aria-label="Notifications"><Bell size={18}/><i className="pt-dot"/></button><div className="pt-user"><span className="pt-av">{PI}</span><div className="pt-user-txt"><b>{PN}</b><small>Trader</small></div><Link to="/login" className="pt-logout" title="Log out"><LogOut size={16}/></Link></div></div></header>
 <div className="pt-body">
  {open&&<div className="pt-scrim" onClick={()=>setOpen(false)}/>}
  <aside className={"pt-side"+(open?" open":"")}>
   
   {PORTAL_NAV_GROUPS.map(([group,items])=><div className="pt-nav-group" key={group}><div className="pt-side-label">{group.toUpperCase()}</div>
    {items.map(([to,label,I])=><Link key={to} to={to} className={"pt-nav"+(active===to?" on":"")} onClick={()=>setOpen(false)}><I size={18}/>{label}</Link>)}</div>)}
   
  </aside>
  <main className="pt-main">{children}</main>
 </div></div>}

function PtHead({title,text,children}){return <div className="pt-head"><div><h1>{title}</h1><p>{text}</p></div>{children}</div>}
const PT_ICON={Balance:Wallet,Equity:BarChart3,"Profit/Loss":TrendingUp,"Daily Drawdown":ArrowDownRight,"Maximum Drawdown":ArrowDownRight,"Profit Target":Target,"Daily P&L":ArrowUpRight};
function PtStat({label,value,sub,tone}){const I=PT_ICON[label]||Info;return <div className={"pt-stat"+(tone?" "+tone:"")}><span className="pt-stat-ico"><I size={15}/></span><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>}
function PtBar({label,pct,max,unit="%"}){const p=Math.min(100,(pct/max)*100);return <div className="pt-bar"><div className="pt-bar-head"><span>{label}</span><b>{pct}{unit} / {max}{unit}</b></div><div className="pt-bar-track"><i style={{width:p+"%"}}/></div></div>}
function PtChart(){const d="M0 150 L40 138 L80 145 L120 110 L160 120 L200 85 L240 95 L280 60 L320 72 L360 40 L400 50";
 return <div className="pt-chart"><svg viewBox="0 0 400 170" preserveAspectRatio="none">
 <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7bff" stopOpacity=".35"/><stop offset="1" stopColor="#2f7bff" stopOpacity="0"/></linearGradient></defs>
 {[35,75,115,155].map(y=><line key={y} x1="0" x2="400" y1={y} y2={y} className="pt-grid"/>)}
 <path d={d+" L400 170 L0 170Z"} fill="url(#pg)"/><path d={d} fill="none" stroke="#2f7bff" strokeWidth="3" strokeLinejoin="round"/>
 <circle cx="400" cy="50" r="4.5" fill="#38bdf8"/></svg>
 <div className="pt-chart-legend"><span><i className="d1"/>Balance</span><span><i className="d2"/>Equity</span><span><i className="d3"/>Profit/Loss</span></div></div>}

function OvSummaryCard({I,label,value,sub,tone}){return <div className={"ov-scard"+(tone?" "+tone:"")}><span className="ov-scard-ico"><I size={16}/></span><span className="ov-scard-label">{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>}

function usePortalData(){const [st,setSt]=useState({loading:true,signedIn:false,view:EMPTY_VIEW,updatedAt:null});
 useEffect(()=>{let live=true,busy=false;
   const load=()=>{if(busy)return;busy=true;loadPortalData().then(d=>{if(!live)return;const v=buildView(d);setSt({loading:false,signedIn:!!v,view:v||EMPTY_VIEW,updatedAt:new Date()})}).catch(()=>{if(live)setSt(x=>({...x,loading:false,signedIn:false,view:EMPTY_VIEW}))}).finally(()=>{busy=false})};
   load();
   const t=setInterval(load,1000);
   return()=>{live=false;clearInterval(t)}},[]);
 return st}
const EMPTY_ACC={id:"—",program:"",size:"$0",sizeNum:0,phase:null,status:"",balance:0,equity:0,profit:0,dailyDD:0,dailyDDMax:0,maxDD:0,maxDDMax:0,target:null,targetProgress:null,days:0,minDays:0};
const WIZ_PROGRAMS=["2-Step Challenge","1-Step Challenge","Pay After Pass","Direct"];
const ZERO_SUM={totalAccounts:0,activeAccounts:0,totalCapital:0,totalProfit:0,totalWithdrawn:0,availableWithdrawal:0,pendingWithdrawal:0,lastWithdrawal:0,totalTrades:0,winRate:0};
const toMsg=(x)=>typeof x==="string"?x:((x&&x.message)||(x?JSON.stringify(x):"Unknown error"));
const fm=(n)=>"$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmS=(n)=>(n>=0?"+":"−")+fm(Math.abs(n));
const NoData=({text})=><div className="pt-card" style={{textAlign:"center",color:"#64748b",fontSize:14,padding:28}}>{text}</div>;
function PortalOverview(){const P=usePortalData();const V=P.view;const [tf,setTf]=useState("30D");
 const today=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 const S=V?V.summary:ZERO_SUM; const a=V&&V.accounts[0]; const name=V?V.profile.name:"Trader";
 const chartD=V&&V.chart[tf];
 return <PortalShell active="/portal">
  {!P.loading&&!P.signedIn&&<div className="pt-notice"><Info size={16}/>Sign in to see your real account data. <a href="#/login" style={{color:"#5aa2ff",fontWeight:600,marginLeft:6}}>Sign in</a></div>}
  <div className="ov-head"><div><h1>Welcome back, {name}</h1><p>Here's your complete trading performance overview.</p></div>
   <div className="ov-head-right"><span className="ov-date"><Clock size={13}/>{today}</span><span className="pt-status on">All Systems Active</span></div></div>
  <div className="ov-summary-grid">
   <OvSummaryCard I={Layers} label="Total Accounts" value={S.totalAccounts} sub={S.activeAccounts+" Active"}/>
   <OvSummaryCard I={CheckCircle2} label="Active Accounts" value={S.activeAccounts} sub={(S.totalAccounts-S.activeAccounts)+" other"} tone="pos"/>
   <OvSummaryCard I={Wallet} label="Total Trading Capital" value={fm(S.totalCapital)} sub="Combined starting balance"/>
   <OvSummaryCard I={TrendingUp} label="Total Profit" value={fmS(S.totalProfit)} sub={S.totalCapital?((S.totalProfit/S.totalCapital)*100).toFixed(1)+"% overall":"—"} tone={S.totalProfit>=0?"pos":""}/>
   <OvSummaryCard I={ArrowDownToLine} label="Total Rewards" value={fm(S.totalWithdrawn)} sub="Lifetime rewards"/>
   <OvSummaryCard I={CreditCard} label="Available for Reward" value={fm(S.availableWithdrawal)} sub="Ready to request"/>
   <OvSummaryCard I={BarChart3} label="Total Trades" value={S.totalTrades} sub="Across all accounts"/>
   <OvSummaryCard I={Target} label="Overall Win Rate" value={S.winRate+"%"} sub="All closed trades" tone="pos"/>
  </div>

  <h2 className="pt-sec">My Accounts</h2>
  {!V||!V.accounts.length?<NoData text="No trading accounts yet. Your accounts appear here once one is assigned to you."/>:<>
  <div className="table-wrap ov-acc-table"><table className="table"><thead><tr><th>Account</th><th>Program</th><th>Size</th><th>Balance</th><th>Equity</th><th>Profit</th><th>Drawdown</th><th>Status</th><th></th></tr></thead>
  <tbody>{V.accounts.map(ac=><tr key={ac.rowId}><td className="mono">{ac.id}</td><td>{ac.program}</td><td><b>{ac.size}</b></td><td>{fm(ac.balance)}</td><td>{fm(ac.equity)}</td><td className={ac.profit>=0?"pos":"neg"}>{fmS(ac.profit)}</td><td>{ac.maxDD}%</td>
  <td><span className={"pt-status "+(ac.status==="ACTIVE"?"on":ac.status==="PASSED"?"pass":"")}>{ac.status}</span></td><td><Link to={"/portal/accounts/"+ac.rowId} className="ov-view">View <ArrowRight size={13}/></Link></td></tr>)}</tbody></table></div>
  <div className="ov-acc-cards">{V.accounts.map(ac=><div className="pt-acc-card" key={ac.rowId}><div className="pt-acc-top"><div><h3>{ac.size} {ac.program}</h3><span className="pt-id">{ac.id}</span></div><span className={"pt-status "+(ac.status==="ACTIVE"?"on":ac.status==="PASSED"?"pass":"")}>{ac.status}</span></div>
  <div className="pt-acc-stats"><div><small>Balance</small><b>{fm(ac.balance)}</b></div><div><small>Equity</small><b>{fm(ac.equity)}</b></div><div><small>Profit</small><b className={ac.profit>=0?"pos":"neg"}>{fmS(ac.profit)}</b></div><div><small>Drawdown</small><b>{ac.maxDD}%</b></div></div>
  <Link className="btn btn-primary" to={"/portal/accounts/"+ac.rowId}>View Account <ArrowRight size={15}/></Link></div>)}</div></>}

  <div className="pt-two">
   <div className="pt-card"><div className="ov-chart-head"><h2>Performance</h2><div className="ov-tf">{["7D","30D","90D","All Time"].map(t=><button key={t} className={"ov-tf-btn"+(tf===t?" on":"")} onClick={()=>setTf(t)}>{t}</button>)}</div></div>
    {chartD?<><div className="pt-chart"><svg viewBox="0 0 400 170" preserveAspectRatio="none"><defs><linearGradient id="ovg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7bff" stopOpacity=".35"/><stop offset="1" stopColor="#2f7bff" stopOpacity="0"/></linearGradient></defs>
     <path d={chartD+" L400 170 L0 170Z"} fill="url(#ovg)"/><path d={chartD} fill="none" stroke="#2f7bff" strokeWidth="3" strokeLinejoin="round"/></svg>
     <div className="pt-chart-legend"><span><i className="d1"/>Equity</span></div></div>
     <div className="ov-chart-stats"><div><small>Total Change</small><b className={V.chartStats.totalProfit.startsWith("-")?"neg":"pos"}>{V.chartStats.totalProfit}</b></div><div><small>Avg. Daily P/L</small><b>{V.chartStats.avgDaily}</b></div><div><small>Best Day</small><b className="pos">{V.chartStats.best}</b></div><div><small>Worst Day</small><b className="neg">{V.chartStats.worst}</b></div></div></>
    :<p className="ov-sub" style={{padding:"40px 0",textAlign:"center"}}>No equity history yet for this period.</p>}</div>
   <div className="pt-card"><h2>Risk &amp; Progress</h2>{a?<>{a.target&&<PtBar label="Profit Target" pct={Number((a.targetProgress||0).toFixed(1))} max={a.target}/>}<PtBar label="Daily Drawdown" pct={a.dailyDD} max={a.dailyDDMax||1}/><PtBar label="Maximum Drawdown" pct={a.maxDD} max={a.maxDDMax||1}/><PtBar label="Trading Days" pct={a.days} max={Math.max(a.days,a.minDays,1)} unit=""/></>:<p className="ov-sub">No account yet.</p>}</div>
  </div>

  <h2 className="pt-sec">Trading Statistics</h2>
  <div className="ov-stat-grid">{(V?V.stats:["Total Trades","Winning Trades","Losing Trades","Win Rate","Average Win","Average Loss","Largest Win","Largest Loss","Profit Factor","Average R:R","Avg. Holding Time"].map(l=>[l,"—"])).map(([l,v])=><div className="ov-mini-stat" key={l}><span>{l}</span><b className={String(v).startsWith("−")?"neg":""}>{v}</b></div>)}</div>

  <div className="pt-two">
   <div className="pt-card"><h2>Top Traded Pairs</h2>{V&&V.topPairs.length?V.topPairs.map(([sym,n,pct])=><div className="ov-pair-row" key={sym}><div className="ov-pair-head"><b>{sym}</b><span>{n} trades · {pct}%</span></div><div className="pt-bar-track"><i style={{width:pct+"%"}}/></div></div>):<p className="ov-sub">No trades yet.</p>}</div>
   <div className="pt-card"><h2>Best Performing Pairs</h2>{V&&V.bestPairs.length?V.bestPairs.map(([sym,pl])=><div className="ov-best-row" key={sym}><b>{sym}</b><span className={pl>=0?"pos":"neg"}>{fmS(pl)}</span></div>):<p className="ov-sub">No closed trades yet.</p>}</div>
  </div>

  <h2 className="pt-sec">Trading Discipline</h2>
  <p className="ov-sub">Analytics based on your recent trading activity — not a judgment of skill.</p>
  {V&&V.discipline.length?<div className="ov-disc-grid">{V.discipline.map(([l,v])=><div className="ov-disc-card" key={l}><div className="ov-disc-ring" style={{"--p":v}}><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" className="ov-ring-bg"/><circle cx="22" cy="22" r="18" className="ov-ring-fg" style={{strokeDasharray:113,strokeDashoffset:113-(113*v/100)}}/></svg><b>{v}%</b></div><span>{l}</span></div>)}
   <div className="ov-disc-card plain"><small>Average Risk per Trade</small><b>{V.avgRisk}</b></div><div className="ov-disc-card plain"><small>Average Position Size</small><b>{V.avgLots}</b></div></div>:<NoData text="Discipline analytics appear after your first trades."/>}

  <h2 className="pt-sec">Trading Activity — {new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</h2>
  {V&&V.activity.some(d=>d.trades)?<><div className="ov-heatmap">{V.activity.map(d=><div key={d.day} className={"ov-hcell"+(d.trades===0?" empty":d.pl>=0?" pos":" neg")} title={"Day "+d.day+" · "+d.trades+" trades · "+fmS(d.pl)+" · "+d.win+"% win rate"}>{d.day}</div>)}</div>
   <div className="ov-heat-legend"><span><i className="empty"/>No trades</span><span><i className="pos"/>Profitable</span><span><i className="neg"/>Loss</span></div></>:<NoData text="No trades this month yet."/>}

  <div className="ov-days-grid">
   <div className="pt-card ov-day best"><span className="ov-day-tag"><Trophy size={14}/>Best Trading Day</span>{V&&V.bestDay?<><h3>{V.bestDay.date}</h3><strong className="pos">{fmS(V.bestDay.pl)}</strong><div className="ov-day-meta"><span>{V.bestDay.trades} trades</span><span>{V.bestDay.winRate}% win rate</span></div></>:<p className="ov-sub">No closed trades yet.</p>}</div>
   <div className="pt-card ov-day worst"><span className="ov-day-tag"><ArrowDownRight size={14}/>Worst Trading Day</span>{V&&V.worstDay?<><h3>{V.worstDay.date}</h3><strong className="neg">{fmS(V.worstDay.pl)}</strong><div className="ov-day-meta"><span>{V.worstDay.trades} trades</span><span>{V.worstDay.winRate}% win rate</span></div></>:<p className="ov-sub">No closed trades yet.</p>}</div></div>

  <div className="ov-sec-head"><h2 className="pt-sec" style={{margin:0}}>Recent Trades</h2>{a&&<Link to={"/portal/accounts/"+a.rowId} className="ov-view">View All Trades <ArrowRight size={13}/></Link>}</div>
  {V&&V.trades.length?<div className="table-wrap"><table className="table"><thead><tr><th>Symbol</th><th>Direction</th><th>Lot Size</th><th>Entry</th><th>Exit</th><th>P/L</th><th>Duration</th><th>Date</th></tr></thead>
  <tbody>{V.trades.map(t=><tr key={t.id}><td><b>{t.symbol}</b></td><td>{t.dir}</td><td>{t.lot}</td><td>{t.entry}</td><td>{t.exit}</td><td className={t.pl>=0?"pos":"neg"}>{fmS(t.pl)}</td><td>{t.dur}</td><td>{t.date}</td></tr>)}</tbody></table></div>:<NoData text="No closed trades yet."/>}

  <h2 className="pt-sec">Rewards</h2>
  <div className="ov-wd-grid"><div className="pt-stat"><span>Total Rewards</span><strong>{fm(S.totalWithdrawn)}</strong></div><div className="pt-stat"><span>Last Reward</span><strong>{fm(S.lastWithdrawal)}</strong></div><div className="pt-stat"><span>Pending</span><strong>{fm(S.pendingWithdrawal)}</strong></div></div>
  {V&&V.withdrawals.length?<div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>{V.withdrawals.slice(0,3).map((w,i)=><tr key={i}><td>{w.date}</td><td><b>{fm(w.amount)}</b></td><td>{w.method}</td><td><span className={"pt-pill "+w.raw}>{w.status}</span></td></tr>)}</tbody></table></div>:<NoData text="No reward requests yet."/>}

  <h2 className="pt-sec">Quick Actions</h2>
  <div className="pt-qa">{[[Layers,"View Accounts","/portal/accounts"],[Target,"Buy a Challenge","/portal/challenges"],[Wallet,"Request Reward","/portal/withdrawals"],[BarChart3,"View Trades",a?"/portal/accounts/"+a.rowId:"/portal/accounts"]].map(([I,t,to])=><Link key={t} to={to} className="pt-qa-card"><span className="pt-qa-ico"><I size={19}/></span>{t}<ArrowRight size={15}/></Link>)}</div>
 </PortalShell>}

function PortalAccounts(){const P=usePortalData();const V=P.view;const [f,setF]=useState("All");const [q,setQ]=useState("");const [busy,setBusy]=useState("");
 const all=V?V.accounts:[];
 const cnt=(k)=>all.filter(a=>k==="Archived"?a.archived:(!a.archived&&(k==="All"||a.rawStatus===k.toLowerCase()||(k==="Active"&&a.status==="ACTIVE")))).length;
 const list=all.filter(a=>{
   if(f==="Archived")return a.archived;
   if(a.archived)return false;
   if(f==="All")return true;
   return a.rawStatus===f.toLowerCase();
 }).filter(a=>!q.trim()||String(a.id).toLowerCase().includes(q.trim().toLowerCase())||String(a.program).toLowerCase().includes(q.trim().toLowerCase()));
 const toggleArchive=async(ac)=>{setBusy(ac.rowId);const {error}=await supabase.rpc("set_account_archived",{p_account_id:ac.rowId,p_archived:!ac.archived});setBusy("");if(error)alert(error.message)};
 const FILTERS=["All","Active","Passed","Failed","Archived"];
 return <PortalShell active="/portal/accounts"><PtHead title="My Accounts" text="All your ElectraPips trading accounts, newest first."/>
 <div className="acc-toolbar">
   <div className="acc-tabs">{FILTERS.map(k=><button key={k} className={"acc-tab"+(f===k?" on":"")} onClick={()=>setF(k)}>{k}<em>{cnt(k)}</em></button>)}</div>
   <div className="acc-search"><Search size={16}/><input placeholder="Search account or program…" value={q} onChange={e=>setQ(e.target.value)}/></div>
 </div>
 {!V?<NoData text="Sign in to see your accounts."/>:!list.length?<NoData text={f==="Archived"?"No archived accounts.":"No accounts match this filter."}/>:
 <div className="pt-acc-list">{list.map(ac=><div className={"pt-acc-card"+(ac.archived?" is-archived":"")} key={ac.rowId}>
   <div className="pt-acc-top"><div><h3>{ac.size} {ac.program}</h3><span className="pt-id">{ac.id}</span>{ac.phase&&<span className="pt-phase">{ac.phase}</span>}{ac.openedAt&&<span className="acc-date">Opened {new Date(ac.openedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>}</div>
   <span className={"pt-status "+(ac.status==="ACTIVE"?"on":ac.status==="PASSED"?"pass":"")}>{ac.status}</span></div>
   <div className="pt-acc-stats"><div><small>Balance</small><b>{fm(ac.balance)}</b></div><div><small>Equity</small><b>{fm(ac.equity)}</b></div><div><small>Profit</small><b className={ac.profit>=0?"pos":"neg"}>{fmS(ac.profit)}</b></div><div><small>Daily DD</small><b>{ac.dailyDD}%</b></div><div><small>Max DD</small><b>{ac.maxDD}%</b></div></div>
   <div className="acc-actions"><Link className="btn btn-primary" to={"/portal/accounts/"+ac.rowId}>View Account <ArrowRight size={15}/></Link>
     <button className="btn btn-ghost" disabled={busy===ac.rowId} onClick={()=>toggleArchive(ac)}>{ac.archived?"Restore":"Archive"}</button></div>
 </div>)}</div>}
 </PortalShell>}

function smoothPath(pts){if(pts.length<2)return"";let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+=` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;}return d}
function EquityChart({rows,live}){
 if(!rows.length)return <p className="ov-sub" style={{padding:"40px 0",textAlign:"center"}}>No equity history for this period yet.</p>;
 const W=800,H=300,P=28;
 const t0=rows[0].t,t1=rows[rows.length-1].t;
 const vals=rows.flatMap(r=>[r.eq,r.bal]);const mn=Math.min(...vals),mx=Math.max(...vals),span=(mx-mn)||1;
 const X=(t)=>t1===t0?W:((t-t0)/(t1-t0))*W;
 const Y=(v)=>H-P-((v-mn)/span)*(H-2*P);
 const pts=rows.map(r=>[X(r.t),Y(r.eq)]);
 const bpts=rows.map(r=>[X(r.t),Y(r.bal)]);
 const eqPath=smoothPath(pts), balPath=smoothPath(bpts);
 let hi=0,lo=0;rows.forEach((r,i)=>{if(r.eq>rows[hi].eq)hi=i;if(r.eq<rows[lo].eq)lo=i});
 const last=pts[pts.length-1];
 const pct=(x,y)=>({left:(x/W*100)+"%",top:(y/H*100)+"%"});
 const money=(n)=>"$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
 return <div className="eq-chart">
  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="eq-svg">
   <defs><linearGradient id="eqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7bff" stopOpacity=".38"/><stop offset="1" stopColor="#2f7bff" stopOpacity="0"/></linearGradient></defs>
   {[0.25,0.5,0.75].map(f=><line key={f} x1="0" x2={W} y1={P+f*(H-2*P)} y2={P+f*(H-2*P)} className="eq-grid"/>)}
   <path d={`${eqPath} L${W},${H} L0,${H} Z`} fill="url(#eqg)" className="eq-area"/>
   <path d={balPath} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6" className="eq-bal"/>
   <path d={eqPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="eq-line"/>
  </svg>
  <div className="eq-mark hi" style={pct(pts[hi][0],pts[hi][1])}><i/><span>High {money(rows[hi].eq)}</span></div>
  <div className="eq-mark lo" style={pct(pts[lo][0],pts[lo][1])}><i/><span>Low {money(rows[lo].eq)}</span></div>
  {live&&<div className="eq-live" style={pct(last[0],last[1])}><i/></div>}
  <div className="eq-legend"><span><i className="eq-d1"/>Equity</span><span><i className="eq-d2"/>Balance</span></div>
 </div>
}
function PortalAccountDetail(){const {id}=useParams();const P=usePortalData();const V=P.view;const [tf,setTf]=useState("All Time");const [snaps,setSnaps]=useState([]);
 const a=V&&V.accounts.find(x=>x.rowId===id);
 const r=a&&cmp.find(c=>c.n===a.program);
 const pos=V&&a?V.openTrades.filter(t=>t.accountId===a.rowId):[];
 const hist=V&&a?V.closedTrades.filter(t=>t.accountId===a.rowId):[];
 const rowId=a&&a.rowId;
 useEffect(()=>{if(!rowId)return;let live=true;
   const load=async()=>{const {data}=await supabase.from("equity_snapshots").select("ts,balance,equity").eq("account_id",rowId).order("ts",{ascending:true}).limit(20000);if(live&&data)setSnaps(data)};
   load();const t=setInterval(load,5000);return()=>{live=false;clearInterval(t)}},[rowId]);
 const days={"7D":7,"30D":30,"90D":90,"All Time":0}[tf];
 const cutoff=days?Date.now()-days*86400000:0;
 const rows=(snaps||[]).map(s=>({t:new Date(s.ts).getTime(),eq:Number(s.equity),bal:Number(s.balance)})).filter(x=>x.t>=cutoff);
 if(a)rows.push({t:Date.now(),eq:a.equity,bal:a.balance});
 return <PortalShell active="/portal/accounts"><Link to="/portal/accounts" className="pt-back"><ChevronDown size={14} style={{transform:"rotate(90deg)"}}/>My Accounts</Link>
 {!a?<NoData text="Account not found or not yet assigned to you."/>:<>
 <PtHead title={a.id} text={a.size+" "+a.program+(a.phase?" · "+a.phase:"")}><span className={"pt-status "+(a.status==="ACTIVE"?"on":a.status==="PASSED"?"pass":"")}>{a.status}</span></PtHead>
 <div className="pt-grid6"><PtStat label="Balance" value={fm(a.balance)}/><PtStat label="Equity" value={fm(a.equity)}/><PtStat label="Profit" value={fmS(a.profit)} tone={a.profit>=0?"pos":""}/><PtStat label="Floating P/L" value={fmS(a.floating)}/><PtStat label="Daily Drawdown" value={a.dailyDD+"%"}/><PtStat label="Max Drawdown" value={a.maxDD+"%"}/></div>
 <div className="pt-two">
  <div className="pt-card"><div className="ov-chart-head"><h2>Equity <span className="eq-live-tag"><i/>Live</span></h2><div className="ov-tf">{["7D","30D","90D","All Time"].map(t=><button key={t} className={"ov-tf-btn"+(tf===t?" on":"")} onClick={()=>setTf(t)}>{t}</button>)}</div></div>
   <EquityChart rows={rows} live/>
  </div>
  <div className="pt-card"><h2>Progress</h2>{a.target&&<PtBar label="Profit Target" pct={Number((a.targetProgress||0).toFixed(1))} max={a.target}/>}<PtBar label="Daily Drawdown" pct={a.dailyDD} max={a.dailyDDMax||1}/><PtBar label="Maximum Drawdown" pct={a.maxDD} max={a.maxDDMax||1}/><PtBar label="Trading Days" pct={a.days} max={Math.max(a.days,a.minDays,1)} unit=""/></div>
 </div>
 <h2 className="pt-sec">Open Positions</h2>
 {pos.length?<div className="table-wrap"><table className="table"><thead><tr><th>Symbol</th><th>Direction</th><th>Lot</th><th>Entry</th><th>Current</th><th>SL</th><th>TP</th><th>Floating P/L</th></tr></thead><tbody>{pos.map(p=><tr key={p.id}><td><b>{p.symbol}</b></td><td>{p.dir}</td><td>{p.lot}</td><td>{p.entry}</td><td>{p.current??"—"}</td><td>{p.sl??"—"}</td><td>{p.tp??"—"}</td><td className={p.pl>=0?"pos":"neg"}>{fmS(p.pl)}</td></tr>)}</tbody></table></div>:<NoData text="No open positions."/>}
 <h2 className="pt-sec">Trade History</h2>
 {hist.length?<div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Symbol</th><th>Buy/Sell</th><th>Lot</th><th>Entry</th><th>Exit</th><th>P/L</th></tr></thead><tbody>{hist.map(h=><tr key={h.id}><td>{h.date}</td><td><b>{h.symbol}</b></td><td>{h.dir}</td><td>{h.lot}</td><td>{h.entry}</td><td>{h.exit}</td><td className={h.pl>=0?"pos":"neg"}>{fmS(h.pl)}</td></tr>)}</tbody></table></div>:<NoData text="No closed trades yet."/>}
 <h2 className="pt-sec">Account Rules</h2>
 <div className="pt-card"><ul className="pt-rules">{[["Daily Loss Limit",r?r.d:"—"],["Maximum Loss",r?r.m:"—"],["Profit Target",r?r.t:"—"],["Minimum Trading Days",a.minDays],["Leverage",r?r.l:"—"]].map(([l,v])=><li key={l}><span>{l}</span><b>{v}</b></li>)}</ul></div>
 </>}
 </PortalShell>}

function PortalWithdrawals(){const P=usePortalData();const V=P.view;const S=V?V.summary:ZERO_SUM;const [busy,setBusy]=useState("");const [msg,setMsg]=useState("");const [err,setErr]=useState("");
 const accs=V?V.accounts.filter(a=>a.program==="Direct"||a.phase==="Performance Trader"):[];
 const request=async(ac)=>{setErr("");setMsg("");setBusy(ac.rowId);
   const amt=Math.round(ac.withdrawable*100)/100;
   const {error}=await supabase.from("payouts").insert({trader_id:V.user.id,account_id:ac.rowId,profit:Math.max(0,ac.profit),profit_share_pct:ac.profitShare,eligible_amount:amt,requested_amount:amt,status:"pending"});
   setBusy("");
   if(error){setErr(error.message);return}
   setMsg("Reward request submitted for "+fm(amt)+". It will be reviewed by the finance team.");
 };
 return <PortalShell active="/portal/withdrawals"><PtHead title="Rewards" text="Request rewards from accounts that are eligible."/>
 {msg&&<div className="pt-notice ok"><CheckCircle2 size={16}/>{msg}</div>}
 {err&&<div className="pt-notice"><Info size={16}/>{err}</div>}
 <div className="pt-grid6" style={{gridTemplateColumns:"1fr 1fr 1fr"}}><PtStat label="Total Rewards" value={fm(S.totalWithdrawn)}/><PtStat label="Pending" value={fm(S.pendingWithdrawal)}/><PtStat label="Available now" value={fm(accs.filter(a=>a.payoutEligible).reduce((s,a)=>s+a.withdrawable,0))}/></div>
 <h2 className="pt-sec">Your accounts</h2>
 {!accs.length?<NoData text="Rewards are available only for Performance (Direct) accounts. You have no Performance account yet."/>:<div className="wd-grid">{accs.map(ac=><div className="pt-card wd-card" key={ac.rowId}>
   <div className="wd-head"><div><h3>{ac.size} {ac.program}</h3><span className="pt-id">{ac.id}</span></div><span className={"pt-status "+(ac.payoutEligible?"on":"")}>{ac.payoutEligible?"Eligible":"Not eligible"}</span></div>
   <div className="wd-stats">
     <div><small>Profit</small><b className={ac.profit>0?"pos":"neg"}>{fmS(ac.profit)}</b></div>
     <div><small>Your share</small><b>{ac.profitShare}%</b></div>
     <div><small>Available</small><b>{fm(ac.withdrawable)}</b></div>
     <div><small>Next reward day</small><b>{ac.nextPayoutAt?new Date(ac.nextPayoutAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</b></div>
   </div>
   {!ac.payoutEligible&&<p className="wd-reason">{ac.payoutReason}</p>}
   <button className="btn btn-primary wd-btn" disabled={!ac.payoutEligible||busy===ac.rowId} onClick={()=>request(ac)}>{busy===ac.rowId?"Submitting…":"Request reward "+fm(ac.withdrawable)}</button>
 </div>)}</div>}
 <h2 className="pt-sec">Reward history</h2>
 {V&&V.withdrawals.length?<div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Amount</th><th>Payment Method</th><th>Status</th></tr></thead><tbody>{V.withdrawals.map((w,i)=><tr key={i}><td>{w.date}</td><td><b>{fm(w.amount)}</b></td><td>{w.method}</td><td><span className={"pt-pill "+w.raw}>{w.status}</span></td></tr>)}</tbody></table></div>:<NoData text="No reward requests yet."/>}
 </PortalShell>}

// Certificates use the ElectraPips certificate source exactly as delivered (public/certificates/*).
// Each type has its own page; Supabase data is passed through the documented URL parameters, embed=1 hides the editor.
const CERT_PAGE_OF={"Phase 1 Passed":"phase1.html","Phase 2 Passed":"phase1.html","Challenge Passed":"phase1.html","Performance Trader":"performance-trader.html","Reward":"payout.html","Payout":"payout.html","First Payout":"payout.html"};
const CERT_PROGRAM_OF={"2-Step Challenge":"2step","1-Step Challenge":"1step","Pay After Pass":"pap","Direct":"direct"};
const numOf=(v)=>String(v??"").replace(/[^\d.]/g,"");
function certUrl(c){
 const page=CERT_PAGE_OF[c.type]||"phase1.html";
 const q=new URLSearchParams({embed:"1",name:c.name||"",id:c.certNo||"",program:CERT_PROGRAM_OF[c.program]||"2step"});
 const iso=c.issuedAt?new Date(c.issuedAt).toISOString().slice(0,10):"";
 if(iso)q.set("date",iso);
 if(c.accountSize)q.set("size",numOf(c.accountSize));
 if(c.profitTarget)q.set("target",numOf(c.profitTarget));
 if(c.profitSplit)q.set("split",numOf(c.profitSplit));
 if(c.awardLevel)q.set("award",c.awardLevel);
 if(c.payoutAmount)q.set("payout",numOf(c.payoutAmount));
 if(c.payoutNo)q.set("payoutno",numOf(c.payoutNo));
 return "/certificates/"+page+"?"+q.toString();
}

function PortalCertificates(){const P=usePortalData();const V=P.view;const [openCert,setOpenCert]=useState(null);const [pendingImg,setPendingImg]=useState(false);const frameRef=useRef(null);
 const printCert=()=>{try{frameRef.current&&frameRef.current.contentWindow.print()}catch(e){}};
 // The certificate design already has a "Save as Image" routine (html2canvas, PNG). Trigger it inside the same-origin frame.
 const saveImg=()=>{try{const d=frameRef.current&&frameRef.current.contentDocument;const b=d&&d.getElementById("save-img-btn");if(b){b.hidden=false;b.click()}}catch(e){}};
 const frameLoaded=()=>{if(pendingImg){setPendingImg(false);setTimeout(saveImg,500)}};
 const downloadImage=(c)=>{if(openCert&&openCert.certNo===c.certNo){saveImg();return}setPendingImg(true);setOpenCert(c)};
 return <PortalShell active="/portal/certificates"><PtHead title="Your Achievements" text="Celebrate your trading milestones with ElectraPips."/>
 {!V||!V.certs.length?<NoData text="No certificates yet. They are issued automatically when you pass a phase, reach a challenge pass, or receive your first payout."/>:<div className="cert-grid">{V.certs.map(c=><div className="cert-card" key={c.certNo}><div className="cert-top"><img src={logo} alt=""/><span>ELECTRAPIPS</span></div><div className="cert-tag">{c.type}</div><h3>{c.type.toUpperCase()}</h3><p>Awarded to</p><strong>{c.name}</strong><div className="cert-foot"><div><small>Certificate No.</small><b>{c.certNo}</b></div><div><small>Date</small><b>{c.date}</b></div></div>
 <div className="cert-btns"><button className="btn btn-ghost" onClick={()=>{setPendingImg(false);setOpenCert(c)}}><FileText size={15}/>View Certificate</button><button className="btn btn-ghost" onClick={()=>downloadImage(c)}><Download size={15}/>Download Image</button><button className="btn btn-ghost" onClick={()=>{setPendingImg(false);setOpenCert(c);setTimeout(printCert,900)}}><Download size={15}/>Download PDF</button></div></div>)}</div>}
 {openCert&&<div className="cert-modal" onClick={()=>setOpenCert(null)}><div className="cert-modal-inner" onClick={e=>e.stopPropagation()}>
  <div className="cert-modal-bar no-print"><span>Certificate preview</span><div><button className="btn btn-ghost" onClick={saveImg}><Download size={14}/>Save as Image</button><button className="btn btn-primary" onClick={printCert}><Download size={14}/>Print / Save as PDF</button><button className="pt-icon-btn" onClick={()=>setOpenCert(null)} aria-label="Close"><X size={16}/></button></div></div>
  <iframe ref={frameRef} title="Certificate" src={certUrl(openCert)} onLoad={frameLoaded} className="cert-frame" style={{width:"100%",aspectRatio:"1.414 / 1",border:0,borderRadius:18,background:"#080e1c"}}/>
 </div></div>}
 </PortalShell>}

function PortalAffiliate(){const P=usePortalData();const V=P.view;const A=V&&V.affiliate;const [copied,setCopied]=useState(false);
 const link="electrapips.com/?ref="+(A?A.code:"");
 const copy=()=>{try{navigator.clipboard.writeText("https://"+link);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch(e){}};
 return <PortalShell active="/portal/affiliate"><PtHead title="Affiliate Program" text="Earn commissions by referring new traders to ElectraPips."/>
 {!A?<NoData text="You are not registered as an affiliate yet."/>:<>
 <div className="pt-card"><h2>Referral Link</h2><div className="pt-refbox"><span>{link}</span><button className="btn btn-primary" onClick={copy}><Copy size={15}/>{copied?"Copied!":"Copy Link"}</button></div></div>
 <div className="pt-grid6" style={{marginTop:22}}><PtStat label="Registrations" value={A.registrations}/><PtStat label="Commission Pending" value={fm(A.pending)}/><PtStat label="Commission Paid" value={fm(A.paid)}/><PtStat label="Status" value={A.status||"—"}/></div>
 <h2 className="pt-sec">Referral History</h2>
 {A.history.length?<div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Commission</th><th>Status</th></tr></thead><tbody>{A.history.map((r,i)=><tr key={i}><td>{r.date}</td><td className="pos">{r.commission}</td><td><span className={"pt-pill "+r.status.toLowerCase()}>{r.status}</span></td></tr>)}</tbody></table></div>:<NoData text="No referrals yet."/>}
 </>}</PortalShell>}

function PortalOffers(){const P=usePortalData();const V=P.view;
 return <PortalShell active="/portal/offers"><PtHead title="Special Offers" text="Take advantage of our latest promotions."/>
 {!V||!V.offers.length?<NoData text="No active offers right now."/>:<div className="pt-offer-grid">{V.offers.map((o,i)=><div className={"pt-offer"+(i===0?" big":"")} key={i}><Gift size={24}/><h3>{o.title}</h3><p>{o.description}</p>{o.discount!=null&&<div className="pt-code">{o.discount}% OFF</div>}{o.endsAt&&<small style={{color:"#64748b"}}>Ends {o.endsAt}</small>}<Link className="btn btn-primary" to="/portal/challenges">{o.cta}</Link></div>)}</div>}
 </PortalShell>}

function PortalChallenges(){const [step,setStep]=useState(1);const [prog,setProg]=useState(null);const [size,setSize]=useState(null);const [variant,setVariant]=useState("standard");
 const isSprint=prog==="2-Step Challenge"&&variant==="sprint";
 const f=prog?(isSprint?{...INFO[prog],badge:SPRINT.badge,tag:SPRINT.tag,desc:SPRINT.desc,phases:SPRINT.phases}:INFO[prog]):null;
 const base=prog?cmp.find(c=>c.n===prog):null;
 const r=isSprint?{...base,d:SPRINT.d,m:SPRINT.m,l:SPRINT.l,t:SPRINT.t,x:SPRINT.x}:base;
 const sizes=isSprint?SPRINT.sizes:(prog?SIZES[prog]:[]);
 const price=z=>isSprint?(SPRINT.prices[z]||"—"):(prog?PRICES[prog][z]||"—":"—");
 const progName=isSprint?"2-Step Sprint Challenge":prog;
 const pickProgram=n=>{setProg(n);setVariant("standard");setStep(2)};
 const setVar=v=>{setVariant(v);setSize(null)};
 const pickSize=z=>{setSize(z);setStep(3)};
 const steps=["Select Program","Select Account Size","Review & Confirm"];
 return <PortalShell active="/portal/challenges"><PtHead title="Choose Your Challenge" text="Start your trading journey with ElectraPips."/>
 <div className="wiz-steps">{steps.map((s,k)=><div key={s} className={"wiz-step"+(step===k+1?" on":step>k+1?" done":"")}><span>{step>k+1?<Check size={14}/>:k+1}</span>{s}</div>)}</div>

 {step===1&&<div className="wiz-grid">{WIZ_PROGRAMS.map(n=>{const fi=INFO[n];const I=fi.icon;return <button key={n} className="wiz-prog-card" style={vars(fi)} onClick={()=>pickProgram(n)}>
  <span className="wiz-prog-ico"><I size={24}/></span>{fi.badge&&<span className="pt-badge">{fi.badge}</span>}<h3>{n}</h3><p>{fi.tag}</p><span className="wiz-select">Select <ArrowRight size={14}/></span></button>})}</div>}

 {step===2&&prog&&<div className="wiz-panel">
  <button className="pt-back" onClick={()=>setStep(1)}><ChevronDown size={14} style={{transform:"rotate(90deg)"}}/>Change Program</button>
  <div className="wiz-prog-head" style={vars(f)}><span className="wiz-prog-ico"><f.icon size={20}/></span><div><h3>{progName}</h3><span>{f.tag}</span></div></div>
  {prog==="2-Step Challenge"&&<div className="fp-variant"><button className={"fp-vbtn"+(variant==="standard"?" on":"")} onClick={()=>setVar("standard")}>Standard</button><button className={"fp-vbtn"+(variant==="sprint"?" on":"")} onClick={()=>setVar("sprint")}>Sprint Challenge<span className="fp-vnew">New</span></button></div>}
  <div className="pt-buy-grid">{sizes.map((z,k)=><button key={z} className={"pt-buy-card wiz-size-card"+(size===z?" on":"")} style={vars(f)} onClick={()=>pickSize(z)}>{!isSprint&&k===2&&<span className="pt-badge">Most Popular</span>}<h3>{z}</h3><span className="pt-price">{price(z)}</span>
   <ul>{prog==="2-Step Challenge"||prog==="1-Step Challenge"?<><li><Check size={14}/>Daily Loss: {r.d}</li><li><Check size={14}/>Max Loss: {r.m}</li><li><Check size={14}/>Leverage: {r.l}</li></>:<><li><Check size={14}/>Max Loss: {r.m}</li><li><Check size={14}/>Daily Loss: {r.d}</li><li><Check size={14}/>Leverage: {r.l}</li></>}</ul>
   <span className="wiz-select">Select <ArrowRight size={14}/></span></button>)}</div></div>}

 {step===3&&prog&&size&&<div className="wiz-panel"><button className="pt-back" onClick={()=>setStep(2)}><ChevronDown size={14} style={{transform:"rotate(90deg)"}}/>Change Size</button>
  <div className="pt-two"><div className="pt-card"><h2>Order Summary</h2>
   <div className="pt-order-row"><span>Program</span><b>{progName}</b></div><div className="pt-order-row"><span>Account Size</span><b>{size}</b></div>
   <div className="pt-order-row"><span>Price</span><b>{price(size)}</b></div>
   <div className="pt-order-row"><span>Leverage</span><b>{r.l}</b></div><div className="pt-order-row"><span>Daily Loss</span><b>{r.d}</b></div><div className="pt-order-row"><span>Max Drawdown</span><b>{r.m}</b></div>
   {r.t!=="None"&&<div className="pt-order-row"><span>Profit Target</span><b>{r.t}</b></div>}
   <Link className="btn btn-primary" style={{width:"100%",marginTop:16}} to={"/portal/checkout?program="+encodeURIComponent(progName)+"&size="+encodeURIComponent(size)}>Continue to Checkout <ArrowRight size={16}/></Link></div>
  </div></div>}

 </PortalShell>}

const SLUG_OF={"2-Step Challenge":"2-step","1-Step Challenge":"1-step","Pay After Pass":"pay-after-pass","Direct":"direct","2-Step Sprint Challenge":"2-step-sprint"};
function PortalCheckout(){const loc=useLocation();const qs=new URLSearchParams(loc.search);
 const program=qs.get("program")||"",size=qs.get("size")||"";
 const priceTable=program==="2-Step Sprint Challenge"?SPRINT.prices:PRICES[program];
 const listStr=(priceTable&&priceTable[size])||"";
 const listNum=parseFloat(listStr.replace(/[^0-9.]/g,""))||0;
 const amountNum=parseFloat(size.replace(/[$K,]/g,""))*1000;
 const isDirect=program==="Direct";
 const [code,setCode]=useState("");const [applied,setApplied]=useState(null);const [promoMsg,setPromoMsg]=useState("");const [checking,setChecking]=useState(false);
 const [busy,setBusy]=useState(false);const [err,setErr]=useState("");const [pay,setPay]=useState(null);const [status,setStatus]=useState("pending");const [copied,setCopied]=useState(false);
 const baseBody={program_slug:SLUG_OF[program],program_name:program,size_amount:amountNum,size:size};
 const applyCode=async()=>{setPromoMsg("");setChecking(true);
   const {data,error}=await supabase.functions.invoke("create-payment",{body:{...baseBody,action:"preview",promo_code:code}});
   setChecking(false);
   if(error){let m=error.message;try{const j=await error.context.json();if(j&&j.error)m=j.error}catch(e){}setApplied(null);setPromoMsg(m);return}
   if(data&&data.valid){setApplied(data);setPromoMsg("");}
   else{setApplied(null);setPromoMsg((data&&data.error)||"This discount code is not valid.")}};
 const removeCode=()=>{setApplied(null);setCode("");setPromoMsg("")};
 const create=async()=>{setErr("");setBusy(true);
   const {data,error}=await supabase.functions.invoke("create-payment",{body:{...baseBody,action:"create",promo_code:applied?code:""}});
   setBusy(false);
   if(error){let m=error.message;try{const j=await error.context.json();if(j&&j.error)m=j.error}catch(e){}setErr(toMsg(m)||"Payment could not be created");return}
   if(data&&data.error){setErr(toMsg(data.error));return}
   setPay(data);setStatus("pending")};
 useEffect(()=>{if(!pay)return;let live=true;const t=setInterval(async()=>{const {data}=await supabase.from("orders").select("status").eq("id",pay.order_id).maybeSingle();if(live&&data)setStatus(String(data.status||"pending").toLowerCase())},5000);return()=>{live=false;clearInterval(t)}},[pay]);
 const copyLink=()=>{try{navigator.clipboard.writeText(pay.payment_url);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch(e){}};
 const discount=applied?applied.discount:0;
 const total=applied?applied.total:listNum;
 const fmt=(n)=>"$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
 const ready=!!program&&!!size&&listNum>0;
 const paid=status==="paid"||status==="confirmed";
 const pillCls=paid?"confirmed":status==="failed"||status==="rejected"?"failed":status==="expired"?"expired":"pending";
 const pillTxt=paid?"Confirmed":status==="failed"?"Failed":status==="expired"?"Expired":"Pending";
 return <PortalShell active="/portal/challenges">
  <div className="co-head"><div><span className="co-eyebrow">SECURE CHECKOUT</span><h1>Checkout</h1><p>Review your order, apply a discount code, and complete payment.</p></div></div>
  {!program&&<div className="pt-notice"><Info size={16}/>No program selected. Go back to Buy a Challenge and choose a program and size.</div>}
  <div className="co-grid">
   <div className="co-main">
    <div className="pt-card co-order">
     <div className="co-prog"><span className="co-prog-ico"><ShieldCheck size={20}/></span><div><b>{program||"—"}</b><small>{size?"Account size "+size:"No size selected"}</small></div></div>
     <div className="co-lines">
      <div className="co-line"><span>List price</span><b>{listStr||"—"}</b></div>
      {applied&&<div className="co-line disc"><span><Tag size={14}/> Discount <em>{applied.promo_label}</em></span><b>−{fmt(discount)}</b></div>}
      {isDirect&&<div className="co-line note"><span><Info size={14}/> Direct rules</span><b>Stop Loss on every trade · max 1% risk</b></div>}
     </div>
     <div className="co-total"><span>Total due</span><strong>{ready?fmt(total):"—"}</strong><small>USD</small></div>
    </div>

    <div className="pt-card co-promo">
     <div className="co-promo-head"><Tag size={16}/><b>Discount code</b>{applied&&<span className="co-ok"><Check size={13}/> Applied</span>}</div>
     {!applied?<div className="co-promo-row">
       <input className="co-input" placeholder="Enter code (e.g. EP50)" value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setPromoMsg("")}} onKeyDown={e=>{if(e.key==="Enter"&&code.trim())applyCode()}}/>
       <button className="btn btn-primary co-apply" disabled={!code.trim()||checking||!ready} onClick={applyCode}>{checking?"Checking…":"Apply"}</button>
     </div>:<div className="co-promo-applied"><div><b>{applied.promo_code}</b><span>{applied.promo_label}</span></div><button className="co-remove" onClick={removeCode}>Remove</button></div>}
     {promoMsg&&<p className="co-err">{promoMsg}</p>}
    </div>

    <div className="pt-card co-trust">
     <div><ShieldCheck size={16}/><span>Refund terms depend on the program</span></div>
     <div><Clock size={16}/><span>Payment page is hosted securely by Paymos</span></div>
     <div><Check size={16}/><span>Account is created automatically after payment</span></div>
    </div>
    <Link to="/portal/challenges" className="co-back"><ChevronDown size={14} style={{transform:"rotate(90deg)"}}/> Change selection</Link>
   </div>

   <div className="co-side">
    <div className="pt-card co-pay">
     <div className="co-pay-head"><span className="co-pay-ico"><CreditCard size={18}/></span><div><b>Pay with crypto</b><small>USDT · via Paymos</small></div></div>
     {!pay?<>
      <p className="co-pay-text">Click below to open the secure payment page. Choose USDT (TRC20) there and send the exact amount shown.</p>
      <div className="co-pay-amount"><span>Amount</span><strong>{ready?fmt(total):"—"}</strong></div>
      {err&&<p className="co-err">{err}</p>}
      <button className="btn btn-primary co-pay-btn" disabled={busy||!ready} onClick={create}>{busy?"Creating payment…":<>Pay {ready?fmt(total):""} <ArrowRight size={16}/></>}</button>
      <p className="co-fine">By paying you agree to the Terms and the Refund Policy.</p>
     </>:<>
      <div className="co-paid-box"><div className="co-pay-status"><span className={"pt-pill "+pillCls}>{pillTxt}</span></div>
       {!paid&&<p className="co-pay-text">Complete the payment on the Paymos page. This page updates automatically.</p>}
       {paid&&<p className="co-pay-text">Payment confirmed. Your account will appear in My Accounts.</p>}
      </div>
      {pay.payment_url&&<a className="btn btn-primary co-pay-btn" href={pay.payment_url} target="_blank" rel="noreferrer">Open Payment Page <ArrowRight size={16}/></a>}
      {pay.payment_url&&<button className="btn btn-ghost co-copy" onClick={copyLink}><Copy size={14}/>{copied?"Link copied!":"Copy payment link"}</button>}
      <div className="co-pay-foot"><div><span>Order</span><b className="mono">{pay.order_id}</b></div><div><span>Amount</span><b>{fmt(pay.amount)}</b></div></div>
     </>}
    </div>
   </div>
  </div>
 </PortalShell>}

function PortalSettings(){const P=usePortalData();const V=P.view;const SETTINGS_TABS=[["Profile",User],["Security",Lock],["Preferences",Settings],["KYC & Verification",ShieldCheck],["Payment Preferences",CreditCard]];const [tab,setTab]=useState("Profile");const [msg,setMsg]=useState("");const [err,setErr]=useState("");
 const [f,setF]=useState({first:"",last:"",phone:"",country:""});
 const [prefs,setPrefs]=useState({language:"English",currency:"USD",emailNotif:true,marketing:false,tradeAlerts:true,twoFA:false,loginAlerts:true,autoPayout:false});
 const [pw,setPw]=useState({cur:"",n1:"",n2:""});const [kyc,setKyc]=useState(null);const [wallet,setWallet]=useState("");const [walletId,setWalletId]=useState(null);const [uid,setUid]=useState(null);
 const ok=(t)=>{setErr("");setMsg(t);setTimeout(()=>setMsg(""),2500)};
 const fail=(e)=>{setMsg("");setErr(e.message||String(e))};
 useEffect(()=>{let live=true;(async()=>{
   const {data:{user}}=await supabase.auth.getUser(); if(!user||!live)return; setUid(user.id);
   const {data:pr}=await supabase.from("profiles").select("full_name,phone,country,preferences").eq("id",user.id).maybeSingle();
   const parts=(pr&&pr.full_name||"").split(" ");
   setF({first:parts[0]||"",last:parts.slice(1).join(" "),phone:(pr&&pr.phone)||"",country:(pr&&pr.country)||""});
   setPrefs(p=>({...p,...((pr&&pr.preferences)||{})}));
   const {data:k}=await supabase.from("kyc_submissions").select("*").eq("trader_id",user.id).order("submitted_at",{ascending:false}).limit(1).maybeSingle(); if(live)setKyc(k);
   const {data:pm}=await supabase.from("payout_methods").select("*").eq("trader_id",user.id).limit(1).maybeSingle();
   if(pm&&live){setWallet(pm.details||"");setWalletId(pm.id)}
 })();return()=>{live=false}},[]);
 const saveProfile=async()=>{try{const {error}=await supabase.from("profiles").update({full_name:(f.first+" "+f.last).trim(),phone:f.phone,country:f.country}).eq("id",uid);if(error)throw error;ok("Profile saved")}catch(e){fail(e)}};
 const savePrefs=async()=>{try{const {error}=await supabase.from("profiles").update({preferences:prefs}).eq("id",uid);if(error)throw error;ok("Preferences saved")}catch(e){fail(e)}};
 const savePassword=async()=>{try{if(!pw.n1||pw.n1!==pw.n2)throw new Error("New passwords do not match");
   const email=V?V.profile.email:"";const {error:e1}=await supabase.auth.signInWithPassword({email,password:pw.cur});if(e1)throw new Error("Current password is incorrect");
   const {error}=await supabase.auth.updateUser({password:pw.n1});if(error)throw error;setPw({cur:"",n1:"",n2:""});ok("Password updated")}catch(e){fail(e)}};
 const submitKyc=async()=>{try{const {data,error}=await supabase.from("kyc_submissions").insert({trader_id:uid,status:"submitted"}).select().single();if(error)throw error;setKyc(data);ok("Verification submitted")}catch(e){fail(e)}};
 const saveWallet=async()=>{try{if(walletId){const {error}=await supabase.from("payout_methods").update({details:wallet}).eq("id",walletId);if(error)throw error}
   else{const {data,error}=await supabase.from("payout_methods").insert({trader_id:uid,type:"USDT TRC20",details:wallet,verified:false}).select().single();if(error)throw error;setWalletId(data.id)}
   ok("Payment preferences saved")}catch(e){fail(e)}};
 const setP=(k)=>(e)=>setPrefs({...prefs,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value});
 const initial=(f.first||(V?V.profile.name:"T"))[0].toUpperCase();
 return <PortalShell active="/portal/settings"><PtHead title="Settings" text="Manage your profile, security and account preferences."/>
 {(msg||err)&&<div className={"pt-notice"+(err?"":" ok")}>{err?<Info size={16}/>:<CheckCircle2 size={16}/>}{err||msg}</div>}
 <div className="pt-settings"><aside className="pt-set-tabs">{SETTINGS_TABS.map(([t,I])=><button key={t} className={"pt-set-tab"+(tab===t?" on":"")} onClick={()=>setTab(t)}><I size={17}/>{t}</button>)}</aside>
 <div className="pt-card pt-set-panel">

 {tab==="Profile"&&<><h2>Profile</h2>
  <div className="pt-set-avatar"><span className="pt-av lg">{initial}</span><div><small>Your profile photo is managed by your account.</small></div></div>
  <div className="pt-field-row"><label className="pt-field">First Name<input value={f.first} onChange={e=>setF({...f,first:e.target.value})}/></label><label className="pt-field">Last Name<input value={f.last} onChange={e=>setF({...f,last:e.target.value})}/></label></div>
  <label className="pt-field">Email<span className="pt-inp"><Mail size={15}/><input value={V?V.profile.email:""} disabled/></span></label>
  <label className="pt-field">Phone<span className="pt-inp"><Phone size={15}/><input placeholder="+1 234 567 8900" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></span></label>
  <label className="pt-field">Country<span className="pt-inp"><Globe2 size={15}/><input value={f.country} onChange={e=>setF({...f,country:e.target.value})}/></span></label>
  <button className="btn btn-primary" disabled={!uid} onClick={saveProfile}>Save Changes</button></>}

 {tab==="Security"&&<><h2>Security</h2>
  <label className="pt-field">Current Password<input type="password" placeholder="••••••••" value={pw.cur} onChange={e=>setPw({...pw,cur:e.target.value})}/></label>
  <div className="pt-field-row"><label className="pt-field">New Password<input type="password" placeholder="••••••••" value={pw.n1} onChange={e=>setPw({...pw,n1:e.target.value})}/></label><label className="pt-field">Confirm New Password<input type="password" placeholder="••••••••" value={pw.n2} onChange={e=>setPw({...pw,n2:e.target.value})}/></label></div>
  <button className="btn btn-primary" disabled={!pw.cur||!pw.n1} onClick={savePassword}>Update Password</button>
  <div className="pt-set-divider"/>
  <div className="pt-set-toggle-row"><div><b>Two-Factor Authentication</b><span>Add an extra layer of security to your account.</span></div><label className="pt-switch"><input type="checkbox" checked={prefs.twoFA} onChange={setP("twoFA")}/><i/></label></div>
  <div className="pt-set-toggle-row"><div><b>Login Alerts</b><span>Get notified when your account is accessed from a new device.</span></div><label className="pt-switch"><input type="checkbox" checked={prefs.loginAlerts} onChange={setP("loginAlerts")}/><i/></label></div>
  <button className="btn btn-ghost" onClick={savePrefs}>Save Security Preferences</button></>}

 {tab==="Preferences"&&<><h2>Preferences</h2>
  <label className="pt-field">Language<select value={prefs.language} onChange={setP("language")}><option>English</option><option>Somali</option><option>Arabic</option></select></label>
  <label className="pt-field">Display Currency<select value={prefs.currency} onChange={setP("currency")}><option>USD</option><option>EUR</option><option>GBP</option></select></label>
  <div className="pt-set-toggle-row"><div><b>Email Notifications</b><span>Rewards, certificates and account status updates.</span></div><label className="pt-switch"><input type="checkbox" checked={prefs.emailNotif} onChange={setP("emailNotif")}/><i/></label></div>
  <div className="pt-set-toggle-row"><div><b>Marketing Emails</b><span>Offers, promotions and product news.</span></div><label className="pt-switch"><input type="checkbox" checked={prefs.marketing} onChange={setP("marketing")}/><i/></label></div>
  <div className="pt-set-toggle-row"><div><b>Trade Alerts</b><span>Daily loss and drawdown threshold warnings.</span></div><label className="pt-switch"><input type="checkbox" checked={prefs.tradeAlerts} onChange={setP("tradeAlerts")}/><i/></label></div>
  <button className="btn btn-primary" disabled={!uid} onClick={savePrefs}>Save Preferences</button></>}

 {tab==="KYC & Verification"&&<><h2>KYC &amp; Verification</h2>
  <div className="pt-kyc-status"><span className={"pt-status "+(kyc&&kyc.status==="approved"?"on":"")}>{kyc?String(kyc.status).replace(/_/g," "):"Not Started"}</span><p>KYC is required for all traders who successfully complete a challenge, and must be completed before a Performance Account is provided or activated.</p>{kyc&&kyc.rejection_reason&&<p style={{color:"#fb7185"}}>Reason: {kyc.rejection_reason}</p>}</div>
  <div className="pt-kyc-list">{[["Government-issued ID","Passport, national ID or driver's licence"],["Proof of Address","Utility bill or bank statement, issued within 3 months"],["Selfie Verification","A clear photo of yourself holding your ID"]].map(([t,d])=><div className="pt-kyc-item" key={t}><FileText size={17}/><div><b>{t}</b><span>{d}</span></div></div>)}</div>
  <button className="btn btn-primary" disabled={!uid||(kyc&&kyc.status!=="rejected")} onClick={submitKyc}>Submit for Verification</button></>}

 {tab==="Payment Preferences"&&<><h2>Payment Preferences</h2>
  <label className="pt-field">Default Reward Method<select value="USDT TRC20" disabled><option>USDT TRC20</option></select></label>
  <label className="pt-field">Saved Wallet Address<input placeholder="Enter your USDT (TRC20) address" value={wallet} onChange={e=>setWallet(e.target.value)}/></label>
  <label className="pt-field">Reward Currency<select value="USD" disabled><option>USD</option></select></label>
  <button className="btn btn-primary" disabled={!uid||!wallet} onClick={saveWallet}>Save Payment Preferences</button></>}

 </div></div></PortalShell>}

function ToolPage({eyebrow,title,text,children}){return <><PageHero eyebrow={eyebrow} title={title} text={text}/><section><div className="container tool-wrap">{children}</div></section></>}
function TField({label,hint,children}){return <label className="tool-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}
function TRes({rows,note}){return <div className="tool-card tool-res"><h3>Results</h3>{rows.map(([l,v,t])=><div className="tool-row" key={l}><span>{l}</span><b className={t||""}>{v}</b></div>)}{note&&<p className="tool-note">{note}</p>}</div>}
const PIP_PRESETS=[["USD-quoted pairs (EURUSD, GBPUSD, AUDUSD…)",10],["USDJPY (approx.)",6.7],["USDCAD (approx.)",7.3],["USDCHF (approx.)",11],["XAUUSD (1 pip = $0.10)",10],["Custom",null]];
function PipPicker({idx,setIdx,val,setVal}){return <><TField label="Instrument"><select value={idx} onChange={e=>{const k=+e.target.value;setIdx(k);if(PIP_PRESETS[k][1]!=null)setVal(String(PIP_PRESETS[k][1]))}}>{PIP_PRESETS.map(([n],k)=><option key={n} value={k}>{n}</option>)}</select></TField>
 <TField label="Pip value per 1.00 lot (USD)" hint="Approximate — confirm the exact value for your instrument in MT5."><input type="number" min="0" step="any" value={val} onChange={e=>{setVal(e.target.value);setIdx(PIP_PRESETS.length-1)}}/></TField></>}

function RiskCalc(){const [bal,setBal]=useState("10000"),[risk,setRisk]=useState("1"),[rr,setRr]=useState("2"),[pi,setPi]=useState(0);
 const b=nz(bal),rk=nz(risk),r=nz(rr),prog=cmp[pi],dl=parseFloat(prog.d)||0,md=parseFloat(prog.m)||0;
 const amt=b*rk/100,daily=b*dl/100,maxL=b*md/100;
 return <ToolPage eyebrow="TOOLS" title="Risk calculator." text="See how much you are risking per trade and how it fits inside your program's loss limits.">
 <div className="tool-grid"><div className="tool-card"><h3>Inputs</h3>
  <TField label="Account balance (USD)"><input type="number" min="0" step="any" value={bal} onChange={e=>setBal(e.target.value)}/></TField>
  <TField label="Risk per trade (%)"><input type="number" min="0" step="any" value={risk} onChange={e=>setRisk(e.target.value)}/></TField>
  <TField label="Reward : Risk ratio" hint="Example: 2 means 1:2."><input type="number" min="0" step="any" value={rr} onChange={e=>setRr(e.target.value)}/></TField>
  <TField label="ElectraPips program" hint="Loss limits come from each program's published rules."><select value={pi} onChange={e=>setPi(+e.target.value)}>{cmp.map((c,k)=><option key={c.n} value={k}>{c.n} — daily {c.d}, max {c.m}</option>)}</select></TField></div>
 <TRes rows={[["Risk per trade",money(amt),"neg"],["Potential profit",money(amt*r),"pos"],["Balance after a loss",money(b-amt)],["Balance after a win",money(b+amt*r)],["Daily loss limit",money(daily)+" ("+prog.d+")"],["Max drawdown limit",money(maxL)+" ("+prog.m+")"],["Losses to reach daily limit",amt>0?(daily/amt).toFixed(1):"—"],["Losses to reach max drawdown",amt>0?(maxL/amt).toFixed(1):"—"]]} note="Educational estimate only. It does not account for spreads, commissions, or slippage."/></div></ToolPage>}

function PositionCalc(){const [bal,setBal]=useState("10000"),[risk,setRisk]=useState("1"),[sl,setSl]=useState("20"),[idx,setIdx]=useState(0),[pv,setPv]=useState("10");
 const amt=nz(bal)*nz(risk)/100,den=nz(sl)*nz(pv),lots=den>0?amt/den:0;
 return <ToolPage eyebrow="TOOLS" title="Position size calculator." text="Work out the lot size that matches your risk and stop-loss distance.">
 <div className="tool-grid"><div className="tool-card"><h3>Inputs</h3>
  <TField label="Account balance (USD)"><input type="number" min="0" step="any" value={bal} onChange={e=>setBal(e.target.value)}/></TField>
  <TField label="Risk per trade (%)"><input type="number" min="0" step="any" value={risk} onChange={e=>setRisk(e.target.value)}/></TField>
  <TField label="Stop-loss distance (pips)"><input type="number" min="0" step="any" value={sl} onChange={e=>setSl(e.target.value)}/></TField>
  <PipPicker idx={idx} setIdx={setIdx} val={pv} setVal={setPv}/></div>
 <TRes rows={[["Amount at risk",money(amt),"neg"],["Position size (lots)",den>0?lots.toFixed(2):"—","pos"],["≈ Mini lots (0.10)",den>0?(lots*10).toFixed(1):"—"],["≈ Micro lots (0.01)",den>0?(lots*100).toFixed(0):"—"],["Value per pip at this size",den>0?money(lots*nz(pv)):"—"]]} note="Round down to your broker's lot step. Stop Loss is required on the Direct program at all times; sizing to a planned stop is a common risk-control habit on other programs too."/></div></ToolPage>}

function PipCalc(){const [idx,setIdx]=useState(0),[pv,setPv]=useState("10"),[lots,setLots]=useState("1"),[pips,setPips]=useState("10");
 const perPip=nz(lots)*nz(pv);
 return <ToolPage eyebrow="TOOLS" title="Pip calculator." text="Convert pips and lot size into a dollar value.">
 <div className="tool-grid"><div className="tool-card"><h3>Inputs</h3>
  <PipPicker idx={idx} setIdx={setIdx} val={pv} setVal={setPv}/>
  <TField label="Lot size"><input type="number" min="0" step="any" value={lots} onChange={e=>setLots(e.target.value)}/></TField>
  <TField label="Number of pips"><input type="number" step="any" value={pips} onChange={e=>setPips(e.target.value)}/></TField></div>
 <TRes rows={[["Value per pip",money(perPip)],["Value of "+(nz(pips)||0)+" pips",money(perPip*nz(pips)),perPip*nz(pips)>=0?"pos":"neg"]]} note="Pip values are approximate and vary with the exchange rate and instrument."/></div></ToolPage>}

function TradingJournal(){const KEY="ep_trading_journal";
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}};
 const [rows,setRows]=useState(load);const today=new Date().toISOString().slice(0,10);
 const [f,setF]=useState({date:today,symbol:"",dir:"Buy",lots:"",pl:"",notes:""});
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){}},[rows]);
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const add=()=>{if(!f.symbol.trim()||f.pl==="")return;setRows([{id:Date.now(),date:f.date,symbol:f.symbol.trim().toUpperCase(),dir:f.dir,lots:nz(f.lots),pl:nz(f.pl),notes:f.notes},...rows]);setF({...f,symbol:"",lots:"",pl:"",notes:""})};
 const wins=rows.filter(r=>r.pl>0).length,net=rows.reduce((s,r)=>s+r.pl,0),best=rows.length?Math.max(...rows.map(r=>r.pl)):0,worst=rows.length?Math.min(...rows.map(r=>r.pl)):0;
 const sgn=n=>(n>=0?"+":"−")+money(Math.abs(n));
 return <ToolPage eyebrow="TOOLS" title="Trading journal." text="Log your trades and review your results. Entries are saved only in this browser.">
 <div className="tool-card"><h3>New entry</h3><div className="tool-form">
  <TField label="Date"><input type="date" value={f.date} onChange={set("date")}/></TField>
  <TField label="Symbol"><input placeholder="EURUSD" value={f.symbol} onChange={set("symbol")}/></TField>
  <TField label="Direction"><select value={f.dir} onChange={set("dir")}><option>Buy</option><option>Sell</option></select></TField>
  <TField label="Lot size"><input type="number" min="0" step="any" value={f.lots} onChange={set("lots")}/></TField>
  <TField label="P/L (USD)"><input type="number" step="any" value={f.pl} onChange={set("pl")}/></TField>
  <TField label="Notes"><input placeholder="Setup, mistakes, lessons…" value={f.notes} onChange={set("notes")}/></TField></div>
  <button className="btn btn-primary" disabled={!f.symbol.trim()||f.pl===""} onClick={add}>Add trade</button></div>
 <div className="tool-stats">{[["Trades",rows.length],["Win rate",rows.length?Math.round(wins/rows.length*100)+"%":"—"],["Net P/L",rows.length?sgn(net):"—"],["Best trade",rows.length?sgn(best):"—"],["Worst trade",rows.length?sgn(worst):"—"]].map(([l,v])=><div className="ov-mini-stat" key={l}><span>{l}</span><b>{v}</b></div>)}</div>
 {rows.length?<><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Symbol</th><th>Direction</th><th>Lots</th><th>P/L</th><th>Notes</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.date}</td><td><b>{r.symbol}</b></td><td>{r.dir}</td><td>{r.lots||"—"}</td><td className={r.pl>=0?"pos":"neg"}>{sgn(r.pl)}</td><td>{r.notes||"—"}</td><td><button className="tool-del" aria-label="Delete" onClick={()=>setRows(rows.filter(x=>x.id!==r.id))}><X size={15}/></button></td></tr>)}</tbody></table></div>
  <button className="btn btn-ghost" style={{marginTop:14}} onClick={()=>{if(window.confirm("Delete all journal entries?"))setRows([])}}>Clear journal</button></>:<p className="tool-note" style={{textAlign:"center",marginTop:24}}>No entries yet — add your first trade above.</p>}
 </ToolPage>}

const SESSIONS=[["Sydney",22,7],["Tokyo",0,9],["London",8,17],["New York",13,22]];
function MarketSessions(){const [now,setNow]=useState(new Date());
 useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]);
 const h=now.getUTCHours()+now.getUTCMinutes()/60+now.getUTCSeconds()/3600,day=now.getUTCDay();
 const weekend=day===6||(day===5&&h>=22)||(day===0&&h<22);
 const isOpen=(s,e)=>!weekend&&(s<e?(h>=s&&h<e):(h>=s||h<e));
 const open=SESSIONS.filter(([,s,e])=>isOpen(s,e)).map(x=>x[0]);
 const loc=hr=>new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),hr)).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
 const segs=(s,e)=>s<e?[[s,e]]:[[s,24],[0,e]];
 return <ToolPage eyebrow="MARKET" title="Market sessions." text="See which major forex sessions are open right now.">
 <div className="tool-clock"><div><small>UTC time</small><b>{now.toISOString().slice(11,19)}</b></div><div><small>Your local time</small><b>{now.toLocaleTimeString()}</b></div>
  <div><small>Status</small><b className={weekend?"neg":"pos"}>{weekend?"Weekend — market closed":open.length>1?"Overlap: "+open.join(" + "):open.length===1?open[0]+" only":"Quiet hours"}</b></div></div>
 <div className="sess-grid">{SESSIONS.map(([n,s,e])=>{const o=isOpen(s,e);return <div className={"sess-card"+(o?" open":"")} key={n}><div className="sess-top"><h3>{n}</h3><span className={"pt-pill "+(o?"confirmed":"pending")}>{o?"Open":"Closed"}</span></div><p>{String(s).padStart(2,"0")}:00 – {String(e).padStart(2,"0")}:00 UTC</p><small>Your time: {loc(s)} – {loc(e)}</small></div>})}</div>
 <div className="tool-card sess-line"><h3>24-hour view (UTC)</h3>{SESSIONS.map(([n,s,e])=><div className="sess-row" key={n}><span>{n}</span><div className="sess-track">{segs(s,e).map(([a,b],k)=><i key={k} style={{left:(a/24*100)+"%",width:((b-a)/24*100)+"%"}}/>)}<em style={{left:(h/24*100)+"%"}}/></div></div>)}
  <div className="sess-scale"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>
 <p className="tool-note">Session hours are approximate standard UTC times and shift by about an hour with daylight saving. The forex market closes Friday ~22:00 UTC and reopens Sunday ~22:00 UTC.</p></ToolPage>}

const ExtLink=({href,children})=><a className="btn btn-ghost" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14}/></a>;
function EconCalendar(){return <ToolPage eyebrow="MARKET" title="Economic calendar." text="Know when high-impact news is due before you place a trade.">
 <div className="tool-card"><h3>Restricted news on ElectraPips</h3><p className="tool-note" style={{marginTop:0}}>These events are restricted on Pay After Pass and Direct. 2-Step and 1-Step allow news trading.</p>
  <div className="tool-chips">{["CPI","NFP","FOMC"].map(x=><span className="chip c-loss" key={x}>{x}</span>)}</div>
  <ul className="pt-rules" style={{marginTop:16}}><li><span>Before the event</span><b>Close positions 10 minutes before</b></li><li><span>After the event</span><b>Stay closed until 10 minutes after</b></li><li><span>If a trade is open during the event</span><b>Rule violation — may close the account</b></li></ul></div>
 <div className="tool-card" style={{marginTop:16}}><h3>Live event calendar</h3><p className="tool-note" style={{marginTop:0}}>A live event feed isn't connected to this site yet. Use one of these external calendars to check dates and times:</p>
  <div className="tool-links"><ExtLink href="https://www.forexfactory.com/calendar">Forex Factory</ExtLink><ExtLink href="https://www.investing.com/economic-calendar/">Investing.com</ExtLink><ExtLink href="https://www.tradingview.com/economic-calendar/">TradingView</ExtLink></div>
  <p className="tool-note">External sites are not affiliated with ElectraPips.</p></div></ToolPage>}

function MarketNews(){return <ToolPage eyebrow="MARKET" title="Market news." text="Stay informed about what is moving the markets.">
 <div className="tool-card"><h3>News sources</h3><p className="tool-note" style={{marginTop:0}}>A live news feed isn't connected to this site yet. These sources cover forex, gold, indices, commodities and crypto:</p>
  <div className="tool-links"><ExtLink href="https://www.reuters.com/markets/">Reuters Markets</ExtLink><ExtLink href="https://www.fxstreet.com/news">FXStreet</ExtLink><ExtLink href="https://www.investing.com/news/forex-news">Investing.com</ExtLink><ExtLink href="https://www.bloomberg.com/markets">Bloomberg Markets</ExtLink></div>
  <p className="tool-note">External sites are not affiliated with ElectraPips. Nothing here is trading advice.</p></div></ToolPage>}
