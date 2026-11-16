const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav, .site-nav');
const cookieBanner = document.getElementById('cookieBanner');
const acceptCookie = document.querySelector('.cookie-accept');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const sectionTargets = {
    home: 'home',
    life: 'life',
    about: 'about',
    press: 'press',
    books: 'books-gallery',
    wisdom: 'wisdom',
    tributes: 'tributes',
    contacts: 'contacts'
  };

  mainNav.querySelectorAll('a[data-section]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = sectionTargets[link.dataset.section];
      const target = targetId && document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';

      target.scrollIntoView({ behavior, block: 'start' });
      if (window.location.hash !== `#${targetId}`) {
        window.history.pushState(null, '', `#${targetId}`);
      }
    });
  });
}

if (acceptCookie && cookieBanner) {
  acceptCookie.addEventListener('click', () => {
    cookieBanner.classList.add('is-hidden');
  });
}

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector('input');
    const button = newsletterForm.querySelector('button');
    if (!input || !button) return;

    if (!input.value.trim() || !input.checkValidity()) {
      input.focus();
      input.setCustomValidity('Please enter a valid email address.');
      input.reportValidity();
      return;
    }

    input.setCustomValidity('');
    const prevText = button.textContent;
    button.textContent = 'THANK YOU';
    button.disabled = true;
    input.value = '';

    setTimeout(() => {
      button.textContent = prevText;
      button.disabled = false;
    }, 1800);
  });

  newsletterForm.querySelector('input')?.addEventListener('input', (event) => {
    event.currentTarget.setCustomValidity('');
  });
}

const stats = document.querySelectorAll('[data-count]');

const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  const duration = 1400;
  const start = performance.now();

  const tick = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  stats.forEach((stat) => observer.observe(stat));
} else {
  stats.forEach((stat) => {
    stat.textContent = stat.dataset.count || '0';
  });
}

