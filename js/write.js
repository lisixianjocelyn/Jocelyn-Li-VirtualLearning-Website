(function () {
    "use strict";
  
    var DAY = 864e5;
    var SITE = window.VLD_SITE || {};
    var KEY = "vld-entry-draft";
    var IDS = ["week", "date", "course", "worked", "challenge", "score", "scoreWhy", "next", "extraQ", "extraA"];
  
    function $(id) { return document.getElementById(id); }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function todayISO() {
      var d = new Date();
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function defaultWeek() {
      var p = String(SITE.startDate || "").split("-");
      var start = new Date(+p[0], +p[1] - 1, +p[2]);
      var t = new Date();
      t = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      if (isNaN(start)) return 1;
      return Math.max(1, Math.floor(Math.round((t - start) / DAY) / 7) + 1);
    }
    function defaultCourse() {
      var cs = SITE.courses || [];
      for (var i = 0; i < cs.length; i++) if (cs[i].status === "Current") return cs[i].name;
      return cs.length ? cs[cs.length - 1].name : "";
    }
    function setDefaults() {
      IDS.forEach(function (id) { $(id).value = ""; });
      $("week").value = defaultWeek();
      $("date").value = todayISO();
      $("course").value = defaultCourse();
      $("score").value = "89";
    }
  
    function saveDraft() {
      try {
        var d = {};
        IDS.forEach(function (id) { d[id] = $(id).value; });
        localStorage.setItem(KEY, JSON.stringify(d));
      } catch (e) { /* storage unavailable: ignore */ }
    }
    function loadDraft() {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return false;
        var d = JSON.parse(raw);
        IDS.forEach(function (id) { if (d[id] != null) $(id).value = d[id]; });
        return true;
      } catch (e) { return false; }
    }
    function clearDraft() {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    }
  
    function copy(text, btn) {
      var label = btn.textContent;
      function done() {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(); });
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Select and copy by hand"; }
        document.body.removeChild(ta);
      }
    }
  
    function build() {
      var v = {};
      IDS.forEach(function (id) { v[id] = $(id).value.trim(); });
      var msg = $("msg");
      var missing = [];
      if (!v.worked) missing.push("what you worked on");
      if (!v.challenge) missing.push("what was challenging");
      if (!v.scoreWhy) missing.push("why you chose that score");
      if (!v.next) missing.push("what you'll do next session");
      if (!v.date) missing.push("the date");
      if (missing.length) {
        msg.textContent = "Fill in " + missing.join(", ") + " before making the entry.";
        $("result").hidden = true;
        return;
      }
      msg.textContent = "";
  
      var entry = {
        week: Number(v.week) || 1,
        date: v.date,
        course: v.course,
        worked: v.worked,
        challenge: v.challenge,
        score: Number(v.score),
        scoreWhy: v.scoreWhy,
        next: v.next
      };
      if (v.extraQ && v.extraA) entry.extra = { q: v.extraQ, a: v.extraA };
  
      var code = JSON.stringify(entry, null, 2).split("\n").map(function (l) { return "  " + l; }).join("\n") + ",";
      var lines = [
        "Week " + entry.week + ", " + entry.date + (entry.course ? ", " + entry.course : ""),
        "",
        "1. What did I work on today?", entry.worked, "",
        "2. What was challenging, and how did I handle it?", entry.challenge, "",
        "3. How well did I run my own learning today? " + entry.score, entry.scoreWhy, "",
        "4. What will I do differently or keep doing next session?", entry.next
      ];
      if (entry.extra) lines.push("", entry.extra.q, entry.extra.a);
      var backup = lines.join("\n");
  
      $("code-out").textContent = code;
      $("backup-out").textContent = backup;
      $("copy-code").onclick = function () { copy(code, this); };
      $("copy-backup").onclick = function () { copy(backup, this); };
      $("result").hidden = false;
      $("result").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  
    if (!$("entry-form")) return;
    setDefaults();
    loadDraft();
    $("entry-form").addEventListener("input", saveDraft);
    $("entry-form").addEventListener("submit", function (ev) { ev.preventDefault(); build(); });
    $("clear").addEventListener("click", function () {
      if (confirm("Clear everything you've typed?")) {
        setDefaults();
        clearDraft();
        $("result").hidden = true;
        $("msg").textContent = "";
      }
    });
  })();