document.addEventListener("DOMContentLoaded", () => {
  const parseRefreshDays = (list) => {
    const refreshDays = Number.parseInt(list?.dataset?.recentUpdatesRefreshDays || "", 10);
    if (Number.isFinite(refreshDays) && refreshDays > 0) {
      return refreshDays;
    }
    return 30;
  };

  const parseWindowMonths = (list) => {
    const windowMonths = Number.parseInt(list?.dataset?.recentUpdatesWindow || "12", 10);
    return Number.isFinite(windowMonths) && windowMonths > 0 ? windowMonths : 12;
  };

  const parseMaxItems = (list) => {
    const maxItems = Number.parseInt(list?.dataset?.recentUpdatesLimit || "", 10);
    return Number.isFinite(maxItems) && maxItems > 0 ? maxItems : null;
  };

  const getEmptyState = (list) => {
    const scope = list.closest("section") || list.parentElement;
    return scope ? scope.querySelector("[data-recent-updates-empty]") : null;
  };

  const safeSetEmptyState = (emptyNode, visibleCount) => {
    if (!emptyNode) {
      return;
    }
    emptyNode.hidden = visibleCount > 0;
  };

  const toIsoDate = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  };

  const clampUpdateList = (list) => {
    if (!list) {
      return;
    }

    const updateItems = Array.from(list.querySelectorAll("[data-update-date][data-update-url]"));
    const emptyState = getEmptyState(list);
    const now = new Date();
    const fragment = document.createDocumentFragment();
    const windowMonths = parseWindowMonths(list);
    const maxItems = parseMaxItems(list);
    const hasWindow = Number.isFinite(windowMonths) && windowMonths > 0;
    const cutoff = new Date(now);
    if (hasWindow) {
      cutoff.setMonth(cutoff.getMonth() - windowMonths);
    }

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

        if (!hasWindow) {
          return entry.parsed <= now;
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

    const finalItems = maxItems ? deduped.slice(0, maxItems) : deduped;

    finalItems.forEach((entry, index) => {
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
    safeSetEmptyState(emptyState, finalItems.length);
  };

  const clampAllUpdateLists = () => {
    const lists = Array.from(document.querySelectorAll("[data-recent-updates-list]"));
    if (!lists.length) {
      return;
    }

    const intervals = lists
      .map((list) => parseRefreshDays(list))
      .filter((value) => Number.isFinite(value) && value > 0);

    lists.forEach(clampUpdateList);

    return intervals;
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

  const refreshIntervals = clampAllUpdateLists();
  if (refreshIntervals && refreshIntervals.length > 0) {
    const effectiveRefreshDays = Math.min(...refreshIntervals);
    const refreshInterval = effectiveRefreshDays > 0 ? effectiveRefreshDays : 30;
    window.setInterval(clampAllUpdateLists, refreshInterval * 24 * 60 * 60 * 1000);
  }

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
