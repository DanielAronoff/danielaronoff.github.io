document.addEventListener("DOMContentLoaded", () => {
  const parseRefreshDays = (list) => {
    const refreshDays = Number.parseInt(list?.dataset?.recentUpdatesRefreshDays || "", 10);
    if (Number.isFinite(refreshDays) && refreshDays > 0) {
      return refreshDays;
    }
    return 30;
  };

  const parseWindowMonths = (list) => {
    const rawWindow = list?.dataset?.recentUpdatesWindow;
    if (!rawWindow) {
      return null;
    }

    const windowMonths = Number.parseInt(rawWindow, 10);
    return Number.isFinite(windowMonths) && windowMonths > 0 ? windowMonths : null;
  };

  const parseMaxItems = (list) => {
    const maxItems = Number.parseInt(list?.dataset?.recentUpdatesLimit || "", 10);
    return Number.isFinite(maxItems) && maxItems > 0 ? maxItems : null;
  };

  const subtractMonthsUTC = (value, months) => {
    if (!Number.isFinite(months) || months < 0) {
      return new Date(value.getTime());
    }

    const year = value.getUTCFullYear();
    const monthIndex = value.getUTCMonth();
    const day = value.getUTCDate();
    const target = new Date(Date.UTC(year, monthIndex - months, day));

    const maxDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    if (day > maxDay) {
      target.setUTCDate(maxDay);
    }

    return target;
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

  const parseDateKey = (value) => {
    if (!value) {
      return null;
    }

    const text = String(value).trim();
    if (!/^\d{8}$/.test(text)) {
      return null;
    }

    const candidate = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00Z`;
    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const parseMonthLabel = (value) => {
    if (!value) {
      return null;
    }

    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      sept: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const match = String(value).match(/([A-Za-z]{3,4})\.?\s+(\d{4})/);

    if (!match) {
      return null;
    }

    const month = monthMap[match[1].slice(0, 3).toLowerCase()];
    if (month === undefined) {
      return null;
    }

    const date = new Date(Date.UTC(Number(match[2]), month, 1));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const inferDateFromUrl = (value) => {
    if (!value) {
      return null;
    }

    const url = decodeURIComponent(String(value));

    const arxivMatch = url.match(/arxiv(?:\.org\/(?:abs|html)\/|[.:])(\d{2})(\d{2})\.\d+/i);
    if (arxivMatch && arxivMatch[1] && arxivMatch[2]) {
      const year = Number.parseInt(`20${arxivMatch[1]}`, 10);
      const month = Number.parseInt(arxivMatch[2], 10);
      return new Date(Date.UTC(year, month - 1, 1));
    }

    const eprintMatch = url.match(/eprint\.iacr\.org\/(\d{4})\/\d+/i);
    if (eprintMatch && eprintMatch[1]) {
      return new Date(Date.UTC(Number(eprintMatch[1]), 11, 31));
    }

    const dateMatch = url.match(/([0-9]{1,2})[.\-_](\d{1,2})[.\-_](20\d{2})/);
    if (dateMatch) {
      const month = Number.parseInt(dateMatch[1], 10);
      const day = Number.parseInt(dateMatch[2], 10);
      const year = Number.parseInt(dateMatch[3], 10);
      const candidate = new Date(Date.UTC(year, month - 1, day));
      return Number.isNaN(candidate.getTime()) ? null : candidate;
    }

    const yearMonthMatch = url.match(/(20\d{2})[.\-_](\d{1,2})[.\-_]/);
    if (yearMonthMatch) {
      const year = Number.parseInt(yearMonthMatch[1], 10);
      const month = Number.parseInt(yearMonthMatch[2], 10);
      return new Date(Date.UTC(year, month - 1, 1));
    }

    return null;
  };

  const deriveDateFromItem = (item) => {
    const rawValue = item.dataset.updateDate;
    const keyValue = item.dataset.updateDateKey;
    const labelValue = item.dataset.updateDateLabel;
    const parsedFromValue = toIsoDate(rawValue) ? new Date(`${rawValue}T00:00:00Z`) : null;

    if (parsedFromValue) {
      return {
        parsed: parsedFromValue,
        iso: toIsoDate(rawValue),
        label: parsedFromValue.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      };
    }

    const dateFromKey = parseDateKey(keyValue);
    if (dateFromKey) {
      return {
        parsed: dateFromKey,
        iso: dateFromKey.toISOString().slice(0, 10),
        label: dateFromKey.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      };
    }

    const dateFromLabel = parseMonthLabel(labelValue);
    if (dateFromLabel) {
      return {
        parsed: dateFromLabel,
        iso: dateFromLabel.toISOString().slice(0, 10),
        label: dateFromLabel.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      };
    }

    const dateFromUrl = inferDateFromUrl(item.dataset.updateUrl);
    if (dateFromUrl) {
      return {
        parsed: dateFromUrl,
        iso: dateFromUrl.toISOString().slice(0, 10),
        label: dateFromUrl.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      };
    }

    return null;
  };

  const normalizeUpdateUrl = (value) => {
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value, window.location.origin);
      parsed.hash = "";
      return parsed.toString();
    } catch {
      return String(value).trim();
    }
  };

  const clampUpdateList = (list) => {
    if (!list) {
      return;
    }

    const updateItems = Array.from(list.querySelectorAll("[data-update-url]"));
    const emptyState = getEmptyState(list);
    const now = new Date();
    const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fragment = document.createDocumentFragment();
    const windowMonths = parseWindowMonths(list);
    const maxItems = parseMaxItems(list);
    const hasWindow = Number.isFinite(windowMonths) && windowMonths > 0;
    const cutoff = subtractMonthsUTC(nowUtc, hasWindow ? windowMonths : 0);

    const sorted = updateItems
      .map((item) => {
        const inferred = deriveDateFromItem(item);
        if (!inferred) {
          return null;
        }
        return {
          item,
          parsed: inferred.parsed,
          iso: inferred.iso,
          label: inferred.label,
          url: item.dataset.updateUrl || "",
        };
      })
      .filter((entry) => {
        if (!entry || !entry.iso) {
          return false;
        }

        if (!hasWindow) {
          return entry.parsed <= nowUtc;
        }

        return entry.parsed >= cutoff && entry.parsed <= nowUtc;
      })
      .sort((left, right) => right.parsed.getTime() - left.parsed.getTime());

    const seenUrls = new Set();
    const deduped = sorted.filter((entry) => {
      const normalizedUrl = normalizeUpdateUrl(entry.url);
      if (!normalizedUrl) {
        return true;
      }

      if (seenUrls.has(normalizedUrl)) {
        return false;
      }

      seenUrls.add(normalizedUrl);
      return true;
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
      if (entry.label) {
        const timeNode = node.querySelector("time");
        if (timeNode) {
          timeNode.textContent = entry.label;
        }
      }
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

  const bindRecentUpdateClicks = () => {
    const links = Array.from(document.querySelectorAll(".recent-update-link[href]"));
    if (!links.length || window.__recentUpdateClickBound === "1") {
      return;
    }
    window.__recentUpdateClickBound = "1";

    const openLink = (link) => {
      const href = link.getAttribute("href");
      const normalized = normalizeUpdateUrl(href);
      if (!normalized) {
        return;
      }
      window.location.assign(normalized);
    };

    document.addEventListener(
      "click",
      (event) => {
        if (event.button !== 0) {
          return;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        const clickedNode = event.target.closest(".recent-update-link[href], .recent-update-item[data-update-url]");
        if (!clickedNode) {
          return;
        }

        const link = clickedNode.classList.contains("recent-update-link")
          ? clickedNode
          : clickedNode.querySelector(".recent-update-link[href]");

        if (!link || !links.includes(link)) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        openLink(link);
      },
      true
    );

    links.forEach((link) => {
      link.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        openLink(link);
      });
    });
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

  bindRecentUpdateClicks();
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
