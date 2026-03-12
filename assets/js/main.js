document.addEventListener("DOMContentLoaded", () => {
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
      const haystack = item.dataset.searchIndex || "";
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
