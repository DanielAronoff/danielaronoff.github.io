---
layout: page
title: Recent updates
nav: true
nav_title: Recent updates
nav_order: 2
description: A chronological archive of recent announcements, talks, CV-linked materials, and FT letters from the past 12 months.
permalink: /recent-updates/
lede: A list of dated updates across talks, CV links, publications, and Financial Times letters from the last 12 months.
---

<section class="page-recent-updates" data-recent-updates-page>
  <p class="recent-updates__empty" data-recent-updates-empty hidden>No dated updates appeared in the last 12 months.</p>
  <ul class="recent-updates-list" data-recent-updates-list data-recent-updates-window="12" data-recent-updates-refresh-days="30">
    {% include recent-updates-items.html window_months=12 %}
  </ul>
</section>