(() => {
  const data = window.siteData;
  if (!data) return;

  const textElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  };

  const timeline = document.querySelector("[data-timeline]:not([data-modal-timeline-events])");
  if (timeline && Array.isArray(data.timelineEvents)) {
    const filters = [...document.querySelectorAll("[data-timeline-filter]")];
    let activeDecade = "all";

    function renderTimeline() {
      const events = data.timelineEvents.filter((event) =>
        activeDecade === "all" || event.decade === activeDecade
      );
      const cards = events.map((event) => {
        const card = document.createElement("article");
        card.className = "archive-event";
        card.append(
          textElement("span", "archive-event-year", event.year),
          textElement("h2", "archive-event-title", event.title),
          textElement("p", "archive-event-description", event.description)
        );
        return card;
      });

      timeline.replaceChildren(...cards);
    }

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        activeDecade = filter.dataset.timelineFilter || "all";
        filters.forEach((item) => {
          const selected = item === filter;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        renderTimeline();
      });
    });

    renderTimeline();
  }

  const bookGrid = document.querySelector("[data-books-grid]");
  if (bookGrid && Array.isArray(data.books)) {
    const search = document.querySelector("[data-book-search]");
    const genre = document.querySelector("[data-book-genre]");
    const count = document.querySelector("[data-book-count]");

    function renderBooks() {
      const term = search?.value.trim().toLocaleLowerCase("az") || "";
      const selectedGenre = genre?.value || "all";
      const books = data.books.filter((book) => {
        const matchesText = `${book.title} ${book.description} ${book.genre}`
          .toLocaleLowerCase("az")
          .includes(term);
        return matchesText && (selectedGenre === "all" || book.genre === selectedGenre);
      });

      const cards = books.map((book) => {
        const card = document.createElement("article");
        card.className = "page-book-card";
        card.append(
          textElement("span", "page-card-category", book.genre),
          textElement("h2", "page-card-title", book.title),
          textElement("p", "page-card-description", book.description),
          textElement("span", "page-card-year", book.year)
        );
        return card;
      });

      bookGrid.replaceChildren(...cards);
      if (count) count.textContent = `${books.length} əsər`;
    }

    search?.addEventListener("input", renderBooks);
    genre?.addEventListener("change", renderBooks);
    renderBooks();
  }

  const gallery = document.querySelector("[data-gallery-grid]");
  if (gallery && Array.isArray(data.gallery)) {
    const filter = document.querySelector("[data-gallery-filter]");
    const lightbox = document.querySelector("[data-lightbox]");
    const lightboxImage = lightbox?.querySelector("img");
    const lightboxTitle = lightbox?.querySelector("[data-lightbox-title]");
    const lightboxCount = lightbox?.querySelector("[data-lightbox-count]");
    const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
    let visibleItems = [];
    let previousFocus = null;

    function closeLightbox() {
      if (!lightbox || !lightboxImage) return;

      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.removeAttribute("src");
      document.body.style.overflow = "";
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    }

    function openLightbox(item, index, button) {
      if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxCount) return;

      previousFocus = button;
      lightboxImage.src = button.querySelector("img").src;
      lightboxImage.alt = item.alt;
      lightboxTitle.textContent = item.title;
      lightboxCount.textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(visibleItems.length).padStart(2, "0")}`;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightboxClose?.focus();
    }

    function renderGallery() {
      const category = filter?.value || "all";
      visibleItems = data.gallery.filter((item) =>
        category === "all" || item.category === category
      );

      const cards = visibleItems.map((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-card";
        button.setAttribute("aria-label", `${item.title} — böyüt`);

        const image = document.createElement("img");
        image.src = document.body.dataset.page
          ? `../${item.src}`
          : item.src;
        image.alt = item.alt;

        button.append(
          image,
          textElement("span", "gallery-card-category", item.category),
          textElement("span", "gallery-card-title", item.title)
        );
        button.addEventListener("click", () => openLightbox(item, index, button));
        return button;
      });

      gallery.replaceChildren(...cards);
    }

    filter?.addEventListener("change", renderGallery);
    lightboxClose?.addEventListener("click", closeLightbox);
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox?.classList.contains("is-open")) {
        closeLightbox();
      }
    });
    renderGallery();
  }

  const wisdomQuotes = document.querySelector("#wisdomQuotes");
  if (wisdomQuotes && Array.isArray(data.quotes)) {
    const quotes = data.quotes.map((item, index) => {
      const quote = document.createElement("article");
      quote.className = `wisdom-quote${index === 0 ? " is-active" : ""}`;
      quote.dataset.index = String(index);

      const blockquote = textElement("blockquote", "", item.text);
      const divider = document.createElement("div");
      divider.className = "wisdom-quote-divider";
      quote.append(
        blockquote,
        divider,
        textElement("p", "wisdom-author", item.source),
        textElement("span", "wisdom-author-role", "Yazıçı və dramaturq")
      );
      return quote;
    });

    wisdomQuotes.replaceChildren(...quotes);
  }
})();

window.Aq90Chronology = (() => {
  const openButton = document.getElementById("openTimeline");
  const overlay = document.getElementById("aq90ChronologyOverlay");
  const modal = document.getElementById("aq90ChronologyModal");
  const closeButton = document.getElementById("aq90ChronologyClose");
  const scrollArea = document.getElementById("aq90ChronologyScroll");
  let previousFocus = null;
  let previousBodyOverflow = "";

  if (!openButton || !overlay || !modal || !closeButton || !scrollArea) return null;

  function open() {
    previousFocus = document.activeElement;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    scrollArea.scrollTop = 0;
    overlay.dataset.open = "true";
    overlay.setAttribute("aria-hidden", "false");
    closeButton.focus();
  }

  function close() {
    overlay.dataset.open = "false";
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  openButton.addEventListener("click", (event) => {
    event.preventDefault();
    open();
  });

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.dataset.open === "true") close();
  });

  return { open, close };
})();


document.addEventListener("DOMContentLoaded", () => {
  const archiveTimeline = document.querySelector(".archive-timeline");
  if (!archiveTimeline) return;

  const cards = [...archiveTimeline.querySelectorAll("[data-legacy-target]")];
  const panels = [...archiveTimeline.querySelectorAll(".legacy-detail")];
  if (!cards.length || !panels.length) return;

  function closePanel(panel, returnFocus = false) {
    panel.hidden = true;
    const card = cards.find((item) => item.dataset.legacyTarget === panel.id);
    card?.setAttribute("aria-expanded", "false");
    if (returnFocus) card?.focus();
  }

  archiveTimeline.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const closeButton = event.target.closest("[data-close-legacy]");
    if (closeButton && archiveTimeline.contains(closeButton)) {
      const panel = closeButton.closest(".legacy-detail");
      if (panel) closePanel(panel, true);
      return;
    }

    const card = event.target.closest("[data-legacy-target]");
    if (!card || !archiveTimeline.contains(card)) return;

    const panel = panels.find((item) => item.id === card.dataset.legacyTarget);
    if (!panel) return;

    const shouldOpen = panel.hidden;
    panels.forEach((item) => {
      item.hidden = true;
      const linkedCard = cards.find((candidate) => candidate.dataset.legacyTarget === item.id);
      linkedCard?.setAttribute("aria-expanded", "false");
    });

    if (shouldOpen) {
      panel.hidden = false;
      card.setAttribute("aria-expanded", "true");
    }
  });
});

(() => {
  const track = document.getElementById("booksTrack");
  const prev = document.getElementById("booksPrev");
  const next = document.getElementById("booksNext");
  const progress = document.getElementById("galleryProgress");
  const count = document.getElementById("galleryCount");

  const modal = document.getElementById("bookModal");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalDescription = document.getElementById("modalDescription");

  if (
    !track || !prev || !next || !modal || !modalClose ||
    !modalTitle || !modalCategory || !modalDescription
  ) return;

  const cards = [...track.querySelectorAll(".book-card")];
  let lastFocused = null;
  let requestedScrollLeft = track.scrollLeft;

  function getStep() {
    const card = cards[0];
    if (!card) return 300;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function updateGallery(scrollLeft = track.scrollLeft) {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const ratio = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    if (progress) {
      progress.style.width =
        `${Math.max(16.67, Math.min(100, 16.67 + ratio * 83.33))}%`;
    }

    const step = getStep();
    const current = Math.min(
      cards.length,
      Math.max(1, Math.round(scrollLeft / step) + 1)
    );

    if (count) {
      count.textContent =
        `${String(current).padStart(2, "0")} — ${String(cards.length).padStart(2, "0")}`;
    }

    prev.disabled = scrollLeft <= 2;
    next.disabled = scrollLeft >= maxScroll - 2;

    prev.style.opacity = prev.disabled ? ".4" : "1";
    next.style.opacity = next.disabled ? ".4" : "1";
  }

  function scrollGallery(direction) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    requestedScrollLeft = Math.min(
      maxScroll,
      Math.max(0, requestedScrollLeft + direction * getStep())
    );
    track.scrollTo({ left: requestedScrollLeft, behavior });
    updateGallery(requestedScrollLeft);
  }

  prev.addEventListener("click", () => {
    scrollGallery(-1);
  });

  next.addEventListener("click", () => {
    scrollGallery(1);
  });

  track.addEventListener("scroll", () => {
    requestedScrollLeft = track.scrollLeft;
    updateGallery();
  }, { passive: true });
  window.addEventListener("resize", () => {
    requestedScrollLeft = track.scrollLeft;
    updateGallery();
  });
  updateGallery();

  function openBook(card) {
    lastFocused = document.activeElement;

    modalTitle.textContent = card.dataset.title || "Aqşin Babayev";
    modalCategory.textContent = card.dataset.category || "Ədəbi irs";
    modalDescription.textContent =
      card.dataset.description || "Əsər haqqında məlumat hazırlanır.";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    modalClose.focus();
  }

  function closeBook() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  track.querySelectorAll(".book-card").forEach(card => {
    const button = card.querySelector(".book-open");
    if (button) button.addEventListener("click", () => openBook(card));
  });

  modalClose.addEventListener("click", closeBook);

  modal.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", closeBook);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeBook();
    }
  });
})();

(() => {
  const section = document.getElementById("wisdom");
  if (!section) return;

  const quotes = [
    ...section.querySelectorAll(".wisdom-quote")
  ];

  const prev = section.querySelector("#wisdomPrev");
  const next = section.querySelector("#wisdomNext");
  const number = section.querySelector("#wisdomNumber");
  const count = section.querySelector("#wisdomCount");
  const progress = section.querySelector("#wisdomProgress");

  if (!quotes.length || !prev || !next || !number || !count || !progress) return;

  let current = 0;

  function showQuote(index) {
    current = (index + quotes.length) % quotes.length;

    quotes.forEach((quote, i) => {
      quote.classList.toggle("is-active", i === current);
    });

    number.textContent = String(current + 1).padStart(2, "0");

    count.textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(quotes.length).padStart(2, "0")}`;

    progress.style.width =
      `${((current + 1) / quotes.length) * 100}%`;
  }

  prev.addEventListener("click", () => {
    showQuote(current - 1);
  });

  next.addEventListener("click", () => {
    showQuote(current + 1);
  });

  showQuote(0);
})();

