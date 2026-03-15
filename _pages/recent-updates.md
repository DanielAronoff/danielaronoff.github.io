---
layout: page
title: Recent updates
nav: true
nav_title: Recent updates
nav_order: 2
description: A full chronological archive of announcements, talks, CV-linked materials, and FT letters.
permalink: /recent-updates/
lede: A full list of dated updates across talks, CV links, publications, and Financial Times letters.
---

<section class="page-recent-updates" data-recent-updates-page>
  <p class="recent-updates__empty" data-recent-updates-empty hidden>No dated updates were found.</p>
  <ul class="recent-updates-list" data-recent-updates-list data-recent-updates-refresh-days="30">
    {% include recent-updates-items.html %}
  </ul>
</section>
