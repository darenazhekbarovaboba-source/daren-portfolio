(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COMMANDS = ["help", "about", "projects", "skills", "contact", "github", "clear"];
  var GITHUB_URL = "https://github.com/darenazhekbarovaboba-source";
  var REPOS_URL = "https://api.github.com/users/darenazhekbarovaboba-source/repos?sort=updated";
  var OWN_REPO = "daren-portfolio";

  var bootLines = [
    "Daren Azhekbarov — Portfolio",
    "--------------------------------",
    "> whoami",
    "Daren Azhekbarov",
    "",
    "> help"
  ];

  var output = document.getElementById("typed-output");
  var logEl = document.getElementById("terminal-log");
  var form = document.getElementById("terminal-form");
  var input = document.getElementById("terminal-input");

  function appendHelpLine(target, prefix) {
    var line = document.createElement("div");
    line.className = "log-line";
    if (prefix) {
      line.appendChild(document.createTextNode(prefix));
    }
    COMMANDS.forEach(function (cmd, i) {
      if (i) line.appendChild(document.createTextNode(" · "));
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmd-link";
      btn.setAttribute("data-cmd", cmd);
      btn.textContent = cmd;
      line.appendChild(btn);
    });
    target.appendChild(line);
    return line;
  }

  function renderBootText() {
    if (!output) return;
    output.textContent = "";
    output.appendChild(document.createTextNode(bootLines.join("\n") + "\n"));
    appendHelpLine(output, "Available commands: ");
  }

  function showInput() {
    if (!form) return;
    form.hidden = false;
    if (input && window.matchMedia("(pointer: fine)").matches) {
      input.focus();
    }
  }

  function typeBoot(done) {
    if (!output) {
      done();
      return;
    }
    var lineIndex = 0;
    var charIndex = 0;
    var buffer = "";

    function step() {
      if (lineIndex >= bootLines.length) {
        output.textContent = "";
        output.appendChild(document.createTextNode(buffer));
        appendHelpLine(output, "Available commands: ");
        done();
        return;
      }

      var line = bootLines[lineIndex];
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
    renderBootText();
    showInput();
  } else {
    typeBoot(showInput);
  }

  function echo(text) {
    if (!logEl) return;
    var line = document.createElement("div");
    line.className = "log-line";
    line.textContent = text;
    logEl.appendChild(line);
  }

  function echoHelp() {
    if (!logEl) return;
    appendHelpLine(logEl, "Available commands: ");
  }

  function echoGithub() {
    if (!logEl) return;
    var line = document.createElement("div");
    line.className = "log-line";
    line.appendChild(document.createTextNode("profile: "));
    var link = document.createElement("a");
    link.href = GITHUB_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = GITHUB_URL;
    line.appendChild(link);
    logEl.appendChild(line);
  }

  function sectionIsOpen(id) {
    var el = document.getElementById(id);
    return !!(el && !el.hidden);
  }

  function gotoSection(id) {
    var el = document.getElementById(id);
    if (!el || el.hidden) {
      echo(id + ": awaiting input from operator");
      return;
    }
    echo("opening " + id);
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
    }
    el.focus({ preventScroll: true });
    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
    if (typeof setCurrent === "function" && navSectionIds && navSectionIds[id]) {
      setCurrent(id);
    }
  }

  function clearTerminal() {
    if (output) output.textContent = "";
    if (logEl) logEl.textContent = "";
  }

  function runCommand(raw) {
    var cmd = String(raw || "").trim().toLowerCase();
    if (!cmd) return;

    if (cmd !== "clear") {
      echo("> " + String(raw).trim());
    }

    switch (cmd) {
      case "help":
        echoHelp();
        break;
      case "about":
      case "projects":
      case "skills":
      case "contact":
        gotoSection(cmd);
        break;
      case "github":
        echoGithub();
        break;
      case "clear":
        clearTerminal();
        break;
      default:
        echo("command not found — try help");
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!input) return;
      var value = input.value;
      input.value = "";
      runCommand(value);
    });
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest(".cmd-link");
    if (!btn) return;
    runCommand(btn.getAttribute("data-cmd") || btn.textContent);
    if (input) input.focus();
  });

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

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setNavOpen(false);
    });
  }

  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section && !section.hidden) {
      sections.push({ id: id, el: section, link: link });
    }
  });

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (id && link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  var navSectionIds = { projects: true, skills: true, contact: true };

  if ("IntersectionObserver" in window && sections.length) {
    var intersecting = Object.create(null);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            intersecting[entry.target.id] = entry.intersectionRatio;
          } else {
            delete intersecting[entry.target.id];
          }
        });
        var ids = Object.keys(intersecting);
        if (!ids.length) {
          setCurrent(null);
          return;
        }
        ids.sort(function (a, b) { return intersecting[b] - intersecting[a]; });
        setCurrent(ids[0]);
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
      if (!target || target.hidden) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      }
      if (navSectionIds[id]) {
        setCurrent(id);
      }
    });
  });

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/New_York"
    });
  }

  function renderRepos(repos) {
    var grid = document.getElementById("project-grid");
    var note = document.getElementById("projects-note");
    if (!grid) return;
    grid.textContent = "";
    repos.forEach(function (repo, index) {
      var li = document.createElement("li");
      li.className = "project-card";

      var meta = document.createElement("div");
      meta.className = "card-meta";
      if (repo.language) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = repo.language;
        meta.appendChild(badge);
      } else {
        var spacer = document.createElement("span");
        meta.appendChild(spacer);
      }
      var idx = document.createElement("span");
      idx.className = "card-index";
      idx.textContent = String(index + 1).padStart(2, "0");
      meta.appendChild(idx);
      li.appendChild(meta);

      var heading = document.createElement("h3");
      heading.textContent = repo.name || "untitled";
      li.appendChild(heading);

      var desc = document.createElement("p");
      var rawDesc = repo.description && String(repo.description).trim();
      desc.textContent = rawDesc ? rawDesc : "no description";
      li.appendChild(desc);

      var stats = document.createElement("p");
      stats.className = "card-stats";
      var parts = [];
      if (repo.language) parts.push(repo.language);
      var stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
      parts.push(stars === 1 ? "1 star" : stars + " stars");
      var updated = formatDate(repo.updated_at);
      if (updated) parts.push("Updated " + updated);
      stats.textContent = parts.join("  ·  ");
      li.appendChild(stats);

      if (repo.html_url) {
        var link = document.createElement("a");
        link.className = "card-link";
        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View on GitHub";
        li.appendChild(link);
      }

      grid.appendChild(li);
    });
    if (note) note.hidden = true;
  }

  function renderSkills(languages) {
    var list = document.getElementById("skill-list");
    var note = document.getElementById("skills-note");
    if (!list || !languages.length) return;
    list.textContent = "";
    list.classList.remove("is-fallback");
    list.classList.add("is-live");
    languages.forEach(function (lang) {
      var item = document.createElement("li");
      item.textContent = lang;
      list.appendChild(item);
    });
    if (note) {
      note.textContent = "languages used on GitHub";
      note.hidden = false;
    }
  }

  function showProjectsError(message) {
    var note = document.getElementById("projects-note");
    if (!note) return;
    note.hidden = false;
    note.textContent = message;
  }

  fetch(REPOS_URL)
    .then(function (response) {
      if (!response.ok) {
        var err = new Error("request failed");
        err.status = response.status;
        throw err;
      }
      return response.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error("unexpected response");
      var ownRepos = data.filter(function (repo) {
        return repo && !repo.fork;
      });
      var repos = ownRepos.filter(function (repo) {
        return repo.name !== OWN_REPO;
      });
      if (!repos.length) {
        var grid = document.getElementById("project-grid");
        var note = document.getElementById("projects-note");
        if (grid) grid.textContent = "";
        if (note) {
          note.hidden = false;
          note.textContent = "no public projects yet";
        }
      } else {
        renderRepos(repos);
      }
      var seen = Object.create(null);
      var languages = [];
      ownRepos.forEach(function (repo) {
        if (repo.language && !seen[repo.language]) {
          seen[repo.language] = true;
          languages.push(repo.language);
        }
      });
      if (languages.length) renderSkills(languages);
    })
    .catch(function (err) {
      var status = err && err.status;
      if (status === 403 || status === 429) {
        showProjectsError("Could not load projects: GitHub rate limit reached. Try again in a little while.");
      } else if (status) {
        showProjectsError("Could not load projects: GitHub returned an error. Try again later.");
      } else {
        showProjectsError("Could not load projects: network error. Check your connection and try again.");
      }
    });
})();
