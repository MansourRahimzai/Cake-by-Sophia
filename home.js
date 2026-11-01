/* ==========================================================================
   CAKE BY SOPHIA — HOMEPAGE SCRIPT
   --------------------------------------------------------------------------
   Plain vanilla JavaScript, no dependencies.

   Contents
   01. Helpers + setup
   02. Sticky header (hides on scroll down, returns on scroll up)
   03. Mobile menu
   04. Basket drawer
   05. Scroll reveal animations
   06. Highlight the current section in the navigation
   07. Gentle parallax for decorative SVGs
   08. "Coming soon" messages for placeholder links
   09. Footer year
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     01. HELPERS + SETUP
     ------------------------------------------------------------------------ */

  var root = document.documentElement;
  var body = document.body;

  // Lets the CSS know JavaScript is running, so reveal animations can start hidden.
  root.classList.add("js");

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  var mobileNavQuery = window.matchMedia("(max-width: 960px)");

  var header = document.getElementById("site-header");
  var nav = document.getElementById("site-nav");
  var menuToggle = document.getElementById("menu-toggle");
  var cartToggle = document.getElementById("cart-toggle");
  var cartClose = document.getElementById("cart-close");
  var cartExplore = document.getElementById("cart-explore");
  var cartDrawer = document.getElementById("cart-drawer");
  var cartOverlay = document.getElementById("drawer-overlay");
  var toast = document.getElementById("toast");

  var menuIsOpen = false;
  var cartIsOpen = false;

  /** Returns all focusable elements inside a container (used for focus trapping). */
  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  /** Locks or unlocks page scrolling while a menu or drawer is open. */
  function updateScrollLock() {
    body.classList.toggle("is-locked", menuIsOpen || cartIsOpen);
  }

  /* ------------------------------------------------------------------------
     02. STICKY HEADER
     ------------------------------------------------------------------------ */

  var lastScrollY = window.scrollY;

  function updateHeader() {
    var y = window.scrollY;

    // Add a soft background once the page has moved
    header.classList.toggle("is-scrolled", y > 40);

    // Hide when scrolling down, show when scrolling up (never while a menu is open)
    var scrollingDown = y > lastScrollY + 6;
    var scrollingUp = y < lastScrollY - 6;

    if (menuIsOpen || cartIsOpen || y < 120 || scrollingUp) {
      header.classList.remove("is-hidden");
    } else if (scrollingDown) {
      header.classList.add("is-hidden");
    }

    if (scrollingDown || scrollingUp) {
      lastScrollY = y;
    }
  }

  /* ------------------------------------------------------------------------
     03. MOBILE MENU
     ------------------------------------------------------------------------ */

  function openMenu() {
    menuIsOpen = true;
    nav.classList.add("is-open");
    header.classList.add("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    updateScrollLock();
  }

  function closeMenu() {
    menuIsOpen = false;
    nav.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    updateScrollLock();
  }

  menuToggle.addEventListener("click", function () {
    if (menuIsOpen) {
      closeMenu();
    } else {
      closeCart();
      openMenu();
    }
  });

  // Close the menu after choosing a link
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  // If the window grows to desktop width, reset the menu
  mobileNavQuery.addEventListener("change", function (event) {
    if (!event.matches && menuIsOpen) {
      closeMenu();
    }
  });

  /* ------------------------------------------------------------------------
     04. BASKET DRAWER
     (An interface shell only — products cannot be added yet.)
     ------------------------------------------------------------------------ */

  function openCart() {
    if (menuIsOpen) {
      closeMenu();
    }
    cartIsOpen = true;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay.classList.add("is-open");
    cartToggle.setAttribute("aria-expanded", "true");
    cartToggle.setAttribute("aria-label", "Close shopping basket");
    updateScrollLock();
    // Move focus into the drawer after the slide-in starts
    window.setTimeout(function () {
      cartClose.focus();
    }, 50);
  }

  function closeCart() {
    if (!cartIsOpen) {
      return;
    }
    cartIsOpen = false;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay.classList.remove("is-open");
    cartToggle.setAttribute("aria-expanded", "false");
    cartToggle.setAttribute("aria-label", "Open shopping basket");
    updateScrollLock();
    cartToggle.focus();
  }

  cartToggle.addEventListener("click", function () {
    if (cartIsOpen) {
      closeCart();
    } else {
      openCart();
    }
  });

  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  cartExplore.addEventListener("click", closeCart);

  // Keyboard: Escape closes whatever is open; Tab stays inside the drawer
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (cartIsOpen) {
        closeCart();
      } else if (menuIsOpen) {
        closeMenu();
        menuToggle.focus();
      }
      return;
    }

    if (event.key === "Tab" && cartIsOpen) {
      var focusable = getFocusable(cartDrawer);
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------------
     05. SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------------------------ */

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    // No observer support, or reduced motion: show everything immediately
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------------
     06. HIGHLIGHT THE CURRENT SECTION IN THE NAVIGATION
     ------------------------------------------------------------------------ */

  var navLinks = document.querySelectorAll(".site-nav__link");
  var linkBySectionId = {};

  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    linkBySectionId[id] = link;
  });

  // Sections that belong to each navigation item
  var sectionToNav = {
    home: "home",
    about: "about",
    featured: "featured",
    collections: "featured",
    why: "about",
    gallery: "gallery",
    enquire: "contact",
    contact: "contact",
  };

  function setCurrentLink(sectionId) {
    var navId = sectionToNav[sectionId];
    navLinks.forEach(function (link) {
      link.classList.remove("is-current");
      link.removeAttribute("aria-current");
    });
    if (navId && linkBySectionId[navId]) {
      linkBySectionId[navId].classList.add("is-current");
      linkBySectionId[navId].setAttribute("aria-current", "true");
    }
  }

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setCurrentLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }, // a thin band in the middle of the screen
    );

    Object.keys(sectionToNav).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) {
        sectionObserver.observe(section);
      }
    });
  }

  /* ------------------------------------------------------------------------
     07. GENTLE PARALLAX
     Moves elements marked data-parallax="speed" a little as the page scrolls.
     ------------------------------------------------------------------------ */

  var parallaxItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]"),
  );

  function updateParallax() {
    var viewportCenter = window.innerHeight / 2;

    parallaxItems.forEach(function (item) {
      var area = item.parentElement.getBoundingClientRect();

      // Skip work for sections that are far off-screen
      if (area.bottom < -200 || area.top > window.innerHeight + 200) {
        return;
      }

      var speed = parseFloat(item.getAttribute("data-parallax")) || 0;
      var distanceFromCenter = area.top + area.height / 2 - viewportCenter;
      var offset = Math.round(distanceFromCenter * speed * -1);

      item.style.transform = "translate3d(0," + offset + "px,0)";
    });
  }

  /* ------------------------------------------------------------------------
     Scroll + resize handling (one throttled loop for header and parallax)
     ------------------------------------------------------------------------ */

  var ticking = false;

  function onScrollOrResize() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      if (!prefersReducedMotion.matches) {
        updateParallax();
      }
      ticking = false;
    });
  }

  // Keyboard users tabbing into a hidden header should always see it
  header.addEventListener("focusin", function () {
    header.classList.remove("is-hidden");
  });

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  // Remove any parallax offset if the visitor switches reduced motion on
  prefersReducedMotion.addEventListener("change", function (event) {
    if (event.matches) {
      parallaxItems.forEach(function (item) {
        item.style.transform = "";
      });
    } else {
      updateParallax();
    }
  });

  updateHeader();
  if (!prefersReducedMotion.matches) {
    updateParallax();
  }

  /* ------------------------------------------------------------------------
     08. "COMING SOON" MESSAGES FOR PLACEHOLDER LINKS
     Links with a data-placeholder attribute point to pages that are not
     built yet (Shop, Gallery, About, social profiles). Instead of jumping to
     the top of the page they show a short message.
     ------------------------------------------------------------------------ */

  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3600);
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-placeholder]");
    if (link) {
      event.preventDefault();
      showToast(link.getAttribute("data-placeholder"));
    }
  });

  /* ------------------------------------------------------------------------
     09. FOOTER YEAR
     ------------------------------------------------------------------------ */

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
