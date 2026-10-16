(function(){
  var $ = function(id){ return document.getElementById(id); };
  var PROGRAMS = {
    "2step":  { label: "2-Step Evaluation", color: "var(--c-2step)" },
    "1step":  { label: "1-Step Evaluation", color: "var(--c-1step)" },
    "pap":    { label: "PAP",               color: "var(--c-pap)" },
    "direct": { label: "Direct",            color: "var(--c-direct)" }
  };
  var DEFAULT_TARGETS = { "2step": "8", "1step": "10", "pap": "10", "direct": "8" };
  var DEFAULT_SPLITS = { "2step": "85", "1step": "85", "pap": "75", "direct": "50" };

  var TYPES = {
    phase1: {
      kicker: function(){ return isSinglePhase() ? "Evaluation Passed" : "Phase 1 Passed"; },
      h1: function(){ return isSinglePhase() ? "Evaluation Certificate" : "Phase 1 Certificate"; },
      lead: "This certificate is awarded to",
      state: function(){ return isSinglePhase()
        ? "has successfully passed the ElectraPips Evaluation with an account size of"
        : "has successfully passed Phase 1 of the ElectraPips Evaluation with an account size of"; },
      amountFrom: function(){ return moneyFrom("f-size"); },
      chip2Label: "Profit target",
      chip2Value: function(){ return pct("f-target"); },
      sealText: function(){ return isSinglePhase() ? "EVALUATION PASSED • ELECTRAPIPS • " : "PHASE 1 PASSED • ELECTRAPIPS • "; },
      idPrefix: "EP-P1"
    },
    funded: {
      kicker: "Performance Trader",
      h1: "Performance Trader Certificate",
      lead: "This certificate proudly recognizes",
      state: function(){ return "for outstanding trading performance, has been awarded " + ($("f-award").value.trim() || "CML") + " status in the ElectraPips Performance Program, with a starting balance of"; },
      amountFrom: function(){ return moneyFrom("f-size"); },
      chip2Label: "Profit split",
      chip2Value: function(){ return pct("f-split"); },
      chip3Label: "Award level",
      chip3Value: function(){ return $("f-award").value.trim() || "CML"; },
      sealText: "PERFORMANCE TRADER • ELECTRAPIPS • ",
      idPrefix: "EP-PT",
      premium: true
    },
    payout: {
      kicker: "Reward Issued",
      h1: "Reward Certificate",
      lead: "This certificate confirms that",
      state: "has received a reward from their ElectraPips trading account in the amount of",
      amountFrom: function(){ return moneyFrom("f-payout"); },
      chip2Label: "Reward no.",
      chip2Value: function(){ return "#" + (document.getElementById("f-payoutno").value.trim() || "1"); },
      sealText: "REWARD CONFIRMED • ELECTRAPIPS • ",
      idPrefix: "EP-PO"
    },
    totalpayout: {
      kicker: "Total Rewards",
      h1: "Total Reward Certificate",
      lead: "This certificate proudly confirms that",
      state: function(){
        var n = $("f-paycount").value.trim() || "1";
        return "has received a cumulative total of the following in rewards from their ElectraPips trading account, across " + n + " successful " + (n === "1" ? "reward" : "rewards") + ":";
      },
      amountFrom: function(){ return moneyFrom("f-totalamt"); },
      chip2Label: "Rewards to date",
      chip2Value: function(){ return "#" + ($("f-paycount").value.trim() || "1"); },
      chip3Label: "Trader since",
      chip3Value: function(){
        var v = $("f-since").value;
        if(!v) return "—";
        var d = new Date(v + "T00:00:00Z");
        if(isNaN(d)) return v;
        return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
      },
      sealText: "TOTAL REWARDS • ELECTRAPIPS • ",
      idPrefix: "EP-TP",
      showProgram: false
    },
    affiliate: {
      kicker: "Affiliate Reward",
      h1: "Affiliate Reward Certificate",
      lead: "This certificate confirms that",
      state: "has received an affiliate reward from the ElectraPips referral program in the amount of",
      amountFrom: function(){ return moneyFrom("f-affamt"); },
      chip2Label: "Reward no.",
      chip2Value: function(){ return "#" + ($("f-affno").value.trim() || "1"); },
      chip3Label: "Affiliate ID",
      chip3Value: function(){ return $("f-affid").value.trim() || "—"; },
      sealText: "AFFILIATE REWARD • ELECTRAPIPS • ",
      idPrefix: "EP-AF",
      showProgram: false
    }
  };

  var currentType = window.CERT_DEFAULT_TYPE || "phase1";

  function isSinglePhase(){
    var v = $("f-program").value;
    return v === "pap" || v === "1step";
  }
  function resolve(v){
    return (typeof v === "function") ? v() : v;
  }
  function moneyFrom(fieldId){
    var digits = String($(fieldId).value).replace(/[^\d]/g, "");
    return "$" + (parseInt(digits, 10) || 0).toLocaleString("en-US");
  }
  function pct(fieldId){
    var v = String($(fieldId).value).replace(/[^\d.]/g, "");
    return (v || "0") + "%";
  }
  function fmtDate(v){
    if(!v) return "";
    var d = new Date(v + "T00:00:00Z");
    if(isNaN(d)) return v;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function fitText(el, base, denomFactor){
    var len = el.textContent.length || 1;
    el.style.fontSize = Math.min(base, denomFactor / len) + "cqw";
  }

  function setFieldVisibility(){
    document.querySelectorAll(".fields .field[data-for]").forEach(function(f){
      var types = f.getAttribute("data-for").split(",");
      f.hidden = types.indexOf(currentType) === -1;
    });

    var restricted = ["opt-direct", "opt-1step", "opt-pap"];
    if(currentType === "phase1"){
      restricted.forEach(function(id){
        var opt = $(id);
        opt.hidden = true;
        opt.disabled = true;
      });
      var val = $("f-program").value;
      if(val === "direct" || val === "1step" || val === "pap"){
        $("f-program").value = "2step";
        var t = $("f-target"); if(!t.dataset.touched) t.value = DEFAULT_TARGETS["2step"];
        var s = $("f-split"); if(!s.dataset.touched) s.value = DEFAULT_SPLITS["2step"];
      }
    } else {
      restricted.forEach(function(id){
        var opt = $(id);
        opt.hidden = false;
        opt.disabled = false;
      });
    }
  }

  function render(){
    var cfg = TYPES[currentType];

    var name = $("f-name").value.trim() || "Trader Name";
    var nameEl = $("o-name");
    nameEl.textContent = name;
    fitText(nameEl, 5.8, 138);

    $("o-kicker").textContent = resolve(cfg.kicker);
    $("o-h1").textContent = resolve(cfg.h1);
    $("o-lead").textContent = resolve(cfg.lead);
    $("o-state").textContent = resolve(cfg.state);

    var amountEl = $("o-amount");
    var amt = cfg.amountFrom();
    amountEl.textContent = amt;
    fitText(amountEl, 9, 72);

    var p = PROGRAMS[$("f-program").value] || PROGRAMS["2step"];
    $("o-program").textContent = p.label;
    $("o-dot").style.background = p.color;
    $("o-chip1").hidden = (cfg.showProgram === false);

    $("o-chip2-label").textContent = cfg.chip2Label;
    $("o-chip2-value").textContent = cfg.chip2Value();

    var chip3 = $("o-chip3");
    if(cfg.chip3Label){
      chip3.hidden = false;
      $("o-chip3-label").textContent = cfg.chip3Label;
      $("o-chip3-value").textContent = cfg.chip3Value();
    } else {
      chip3.hidden = true;
    }

    $("cert").classList.toggle("premium", !!cfg.premium);

    $("o-date").textContent = fmtDate($("f-date").value);
    $("o-signer").textContent = $("f-signer").value.trim();
    $("o-title").textContent = $("f-title").value.trim();

    var idField = $("f-id");
    if(!idField.dataset.touched){
      var yr = new Date().getFullYear();
      idField.value = cfg.idPrefix + "-" + yr + "-000123";
    }
    $("o-id").textContent = idField.value.trim();
    $("o-sealtext").textContent = resolve(cfg.sealText);
  }

  document.querySelectorAll(".typeTabs button").forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll(".typeTabs button").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      currentType = btn.getAttribute("data-type");
      $("f-id").dataset.touched = "";
      setFieldVisibility();
      render();
    });
  });

  $("f-id").addEventListener("input", function(){ this.dataset.touched = "1"; });
  $("f-target").addEventListener("input", function(){ this.dataset.touched = "1"; });
  $("f-split").addEventListener("input", function(){ this.dataset.touched = "1"; });
  $("f-program").addEventListener("change", function(){
    var t = $("f-target");
    if(!t.dataset.touched){
      t.value = DEFAULT_TARGETS[this.value] || "8";
    }
    var s = $("f-split");
    if(!s.dataset.touched){
      s.value = DEFAULT_SPLITS[this.value] || "80";
    }
  });

  ["f-name","f-size","f-payout","f-payoutno","f-totalamt","f-paycount","f-since","f-affamt","f-affno","f-affid","f-program","f-target","f-split","f-award","f-date","f-id","f-signer","f-title"].forEach(function(id){
    var el = $(id);
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  $("print-btn").addEventListener("click", function(){
    try { window.print(); } catch(e) {}
  });

  var saveImgBtn = $("save-img-btn");
  var downloadsCap = null;

  function flattenGradientText(on){
    // No-op: amount text is a solid color, nothing to flatten before capture.
  }

  function certFilename(){
    var idVal = ($("f-id").value || "electrapips-certificate").trim().replace(/[^a-z0-9\-_.]+/gi, "-");
    return idVal + ".png";
  }

  async function saveAsImage(){
    if(typeof html2canvas === "undefined"){
      console.error("html2canvas failed to load");
      return;
    }
    var certEl = $("cert");
    var bg = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#050810";
    saveImgBtn.disabled = true;
    var prevLabel = saveImgBtn.textContent;
    saveImgBtn.textContent = "Preparing…";
    flattenGradientText(true);
    try {
      var canvas = await html2canvas(certEl, {
        scale: 3,
        backgroundColor: bg,
        useCORS: true,
        logging: false
      });
      await new Promise(function(resolve){
        canvas.toBlob(async function(blob){
          if(!blob){ resolve(); return; }
          try {
            if(downloadsCap){
              await downloadsCap.save({ filename: certFilename(), data: blob });
            } else {
              // Normal website: standard browser download
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = certFilename();
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
            }
          } catch(err){
            console.warn("Save declined or failed:", err && err.code);
          }
          resolve();
        }, "image/png");
      });
    } catch(e){
      console.error("Image capture failed:", e);
    } finally {
      flattenGradientText(false);
      saveImgBtn.disabled = false;
      saveImgBtn.textContent = prevLabel;
    }
  }

  (async function initDownloads(){
    try {
      if(window.claude && typeof window.claude.use === "function"){
        downloadsCap = await window.claude.use("downloads");
      }
    } catch(e){ downloadsCap = null; }
    saveImgBtn.hidden = false;
    saveImgBtn.addEventListener("click", saveAsImage);
  })();

  function applyUrlParams(){
    var qs = new URLSearchParams(window.location.search);
    if(![...qs.keys()].length) return;

    var typeMap = { phase1:"phase1", "phase-1":"phase1", evaluation:"phase1",
      funded:"funded", performance:"funded", "performance-trader":"funded",
      payout:"payout",
      totalpayout:"totalpayout", "total-payout":"totalpayout", "total_payout":"totalpayout",
      affiliate:"affiliate", "affiliate-payout":"affiliate", "affiliate_payout":"affiliate" };
    var typeParam = (qs.get("type") || "").toLowerCase();
    if(typeMap[typeParam]){
      currentType = typeMap[typeParam];
      document.querySelectorAll(".typeTabs button").forEach(function(b){
        b.classList.toggle("active", b.getAttribute("data-type") === currentType);
      });
    }

    var fieldMap = { name:"f-name", size:"f-size", payout:"f-payout", payoutno:"f-payoutno",
      totalamt:"f-totalamt", paycount:"f-paycount", since:"f-since",
      affamt:"f-affamt", affno:"f-affno", affid:"f-affid",
      program:"f-program", target:"f-target", split:"f-split", award:"f-award",
      date:"f-date", id:"f-id", signer:"f-signer", title:"f-title" };
    Object.keys(fieldMap).forEach(function(key){
      if(qs.has(key) && qs.get(key) !== ""){
        var el = $(fieldMap[key]);
        el.value = qs.get(key);
        el.dataset.touched = "1";
      }
    });

    if(qs.get("embed") === "1" || qs.get("auto") === "1"){
      document.querySelector(".controls").style.display = "none";
      document.body.style.padding = "0";
      document.querySelector(".stage").style.maxWidth = "none";
    }
    if(qs.get("print") === "1"){
      window.addEventListener("load", function(){
        setTimeout(function(){ try { window.print(); } catch(e){} }, 700);
      });
    }
  }

  applyUrlParams();
  setFieldVisibility();
  render();
})();