(() => {
  const section = document.getElementById("tributes");
  if (!section) return;

  const items = [
    {
      quote: "Obyektiv, dürüst və ciddi, öz ölçüləri olan insan idi.",
      name: "Qulu Məhərəmli",
      role: "Jurnalist və teletənqidçi",
      initials: "QM",
      source: "https://modern.az/news/243266/"
    },
    {
      quote: "Sizi heç vaxt unutmayacağam, Ustad! Məzarınız nurlu olsun, nurlu İNSAN!",
      name: "Xatirə Hüseynova",
      role: "Filologiya üzrə fəlsəfə doktoru, dosent",
      initials: "XH",
      source: "https://kaspi.az/az/hardan-gelib-hara-getdi-bu-iller"
    },
    {
      quote: "İntellektual və kübar.",
      name: "Xaqani Səfəroğlu",
      role: "Azpost.info internet qəzetinin baş redaktoru",
      initials: "XS",
      source: "https://kaspi.az/az/hardan-gelib-hara-getdi-bu-iller"
    }
  ];

  const quote = section.querySelector("#tributeQuote");
  const name = section.querySelector("#tributeName");
  const role = section.querySelector("#tributeRole");
  const avatar = section.querySelector("#tributeAvatar");
  const source = section.querySelector("#tributeSource");
  const index = section.querySelector("#tributeIndex");
  const prev = section.querySelector("#tributePrev");
  const next = section.querySelector("#tributeNext");
  const card = section.querySelector("#tributeCard");

  if (!quote || !name || !role || !avatar || !source || !index ||
      !prev || !next || !card) return;

  let current = 0;

  function showItem(newIndex) {
    current = (newIndex + items.length) % items.length;
    const item = items[current];

    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";

    quote.textContent = item.quote;
    name.textContent = item.name;
    role.textContent = item.role;
    avatar.textContent = item.initials;
    source.href = item.source;
    index.textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  }

  prev.addEventListener("click", () => showItem(current - 1));
  next.addEventListener("click", () => showItem(current + 1));

  showItem(0);
})();

