(function () {
    "use strict";
  
    var DAY = 864e5;
    var SITE = window.VLD_SITE || {};
    var courses = SITE.courses || [];
    var evidence = SITE.evidence || [];
    var entries = (window.VLD_ENTRIES || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
  
    /* ---------- helpers ---------- */
    function parseDate(s) {
      var p = String(s).split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }
    function fmtD(d) {
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    function niceDate(v) {
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtD(parseDate(v)) : v;
    }
    function today() {
      var t = new Date();
      return new Date(t.getFullYear(), t.getMonth(), t.getDate());
    }
    function weekOf(date, start) {
      return Math.floor(Math.round((date - start) / DAY) / 7);
    }
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function emptyState(title, body, href, linkText) {
      var box = el("div", "empty");
      box.appendChild(el("p", null, title));
      if (body) box.appendChild(el("p", "muted", body));
      if (href) {
        var p = el("p");
        var a = el("a", null, linkText);
        a.href = href;
        p.appendChild(a);
        box.appendChild(p);
      }
      return box;
    }
    function currentCourse() {
      for (var i = 0; i < courses.length; i++) if (courses[i].status === "Current") return courses[i];
      return courses[courses.length - 1];
    }
  
    /* ---------- shared bits ---------- */
    function fillSite() {
      document.querySelectorAll("[data-site]").forEach(function (n) {
        var v = SITE[n.getAttribute("data-site")];
        if (v) n.textContent = v;
      });
      var now = currentCourse();
      document.querySelectorAll("[data-now]").forEach(function (n) {
        var v = now && now[n.getAttribute("data-now")];
        if (v) n.textContent = v;
      });
    }
  
    function entryEl(e) {
      var art = el("article", "entry");
      art.id = "entry-" + e.date;
  
      var meta = el("div", "entry-meta");
      meta.appendChild(el("p", "entry-week", "Week " + e.week));
      meta.appendChild(el("p", "entry-date", niceDate(e.date)));
      if (e.score != null) {
        var sc = el("p", "score");
        sc.appendChild(el("span", "score-num", String(e.score)));
        sc.appendChild(el("span", "score-label", "my score"));
        meta.appendChild(sc);
      }
  
      var body = el("div", "entry-body");
      if (e.course) body.appendChild(el("p", "entry-course", e.course));
      var dl = el("dl");
      function qa(q, a) {
        if (!a) return;
        dl.appendChild(el("dt", null, q));
        dl.appendChild(el("dd", null, a));
      }
      qa("What did I work on?", e.worked);
      qa("What was challenging, and how did I handle it?", e.challenge);
      qa("How well did I run my own learning?", e.scoreWhy);
      qa("What will I do next session?", e.next);
      if (e.extra && e.extra.a) qa(e.extra.q, e.extra.a);
      body.appendChild(dl);
  
      art.appendChild(meta);
      art.appendChild(body);
      return art;
    }
  
    /* ---------- home ---------- */
    function renderStrip() {
      var host = document.getElementById("strip");
      if (!host) return;
      var start = parseDate(SITE.startDate);
      var end = parseDate(SITE.endDate);
      if (isNaN(start) || isNaN(end)) {
        host.textContent = "Set startDate and endDate in data/site.js to see your weeks.";
        return;
      }
      var total = Math.max(1, Math.ceil(Math.round((end - start) / DAY) / 7));
      var have = {};
      entries.forEach(function (e) {
        var i = weekOf(parseDate(e.date), start);
        if (i >= 0 && i < total) have[i] = true;
      });
      var now = weekOf(today(), start);
      var count = 0;
      for (var i = 0; i < total; i++) {
        var c = el("span", "wk");
        var wkStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 7);
        c.title = "Week " + (i + 1) + ", starting " + fmtD(wkStart);
        c.setAttribute("aria-hidden", "true");
        if (have[i]) {
          c.className += " done";
          c.style.setProperty("--i", String(count));
          count++;
        } else if (i > now) {
          c.className += " future";
        }
        if (i === now) c.className += " now";
        host.appendChild(c);
      }
      var summary = count + " of " + total + " weeks have a journal entry.";
      host.setAttribute("role", "img");
      host.setAttribute("aria-label", summary);
      var s = document.getElementById("strip-summary");
      if (s) s.textContent = summary;
    }
  
    function renderLatest() {
      var host = document.getElementById("latest");
      if (!host) return;
      if (!entries.length) {
        host.appendChild(emptyState(
          "No entries yet.",
          "After your first session, write your entry and add it to data/entries.js.",
          "write.html",
          "Write your first entry"
        ));
        return;
      }
      host.appendChild(entryEl(entries[0]));
    }
  
    /* ---------- journal ---------- */
    function renderJournal() {
      var host = document.getElementById("entries");
      if (!host) return;
      var s = document.getElementById("journal-summary");
      if (!entries.length) {
        host.appendChild(emptyState(
          "No entries yet.",
          "Entries show up here, newest first, as soon as you add them to data/entries.js.",
          "write.html",
          "Write your first entry"
        ));
        return;
      }
      var scored = entries.filter(function (e) { return typeof e.score === "number"; });
      var text = entries.length + (entries.length === 1 ? " entry" : " entries");
      if (scored.length) {
        var avg = scored.reduce(function (a, e) { return a + e.score; }, 0) / scored.length;
        text += ", average self-score " + (Math.round(avg * 10) / 10);
      }
      if (s) s.textContent = text + ". Newest first.";
      entries.forEach(function (e) { host.appendChild(entryEl(e)); });
    }
  
    /* ---------- course log ---------- */
    function renderCourses() {
      var host = document.getElementById("courses");
      if (!host) return;
      if (!courses.length) {
        host.appendChild(emptyState("No courses listed yet.", "Add your course to data/site.js."));
        return;
      }
      courses.forEach(function (c) {
        var item = el("article", "log-item");
        var h = el("h2");
        if (c.url) {
          var a = el("a", null, c.name);
          a.href = c.url;
          a.rel = "noopener";
          h.appendChild(a);
        } else {
          h.textContent = c.name;
        }
        item.appendChild(h);
        var dl = el("dl", "facts");
        function fact(label, value) {
          if (!value) return;
          dl.appendChild(el("dt", null, label));
          dl.appendChild(el("dd", null, niceDate(value)));
        }
        fact("Status", c.status);
        fact("Approved", c.approved);
        fact("Started", c.started);
        fact("Why I chose it", c.reason);
        fact("Progress so far", c.progress);
        fact("Why I switched", c.switchReason);
        item.appendChild(dl);
        host.appendChild(item);
      });
    }
  
    /* ---------- evidence ---------- */
    function renderEvidence() {
      var host = document.getElementById("evidence");
      if (!host) return;
      if (!evidence.length) {
        host.appendChild(emptyState(
          "No evidence yet.",
          "Add certificates, screenshots or finished work to the evidence list in data/site.js."
        ));
        return;
      }
      evidence.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).forEach(function (ev) {
        var item = el("article", "evidence-item");
        if (ev.image) {
          var img = el("img");
          img.src = ev.image;
          img.alt = ev.alt || ev.title;
          img.loading = "lazy";
          item.appendChild(img);
        }
        var h = el("h2");
        h.style.fontSize = "1.25rem";
        if (ev.url) {
          var a = el("a", null, ev.title);
          a.href = ev.url;
          a.rel = "noopener";
          h.appendChild(a);
        } else {
          h.textContent = ev.title;
        }
        item.appendChild(h);
        var bits = [];
        if (ev.kind) bits.push(ev.kind);
        if (ev.date) bits.push(niceDate(ev.date));
        if (bits.length) item.appendChild(el("p", "meta", bits.join(", ")));
        if (ev.note) item.appendChild(el("p", null, ev.note));
        host.appendChild(item);
      });
    }
  
    fillSite();
    renderStrip();
    renderLatest();
    renderJournal();
    renderCourses();
    renderEvidence();
  })();