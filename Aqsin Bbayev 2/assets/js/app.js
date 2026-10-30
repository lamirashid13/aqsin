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

  const timeline = document.querySelector("[data-timeline]");
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

const openBtn = document.getElementById("openTimeline");
const overlay = document.getElementById("timelineOverlay");
const closeBtn = overlay?.querySelector("#closeTimeline");


if (openBtn && overlay && closeBtn) {
  let previousFocus = null;

  function openTimeline() {
    previousFocus = document.activeElement;
    overlay.style.display = "flex";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeTimeline() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.display = "none";
    document.body.style.overflow = "";
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  openBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openTimeline();
  });

  closeBtn.addEventListener('click', closeTimeline);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeTimeline();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeTimeline();
    }
  });
}


const archiveStages = [
  {
    number: "01 / 04",
    title: "Bir başlanğıc",
    text: "Aqşin Əlisəttar oğlu Babayev 23 noyabr 1936-cı ildə Bakıda anadan olub."
  },
  {
    number: "02 / 04",
    title: "Jurnalistika və media",
    text: "Aqşin Babayevin radio və televiziya sahəsindəki fəaliyyəti haqqında təsdiqlənmiş bioqrafik məlumatlar bu bölmədə təqdim ediləcək."
  },
  {
    number: "03 / 04",
    title: "Ədəbi yaradıcılıq",
    text: "Şeir, nəsr və dramaturgiya sahəsindəki fəaliyyəti və əsərləri haqqında məlumatlar bu bölmədə təqdim ediləcək."
  },
  {
    number: "04 / 04",
    title: "Elmi irs",
    text: "Ədəbiyyatşünaslıq və elmi araşdırmaları haqqında məlumatlar bu bölmədə təqdim ediləcək."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".archive-card")];
  if (!cards.length) return;

  const detailNumber = document.getElementById("detailNumber");
  const detailTitle = document.getElementById("detailTitle");
  const detailText = document.getElementById("detailText");
  const overlay = document.getElementById("stageOverlay");
  const modal = overlay?.querySelector(".stage-modal");
  const closeButton = document.getElementById("stageModalClose");
  const modalNumber = document.getElementById("stageModalNumber");
  const modalTitle = document.getElementById("stageModalTitle");
  const modalText = document.getElementById("stageModalText");
  const canOpenModal = Boolean(
    overlay && modal && closeButton && modalNumber && modalTitle && modalText
  );
  let previousFocus = null;

  function closeModal() {
    if (!canOpenModal) return;

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.display = "none";
    document.body.style.overflow = "";

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function openModal(stage) {
    if (!canOpenModal) return;

    previousFocus = document.activeElement;
    modalNumber.textContent = stage.number;
    modalTitle.textContent = stage.title;
    modalText.textContent = stage.text;
    overlay.style.display = "flex";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const stage = archiveStages[index];
      if (!stage) return;

      cards.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-pressed", "false");
      });

      card.classList.add("is-active");
      card.setAttribute("aria-pressed", "true");

      if (detailNumber && detailTitle && detailText) {
        detailNumber.textContent = stage.number;
        detailTitle.textContent = stage.title;
        detailText.textContent = stage.text;
      }

      openModal(stage);
    });
  });

  if (canOpenModal) {
    closeButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeModal();
      }
    });
  }
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
