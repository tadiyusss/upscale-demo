(function () {
  "use strict";

  var d = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header scroll state */
  var header = d.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* Mobile navigation */
  var toggle = d.querySelector(".nav-toggle");
  var mnav = d.querySelector(".mnav");
  function closeNav(refocus) {
    d.body.classList.remove("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      if (refocus) toggle.focus();
    }
  }
  if (toggle && mnav) {
    toggle.addEventListener("click", function () {
      var open = d.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeNav(false); });
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && d.body.classList.contains("nav-open")) closeNav(true);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeNav(false);
    });
  }

  /* Reveal on scroll */
  var revealEls = d.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute("data-reveal-delay");
          if (delay) el.style.transitionDelay = delay + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Signature dish switcher */
  var sigList = d.querySelector(".sig-list");
  if (sigList) {
    var items = sigList.querySelectorAll(".sig-item");
    var imgs = d.querySelectorAll(".sig-figure img[data-sig]");
    var desc = d.querySelector(".sig-desc");
    var pair = d.querySelector(".sig-pair");
    var caption = d.querySelector(".sig-caption");
    function activate(btn) {
      var key = btn.getAttribute("data-dish");
      items.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        if (active) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
      imgs.forEach(function (img) {
        img.classList.toggle("is-active", img.getAttribute("data-sig") === key);
      });
      if (desc) desc.textContent = btn.getAttribute("data-desc") || "";
      if (pair) pair.textContent = btn.getAttribute("data-pair") || "";
      if (caption) caption.textContent = btn.getAttribute("data-caption") || "";
    }
    items.forEach(function (btn) {
      btn.addEventListener("click", function () { activate(btn); });
    });
  }

  /* Menu category spy */
  var chips = d.querySelectorAll(".menu-chips .chip");
  if (chips.length && "IntersectionObserver" in window) {
    var sections = [];
    chips.forEach(function (chip) {
      var id = chip.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var sec = d.getElementById(id.slice(1));
        if (sec) sections.push({ chip: chip, sec: sec });
      }
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          chips.forEach(function (c) { c.classList.remove("is-active"); });
          var match = sections.find(function (s) { return s.sec === entry.target; });
          if (match) match.chip.classList.add("is-active");
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    sections.forEach(function (s) { spy.observe(s.sec); });
  }

  /* Reservation form */
  var form = d.getElementById("reserve-form");
  if (form) {
    var dateInput = form.querySelector("#res-date");
    if (dateInput) {
      var today = new Date();
      var iso = today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
      dateInput.setAttribute("min", iso);
    }

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var phoneRe = /^[0-9+()\-\s.]{7,}$/;

    function setError(input, message) {
      var field = input.closest(".field");
      if (!field) return;
      var msg = field.querySelector(".field-error");
      if (message) {
        field.classList.add("has-error");
        if (msg) msg.textContent = message;
        input.setAttribute("aria-invalid", "true");
      } else {
        field.classList.remove("has-error");
        if (msg) msg.textContent = "";
        input.removeAttribute("aria-invalid");
      }
    }

    function validate() {
      var firstInvalid = null;
      function check(input, ok, message) {
        setError(input, ok ? "" : message);
        if (!ok && !firstInvalid) firstInvalid = input;
      }
      var name = form.querySelector("#res-name");
      var email = form.querySelector("#res-email");
      var phone = form.querySelector("#res-phone");
      var date = form.querySelector("#res-date");
      var time = form.querySelector("#res-time");
      var guests = form.querySelector("#res-guests");

      check(name, name.value.trim().length >= 2, "Please tell us your name.");
      check(email, emailRe.test(email.value.trim()), "Please enter a valid email address.");
      check(phone, phone.value.trim() === "" || phoneRe.test(phone.value.trim()), "Please enter a valid phone number.");
      check(date, date.value !== "", "Please choose a date.");
      if (date.value !== "") {
        var chosen = new Date(date.value + "T23:59:59");
        check(date, chosen >= new Date(), "Please choose a future date.");
      }
      check(time, time.value !== "", "Please choose a time.");
      check(guests, guests.value !== "", "Please select party size.");
      return firstInvalid;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      ["input", "change"].forEach(function (evt) {
        input.addEventListener(evt, function () { setError(input, ""); });
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }
      var name = form.querySelector("#res-name").value.trim().split(" ")[0];
      var guests = form.querySelector("#res-guests");
      var date = form.querySelector("#res-date").value;
      var time = form.querySelector("#res-time").value;
      var datePretty = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric"
      });
      var success = d.getElementById("reserve-success");
      var sum = d.getElementById("reserve-summary");
      var nameSlot = d.getElementById("reserve-first-name");
      if (nameSlot) nameSlot.textContent = name;
      if (sum) sum.textContent = "Table for " + guests.value + " — " + datePretty + " at " + time;
      form.hidden = true;
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    });
  }

  /* Footer year */
  var year = d.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
