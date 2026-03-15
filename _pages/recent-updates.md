---
layout: page
title: Recent updates
nav: true
nav_title: Recent updates
nav_order: 2
description: A rolling 12-month archive of announcements, talks, CV-linked materials, and FT letters.
permalink: /recent-updates/
lede: Dated updates from the last 12 months across talks, CV links, publications, and Financial Times letters.
---

<section class="page-recent-updates" data-recent-updates-page>
  <p class="recent-updates__empty" data-recent-updates-empty hidden>No dated updates appeared in the last 12 months.</p>
  <ul class="recent-updates-list" data-recent-updates-list data-recent-updates-window="12" data-recent-updates-refresh-days="30">
    {% include recent-updates-items.html %}
  </ul>
</section>