document.addEventListener("DOMContentLoaded", () => {
    const openButton = document.getElementById("openAboutModal");
    const modal = document.getElementById("aboutModal");

    if (!openButton && !modal) return;

    if (!openButton || !modal) {
        console.error("ƏTRAFLI düyməsi və ya aboutModal tapılmadı.");
        return;
    }

    const closeButton = modal.querySelector(
        ".modal-close, .close-modal, [data-close-modal]"
    );
    let previousFocus = null;

    function openModal() {
        previousFocus = document.activeElement;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeButton?.focus();
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    openButton.addEventListener("click", openModal);

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("is-open")
        ) {
            closeModal();
        }
    });
});

(() => {
  const section = document.querySelector("#research");
  const openButton = document.getElementById("open-research");
  const modal = document.getElementById("topics-modal");
  const closeButton = document.getElementById("close-research");
  const detailModal = document.getElementById("research-detail-modal");
  const detailCloseButton = document.getElementById("close-detail");
  const detailTitle = document.getElementById("research-detail-title");
  const detailText = document.getElementById("research-detail-text");
  const detailWorks = document.getElementById("research-detail-works");

  if (!section || !openButton || !modal || !closeButton) {
    console.error("Tədqiqat düyməsi və ya modal elementləri tapılmadı.");
    return;
  }

  const details = {
    nazim: {
      title: "Nazim Hikmət və Azərbaycan",
      text: "Aqşin Babayev Nazim Hikmətin həyat və yaradıcılığını, şairin Azərbaycanla və Azərbaycan ədəbi mühiti ilə əlaqələrini araşdıran alimlərdən olub. Bu istiqamət onun elmi irsində xüsusi yer tutur.",
      works: "Əlaqəli əsər: “Nazim Hikmətin yaşamı”."
    },
    turk: {
      title: "Türk ədəbiyyatının tədqiqi",
      text: "Türk ədəbiyyatı və dramaturgiyası Aqşin Babayevin əsas tədqiqat istiqamətlərindəndir. Onun bu sahədəki kitabları Azərbaycan oxucusunun türk ədəbi irsi ilə tanışlığına xidmət edir.",
      works: "Əlaqəli kitablar: “Türk dramaturgiyası”, “Türk ədəbiyyatı müntəxəbatı”, “Cümhuriyyət dövrü türk ədəbiyyatında sosial motivlər”."
    },
    tehsil: {
      title: "Elmi və pedaqoji fəaliyyət",
      text: "Aqşin Babayev professor və pedaqoq kimi uzun illər çalışıb, ədəbi yaradıcılıq və ekran dramaturgiyası sahəsində dərs deyib. Onun elmi-pedaqoji irsi tədqiqatı, tədrisi və ədəbi biliklərin paylaşılmasını bir araya gətirir.",
      works: "Bu istiqamətə onun dərs vəsaitləri, elmi əsərləri və universitetdəki pedaqoji fəaliyyəti daxildir."
    }
  };

  let returnFocus = null;
  let detailReturnFocus = null;
  let previousOverflow = "";
  let scrollLocked = false;

  function lockScroll() {
    if (scrollLocked) return;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    scrollLocked = true;
  }

  function restoreScroll() {
    if (!scrollLocked) return;
    document.body.style.overflow = previousOverflow;
    scrollLocked = false;
  }

  function showModal(target) {
    target.hidden = false;
    target.setAttribute("aria-hidden", "false");
  }

  function hideModal(target) {
    target.hidden = true;
    target.setAttribute("aria-hidden", "true");
  }

  function openTopics() {
    if (!modal.hidden) return;
    returnFocus = document.activeElement;
    lockScroll();
    showModal(modal);
    closeButton.focus();
  }

  function closeTopics() {
    if (modal.hidden) return;
    if (detailModal && !detailModal.hidden) hideModal(detailModal);
    hideModal(modal);
    restoreScroll();
    if (returnFocus && typeof returnFocus.focus === "function") {
      returnFocus.focus();
    }
  }

  function openDetail(key, button) {
    const item = details[key];
    if (!item || !detailModal || !detailCloseButton || !detailTitle || !detailText || !detailWorks) {
      return;
    }

    detailReturnFocus = button;
    detailTitle.textContent = item.title;
    detailText.textContent = item.text;
    detailWorks.textContent = item.works;
    showModal(detailModal);
    detailCloseButton.focus();
  }

  function closeDetail() {
    if (!detailModal || detailModal.hidden) return;
    hideModal(detailModal);
    if (detailReturnFocus && typeof detailReturnFocus.focus === "function") {
      detailReturnFocus.focus();
    }
  }

  openButton.addEventListener("click", openTopics);
  closeButton.addEventListener("click", closeTopics);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeTopics();
  });

  if (detailModal && detailCloseButton) {
    detailModal.addEventListener("click", (event) => {
      if (event.target === detailModal) closeDetail();
    });

    detailCloseButton.addEventListener("click", closeDetail);

    modal.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        openDetail(button.dataset.topic, button);
      });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (detailModal && !detailModal.hidden) {
      closeDetail();
    } else {
      closeTopics();
    }
  });
})();

