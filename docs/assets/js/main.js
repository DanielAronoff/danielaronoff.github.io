document.addEventListener("DOMContentLoaded", () => {
  const clampUpdateList = () => {
    const list = document.querySelector("[data-recent-updates-list]");
    if (!list) {
      return;
    }

    const updateItems = Array.from(list.querySelectorAll("[data-update-date][data-update-url]"));
    const emptyState = document.querySelector("[data-recent-updates-empty]");
    const now = new Date();
    const cutoff = new Date(now);
    const fragment = document.createDocumentFragment();

    cutoff.setMonth(cutoff.getMonth() - 12);

    const toIsoDate = (value) => {
      if (!value) {
        return "";
      }

      const date = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().slice(0, 10);
    };

    const sorted = updateItems
      .map((item) => {
        const value = item.dataset.updateDate;
        const parsed = new Date(`${value}T00:00:00Z`);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return {
          item,
          parsed,
          iso: toIsoDate(value),
          url: item.dataset.updateUrl || "",
        };
      })
      .filter((entry) => {
        if (!entry || !entry.iso) {
          return false;
        }

        return entry.parsed >= cutoff && entry.parsed <= now;
      })
      .sort((left, right) => right.parsed.getTime() - left.parsed.getTime());

    const deduped = [];
    const seenUrls = new Set();

    sorted.forEach((entry) => {
      if (entry.url && seenUrls.has(entry.url)) {
        return;
      }
      if (entry.url) {
        seenUrls.add(entry.url);
      }
      deduped.push(entry);
    });

    list.textContent = "";
    deduped.forEach((entry, index) => {
      const node = entry.item;
      if (index === 0) {
        node.classList.add("is-first");
      } else {
        node.classList.remove("is-first");
      }
      node.querySelector("time")?.setAttribute("datetime", entry.iso);
      fragment.appendChild(node);
    });
    list.appendChild(fragment);

    if (emptyState) {
      emptyState.hidden = deduped.length > 0;
    }
  };

  const coverLinks = document.querySelectorAll("[data-book-cover]");
  const lightbox = document.querySelector("[data-book-lightbox]");
  const lightboxImage = lightbox ? lightbox.querySelector(".book-lightbox__image") : null;
  const lightboxClose = lightbox ? lightbox.querySelector("[data-book-lightbox-close]") : null;
  const lightboxBackdrop = lightbox ? lightbox.querySelector("[data-book-lightbox-backdrop]") : null;

  const openLightbox = (imageSrc, imageAlt) => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
    }
  };

  if (coverLinks.length && lightbox) {
    coverLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const image = link.querySelector("img");
        if (!image) {
          return;
        }
        event.preventDefault();
        openLightbox(image.src, image.alt);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener("click", closeLightbox);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    });
  }

  clampUpdateList();

  const searchInput = document.querySelector("[data-ft-search-input]");

  if (!searchInput) {
    return;
  }

  const items = Array.from(document.querySelectorAll("[data-ft-search-item]"));
  const groups = Array.from(document.querySelectorAll("[data-ft-year-group]"));
  const countNode = document.querySelector("[data-ft-results-count]");
  const emptyState = document.querySelector("[data-ft-empty-state]");

  const updateSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const haystack = [
        item.dataset.title || "",
        item.dataset.date || "",
        item.dataset.source || "",
        item.dataset.slug || "",
      ]
        .join(" ")
        .toLowerCase();
      const matches = !query || haystack.includes(query);
      item.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    });

    groups.forEach((group) => {
      const visibleItems = group.querySelectorAll("[data-ft-search-item]:not([hidden])").length;
      group.hidden = visibleItems === 0;
    });

    if (countNode) {
      countNode.textContent = `${visibleCount} letter${visibleCount === 1 ? "" : "s"} shown`;
    }

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  };

  searchInput.addEventListener("input", updateSearch);
  updateSearch();
});
