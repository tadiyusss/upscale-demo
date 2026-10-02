/* ==========================================================================
   Aurelia Dental Studio — site interactions
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Sticky header state
  ------------------------------------------------------------------ */
  var header = document.querySelector("[data-header]");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------------------ */
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");

  function setNav(open) {
    if (!navToggle || !siteNav) return;
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", function (event) {
      if (event.matches) setNav(false);
    });
  }

  /* ------------------------------------------------------------------
     FAQ accordion
  ------------------------------------------------------------------ */
  var faqRoot = document.querySelector("[data-faq]");

  if (faqRoot) {
    var questions = faqRoot.querySelectorAll(".faq-question");

    questions.forEach(function (question) {
      question.addEventListener("click", function () {
        var item = question.closest(".faq-item");
        var isOpen = question.getAttribute("aria-expanded") === "true";

        questions.forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          other.closest(".faq-item").classList.remove("is-open");
        });

        if (!isOpen) {
          question.setAttribute("aria-expanded", "true");
          item.classList.add("is-open");
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Appointment form validation
  ------------------------------------------------------------------ */
  var form = document.getElementById("appointment-form");

  if (form) {
    var dateInput = form.querySelector("#f-date");

    if (dateInput) {
      var today = new Date();
      var offset = today.getTimezoneOffset();
      dateInput.min = new Date(today.getTime() - offset * 60000).toISOString().split("T")[0];
    }

    function setError(input, hasError) {
      var field = input.closest(".field");
      if (!field) return;
      field.classList.toggle("has-error", hasError);
      input.setAttribute("aria-invalid", hasError ? "true" : "false");
    }

    function validateInput(input) {
      var value = input.value.trim();
      var valid = true;

      if (input.required && !value) {
        valid = false;
      } else if (input.id === "f-email" && value) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      } else if (input.id === "f-phone" && value) {
        var digits = value.match(/\d/g) || [];
        valid = digits.length >= 7 && digits.length <= 15;
      } else if (input.id === "f-date" && value) {
        valid = dateInput.min === "" || value >= dateInput.min;
      }

      setError(input, !valid);
      return valid;
    }

    var inputsToValidate = [
      form.querySelector("#f-name"),
      form.querySelector("#f-email"),
      form.querySelector("#f-phone"),
      form.querySelector("#f-service"),
      form.querySelector("#f-date")
    ].filter(Boolean);

    inputsToValidate.forEach(function (input) {
      input.addEventListener("blur", function () {
        validateInput(input);
      });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) {
          validateInput(input);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;

      inputsToValidate.forEach(function (input) {
        var ok = validateInput(input);
        if (!ok && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var status = document.getElementById("form-status");
      form.reset();
      inputsToValidate.forEach(function (input) {
        setError(input, false);
      });

      if (status) {
        status.classList.add("is-visible");
        status.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
      }
    });
  }

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  var yearEls = document.querySelectorAll("[data-year]");

  yearEls.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