(() => {
  const playlistRoot = document.getElementById("audioPlaylist");
  const titleElement = document.getElementById("audioTrackTitle");
  const progressElement = document.getElementById("audioProgress");
  const currentTimeElement = document.getElementById("audioCurrentTime");
  const remainingElement = document.getElementById("audioRemaining");
  const playPauseButton = document.getElementById("playPauseButton");
  const rewindButton = document.getElementById("rewindButton");
  const forwardButton = document.getElementById("forwardButton");

  if (!playlistRoot || !titleElement || !progressElement || !currentTimeElement || !remainingElement || !playPauseButton || !rewindButton || !forwardButton) {
    return;
  }

  const tracks = [
    { title: "Adil İsgəndərov", src: "assets/mp3/Adil İsgəndərov.mp3" },
    { title: "Aqşin Babayev", src: "assets/mp3/Aqşin Babayev.mp3" },
    { title: "Cahangir Cahangirov", src: "assets/mp3/Cahangir Cahangirov.mp3" },
    { title: "Emin Sabitoğlu", src: "assets/mp3/Emin Sabitoğlu.mp3" },
    { title: "Gülarə Əliyeva", src: "assets/mp3/Gülarə Əliyeva.mp3" },
    { title: "Gülağa Məmmədov", src: "assets/mp3/Gülağa Məmmədov.mp3" },
    { title: "Hacıbaba Bağırov", src: "assets/mp3/Hacıbaba Bağırov.mp3" },
    { title: "Hacıbaba Hüseynov", src: "assets/mp3/Hacıbaba Hüseynov.mp3" },
    { title: "Həkim Qəni", src: "assets/mp3/Həkim Qəni.mp3" },
    { title: "Həsən Ebluc", src: "assets/mp3/Həsən Ebluc.mp3" },
    { title: "Mirzə Babayev", src: "assets/mp3/Mirzə Babayev.mp3" },
    { title: "Müslüm Maqomayev", src: "assets/mp3/Müslüm Maqomayev.mp3" },
    { title: "Məmmədbağır Bagırzadə", src: "assets/mp3/Məmmədbağır Bagırzadə.mp3" },
    { title: "Nazim Hikmət", src: "assets/mp3/Nazim Hikmət.mp3" },
    { title: "Niyazi", src: "assets/mp3/Niyazi.mp3" },
    { title: "Nüsrət Kəsəmənli", src: "assets/mp3/Nüsrət Kəsəmənli.mp3" },
    { title: "Nəsibə Zeynalova", src: "assets/mp3/Nəsibə Zeynalova.mp3" },
    { title: "Nəsir İmanquliyev", src: "assets/mp3/Nəsir İmanquliyev.mp3" },
    { title: "Osman Mirzəyev", src: "assets/mp3/Osman Mirzəyev.mp3" },
    { title: "Qara Qarayev", src: "assets/mp3/Qara Qarayev.mp3" },
    { title: "Qasım Qasımzadə", src: "assets/mp3/Qasım Qasımzadə.mp3" },
    { title: "Rafiq Babayev", src: "assets/mp3/Rafiq Babayev.mp3" },
    { title: "Rauf Kazimovski", src: "assets/mp3/Rauf Kazimovski.mp3" },
    { title: "Rübabə Muradova", src: "assets/mp3/Rübabə Muradova.mp3" },
    { title: "Sabit Rəhman", src: "assets/mp3/Sabit Rəhman.mp3" },
    { title: "Salam & Qəmər Salamzadə", src: "assets/mp3/Salam & Qəmər Salamzadə.mp3" },
    { title: "Sara Qədimova", src: "assets/mp3/Sara Qədimova.mp3" },
    { title: "Səid Rüstəmov", src: "assets/mp3/Səid Rüstəmov.mp3" },
    { title: "Vasif Adıgözəlov", src: "assets/mp3/Vasif Adıgözəlov.mp3" },
    { title: "Xəlil Rza Ulutürk", src: "assets/mp3/Xəlil Rza Ulutürk.mp3" },
    { title: "Zeynal Cabbarzadə", src: "assets/mp3/Zeynal Cabbarzadə.mp3" },
    { title: "İlyas Əfəndiyev", src: "assets/mp3/İlyas Əfəndiyev.mp3" },
    { title: "Əhsən Dadaşov", src: "assets/mp3/Əhsən Dadaşov.mp3" },
    { title: "Əkrəm Cəfər", src: "assets/mp3/Əkrəm Cəfər.mp3" },
    { title: "Əli Kərim", src: "assets/mp3/Əli Kərim.mp3" },
    { title: "Əliağa Vahid", src: "assets/mp3/Əliağa Vahid.mp3" },
    { title: "Ələsgər Ələkbərov", src: "assets/mp3/Ələsgər Ələkbərov.mp3" },
    { title: "Ənvər Əlibəyli", src: "assets/mp3/Ənvər Əlibəyli.mp3" }
  ];

  const audio = new Audio();
  audio.preload = "metadata";

  let currentIndex = 0;
  let isPlaying = false;

  const playIcon = "<svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M8 5.5v13l10-6.5L8 5.5z' /></svg>";
  const pauseIcon = "<svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M7 5h4v14H7zm6 0h4v14h-4z' /></svg>";
  const rewindIcon = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M11 7L5 12l6 5' /><path d='M19 7l-6 5 6 5' /></svg>";
  const forwardIcon = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M13 7l6 5-6 5' /><path d='M5 7l6 5-6 5' /></svg>";

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return "00:00";
    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function syncPlayButton() {
    playPauseButton.innerHTML = isPlaying ? pauseIcon : playIcon;
    playPauseButton.setAttribute("aria-label", isPlaying ? "İfa səssizləşdir" : "Səsi başlat");
    playPauseButton.title = isPlaying ? "Pauza" : "Başlat";
  }

  function updatePlaylist() {
    const buttons = playlistRoot.querySelectorAll(".audio-track-button");
    buttons.forEach((button, index) => {
      button.classList.toggle("is-active", index === currentIndex);
      button.setAttribute("aria-pressed", String(index === currentIndex));
    });
  }

  function updateProgressBar() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const safeCurrent = Math.min(Math.max(current, 0), duration || 0);
    const percent = duration > 0 ? (safeCurrent / duration) * 100 : 0;

    progressElement.style.setProperty("--progress", `${percent}%`);
    progressElement.max = String(duration || 0);
    progressElement.value = String(safeCurrent);
    currentTimeElement.textContent = formatTime(safeCurrent);
    remainingElement.textContent = duration > 0 ? `-${formatTime(Math.max(0, duration - safeCurrent))}` : "-00:00";
  }

  function loadTrack(index, autoplay = false) {
    currentIndex = (index + tracks.length) % tracks.length;
    const track = tracks[currentIndex];
    titleElement.textContent = track.title;
    audio.src = track.src;
    audio.load();
    audio.currentTime = 0;
    updatePlaylist();
    updateProgressBar();

    if (autoplay) {
      audio.play().then(() => {
        isPlaying = true;
        syncPlayButton();
      }).catch(() => {
        isPlaying = false;
        syncPlayButton();
      });
    } else {
      isPlaying = false;
      syncPlayButton();
    }
  }

  function togglePlayback() {
    if (!audio.src) {
      loadTrack(currentIndex, true);
      return;
    }

    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        syncPlayButton();
      }).catch(() => {
        isPlaying = false;
        syncPlayButton();
      });
      return;
    }

    audio.pause();
    isPlaying = false;
    syncPlayButton();
  }

  function seekBy(offset) {
    const nextTime = Math.min(Math.max(audio.currentTime + offset, 0), audio.duration || 0);
    audio.currentTime = nextTime;
    updateProgressBar();
  }

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    item.className = "audio-playlist-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "audio-track-button";
    button.setAttribute("aria-label", `Səsi seç: ${track.title}`);
    button.innerHTML = `
      <span class="audio-track-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3v11.1a3.5 3.5 0 1 1-2.5-3.34V3h2.5z" />
          <path d="M12 14.2a3.5 3.5 0 0 1 3.5 3.5" />
        </svg>
      </span>
      <span class="audio-track-text">
        <span class="audio-track-name">${track.title}</span>
        <span class="audio-track-meta">Track ${String(index + 1).padStart(2, "0")}</span>
      </span>
    `;
    button.addEventListener("click", () => loadTrack(index, true));
    item.appendChild(button);
    playlistRoot.appendChild(item);
  });

  playPauseButton.addEventListener("click", togglePlayback);
  rewindButton.addEventListener("click", () => seekBy(-10));
  forwardButton.addEventListener("click", () => seekBy(10));
  progressElement.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    audio.currentTime = value;
    updateProgressBar();
  });

  audio.addEventListener("loadedmetadata", updateProgressBar);
  audio.addEventListener("timeupdate", updateProgressBar);
  audio.addEventListener("play", () => {
    isPlaying = true;
    syncPlayButton();
  });
  audio.addEventListener("pause", () => {
    isPlaying = false;
    syncPlayButton();
  });
  audio.addEventListener("ended", () => {
    isPlaying = false;
    syncPlayButton();
    audio.currentTime = 0;
    updateProgressBar();
  });

  rewindButton.innerHTML = rewindIcon;
  forwardButton.innerHTML = forwardIcon;
  syncPlayButton();
  loadTrack(0, false);
})();
