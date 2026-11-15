(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lines = [
    "GROK OS // COMMAND CENTER",
    "--------------------------------",
    "SYSTEM ...... ONLINE",
    "MODULE ...... PORTFOLIO",
    "OPERATOR .... DAREN AZHEKBAROV",
    "STATUS ...... READY",
    "",
    "> whoami",
    "Daren Azhekbarov",
    "",
    "> help",
    "Available sections: about · projects · skills · contact"
  ];

  var output = document.getElementById("typed-output");
  var cursor = document.getElementById("cursor");
  var fallback = document.querySelector(".terminal-static");

  function showAllText() {
    if (!output) return;
    output.textContent = lines.join("\n");
    if (cursor) cursor.style.display = "inline-block";
  }

  function typeLines() {
    if (!output) return;
    var lineIndex = 0;
    var charIndex = 0;
    var buffer = "";

    function step() {
      if (lineIndex >= lines.length) {
        return;
      }

      var line = lines[lineIndex];
      if (charIndex < line.length) {
        buffer += line.charAt(charIndex);
        output.textContent = buffer;
        charIndex += 1;
        window.setTimeout(step, 16);
      } else {
        buffer += "\n";
        output.textContent = buffer;
        lineIndex += 1;
        charIndex = 0;
        window.setTimeout(step, line === "" || line.indexOf(">") === 0 ? 280 : 80);
      }
    }

    step();
  }

  if (reduceMotion) {
    showAllText();
    if (fallback) fallback.hidden = false;
  } else {
    typeLines();
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });
  }

  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) {
      sections.push({ id: id, el: section, link: link });
    }
  });

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
        if (visible[0]) {
          setCurrent(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(function (item) {
      observer.observe(item.el);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      }
    });
  });
})();
