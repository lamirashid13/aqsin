const timelineEvents = [
  {
    year: "23.11.1936",
    period: "early",
    title: "Bakıda anadan olub",
    description: "Aqşin Əlisəttar oğlu Babayev Bakıda dünyaya gəlib."
  },
  {
    year: "1954–1959",
    period: "early",
    title: "Azərbaycan Dövlət Universitetində təhsil alıb",
    description: "Filologiya fakültəsində təhsil alıb."
  },
  {
    year: "1958",
    period: "early",
    title: "İlk hekayəsi nəşr olunub",
    description: "“Azadlıq uğrunda” adlı ilk hekayəsi oxuculara təqdim olunub."
  },
  {
    year: "1959",
    period: "early",
    title: "Radio və televiziya fəaliyyətinə başlayıb",
    description: "Azərbaycan Dövlət Televiziya və Radio Verilişləri Komitəsində çalışmağa başlayıb."
  },
  {
    year: "1964",
    period: "middle",
    title: "İlk hekayələr kitabı çap olunub",
    description: "“Cazibəli üfüqlər” adlı ilk hekayələr kitabı nəşr edilib."
  },
  {
    year: "1967",
    period: "middle",
    title: "Namizədlik dissertasiyasını müdafiə edib",
    description: "Elmi fəaliyyətində mühüm mərhələyə yüksəlib."
  },
  {
    year: "1972–1975",
    period: "middle",
    title: "Türkiyədə çalışıb",
    description: "Akademik və ədəbi fəaliyyətini Türkiyədə davam etdirib."
  },
  {
    year: "1987",
    period: "middle",
    title: "Əməkdar jurnalist adına layiq görülüb",
    description: "Azərbaycan Respublikasının Əməkdar jurnalisti fəxri adına layiq görülüb."
  },
  {
    year: "1996",
    period: "late",
    title: "Filologiya elmləri doktoru olub",
    description: "Filologiya elmləri doktoru alimlik dərəcəsi alıb."
  },
  {
    year: "1998",
    period: "late",
    title: "Professor elmi adına layiq görülüb",
    description: "Professor elmi adı ilə təltif olunub."
  },
  {
    year: "2006",
    period: "late",
    title: "Kafedra müdiri vəzifəsində çalışıb",
    description: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universitetində fəaliyyət göstərib."
  },
  {
    year: "2020",
    period: "late",
    title: "Ədəbi irsi ilə xatırlanır",
    description: "Yazıçı, şair və alim kimi zəngin irsi bu gün də yaşayır."
  }
];

const timelineList = document.querySelector("#timeline-list");
const filterButtons = document.querySelectorAll(".filter-button");

function renderTimeline(period = "all") {
  const events = timelineEvents.filter((event) => period === "all" || event.period === period);
  timelineList.replaceChildren(...events.map((event) => {
    const item = document.createElement("li");
    item.className = "timeline-item";

    const year = document.createElement("span");
    year.className = "timeline-year";
    year.textContent = event.year;

    const content = document.createElement("div");
    content.className = "timeline-content";

    const title = document.createElement("h3");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    content.append(title, description);
    item.append(year, content);
    return item;
  }));
}

renderTimeline();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    renderTimeline(button.dataset.period);
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menyunu aç" : "Menyunu bağla");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menyunu aç");
    siteNav.classList.remove("is-open");
  }
});

const imageDialog = document.querySelector(".image-dialog");
const dialogImage = imageDialog.querySelector("img");
const dialogCaption = imageDialog.querySelector("p");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    dialogImage.src = item.dataset.image;
    dialogImage.alt = item.querySelector("img").alt;
    dialogCaption.textContent = item.dataset.caption;
    imageDialog.showModal();
  });
});

imageDialog.querySelector(".dialog-close").addEventListener("click", () => imageDialog.close());
imageDialog.addEventListener("click", (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
