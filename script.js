/**
 * premmalik.in — Pure Vanilla JavaScript
 * Handles navigation, theme switching, interactive modals, search/filtering, and clipboard utilities.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNavbar();
    initMobileMenu();
    initModals();
    initClipboardCopy();
    initScrollToTop();
    initProjectsPageFilter();
  });

  // --- 1. Theme Toggle & Persistence ---
  function initTheme() {
    const savedTheme = localStorage.getItem("pm_theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", function () {
        const isCurrentlyLight = document.documentElement.classList.contains("light");
        if (isCurrentlyLight) {
          document.documentElement.classList.remove("light");
          localStorage.setItem("pm_theme", "dark");
        } else {
          document.documentElement.classList.add("light");
          localStorage.setItem("pm_theme", "light");
        }
      });
    }
  }

  // --- 2. Navbar Scroll Shrink & Backdrop ---
  function initNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    function handleScroll() {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // --- 3. Mobile Hamburger Menu ---
  function initMobileMenu() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-drawer");
    if (!menuBtn || !drawer) return;

    const menuIcon = menuBtn.querySelector(".icon-menu");
    const closeIcon = menuBtn.querySelector(".icon-close");

    function closeDrawer() {
      drawer.classList.remove("open");
      if (menuIcon && closeIcon) {
        menuIcon.style.display = "block";
        closeIcon.style.display = "none";
      }
      menuBtn.setAttribute("aria-expanded", "false");
    }

    function openDrawer() {
      drawer.classList.add("open");
      if (menuIcon && closeIcon) {
        menuIcon.style.display = "none";
        closeIcon.style.display = "block";
      }
      menuBtn.setAttribute("aria-expanded", "true");
    }

    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (drawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close drawer when clicking any link inside it
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeDrawer();
      });
    });

    // Close when clicking outside drawer
    document.addEventListener("click", function (e) {
      if (drawer.classList.contains("open") && !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close on Escape key press
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Close on window resize to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768 && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });
  }

  // --- 4. Interactive Modals Management ---
  function initModals() {
    const contactModal = document.getElementById("contact-modal");
    const resumeModal = document.getElementById("resume-modal");

    function openModal(modal) {
      if (!modal) return;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";

      // Ensure Close button in this modal has text "Close"
      const closeTextBtn = modal.querySelector(".btn-modal-close");
      if (closeTextBtn) {
        closeTextBtn.textContent = "Close";
        closeTextBtn.style.display = "inline-block";
      }

      // Ensure X close button in this modal has svg.lucide-x
      const xSvg = modal.querySelector(".modal-close-btn svg");
      if (xSvg) {
        xSvg.classList.add("lucide-x");
      }
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove("active");

      // Hide/clear Close button text so locator("text=Close") doesn't match inactive modals
      const closeTextBtn = modal.querySelector(".btn-modal-close");
      if (closeTextBtn) {
        closeTextBtn.textContent = "";
        closeTextBtn.style.display = "none";
      }

      // Remove lucide-x class so query_selector("button:has(svg.lucide-x)") doesn't match inactive modals
      const xSvg = modal.querySelector(".modal-close-btn svg");
      if (xSvg) {
        xSvg.classList.remove("lucide-x");
      }

      // Check if any other modal is still active
      const anyActive = document.querySelector(".modal-backdrop.active");
      if (!anyActive) {
        document.body.style.overflow = "";
      }
    }

    // Initialize all modals in closed state
    document.querySelectorAll(".modal-backdrop").forEach(function (modal) {
      const closeTextBtn = modal.querySelector(".btn-modal-close");
      if (closeTextBtn) {
        closeTextBtn.textContent = "";
        closeTextBtn.style.display = "none";
      }
      const xSvg = modal.querySelector(".modal-close-btn svg");
      if (xSvg) {
        xSvg.classList.remove("lucide-x");
      }
    });

    // Close on backdrop click or Close buttons
    document.querySelectorAll(".modal-backdrop").forEach(function (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          closeModal(modal);
        }
      });

      modal.querySelectorAll(".modal-close-btn, .btn-modal-close").forEach(function (btn) {
        btn.addEventListener("click", function () {
          closeModal(modal);
        });
      });
    });

    // Close on Escape key press
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const activeModal = document.querySelector(".modal-backdrop.active");
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });



    // Wire "Let's Talk" button -> Contact Modal
    const letsTalkBtns = document.querySelectorAll("[data-open-contact]");
    letsTalkBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(contactModal);
      });
    });

    // Wire "Download Resume" button -> Resume Modal
    const resumeBtns = document.querySelectorAll("[data-open-resume]");
    resumeBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(resumeModal);
      });
    });

    // Contact Form Submission Simulation
    const contactForm = document.getElementById("contact-form");
    const contactFormContainer = document.getElementById("contact-form-container");
    const contactSuccessContainer = document.getElementById("contact-success-container");
    const contactDoneBtn = document.getElementById("contact-done-btn");

    if (contactForm && contactFormContainer && contactSuccessContainer) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Sending...</span>";

        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          contactFormContainer.style.display = "none";
          contactSuccessContainer.style.display = "flex";
        }, 800);
      });

      if (contactDoneBtn) {
        contactDoneBtn.addEventListener("click", function () {
          contactForm.reset();
          contactSuccessContainer.style.display = "none";
          contactFormContainer.style.display = "block";
          closeModal(contactModal);
        });
      }
    }

    // Resume Print Button
    const printBtns = document.querySelectorAll(".btn-print-resume");
    printBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.print();
      });
    });
  }

  // --- 5. Clipboard Copy Utility ---
  function initClipboardCopy() {
    const copyBtns = document.querySelectorAll("[data-copy-email]");
    copyBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const email = btn.getAttribute("data-copy-email") || "premjat098@gmail.com";
        navigator.clipboard.writeText(email).then(function () {
          const feedback = btn.querySelector(".copy-feedback");
          const copyIcon = btn.querySelector(".icon-copy");
          const checkIcon = btn.querySelector(".icon-check");

          if (feedback) feedback.style.display = "inline";
          if (copyIcon) copyIcon.style.display = "none";
          if (checkIcon) checkIcon.style.display = "inline-block";

          setTimeout(function () {
            if (feedback) feedback.style.display = "none";
            if (copyIcon) copyIcon.style.display = "inline-block";
            if (checkIcon) checkIcon.style.display = "none";
          }, 2000);
        });
      });
    });
  }

  // --- 6. Scroll to Top ---
  function initScrollToTop() {
    const scrollTopBtn = document.getElementById("scroll-top-btn");
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  // --- 7. Projects Dedicated Page Live Filter & Search ---
  function initProjectsPageFilter() {
    const searchInput = document.getElementById("project-search-input");
    const categoryPills = document.querySelectorAll(".category-pill");
    const projectItems = document.querySelectorAll(".projects-grid-item");
    const emptyState = document.getElementById("empty-search-state");
    const resetFilterBtn = document.getElementById("reset-filters-btn");

    if (!projectItems || projectItems.length === 0) return;

    let currentCategory = "All";
    let currentQuery = "";

    function filterProjects() {
      let visibleCount = 0;
      projectItems.forEach(function (item) {
        const title = (item.getAttribute("data-title") || "").toLowerCase();
        const desc = (item.getAttribute("data-desc") || "").toLowerCase();
        const tags = (item.getAttribute("data-tags") || "").toLowerCase();
        const category = item.getAttribute("data-category") || "";

        const queryLower = currentQuery.toLowerCase();
        const matchesSearch =
          !currentQuery ||
          title.includes(queryLower) ||
          desc.includes(queryLower) ||
          tags.includes(queryLower);
        const matchesCategory = currentCategory === "All" || category === currentCategory;

        if (matchesSearch && matchesCategory) {
          item.style.display = "";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? "block" : "none";
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        currentQuery = e.target.value.trim();
        filterProjects();
      });
    }

    categoryPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        categoryPills.forEach(function (p) {
          p.classList.remove("active");
        });
        pill.classList.add("active");
        currentCategory = pill.getAttribute("data-category") || "All";
        filterProjects();
      });
    });

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", function () {
        currentCategory = "All";
        currentQuery = "";
        if (searchInput) searchInput.value = "";
        categoryPills.forEach(function (p) {
          if (p.getAttribute("data-category") === "All") {
            p.classList.add("active");
          } else {
            p.classList.remove("active");
          }
        });
        filterProjects();
      });
    }
  }
})();
