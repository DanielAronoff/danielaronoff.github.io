---
layout: page
title: FT Letters
nav: true
nav_title: FT Letters
nav_order: 6
permalink: /ft-letters/
description: My letters to the Financial Times, indexed, searchable, and available as downloadable PDFs.
lede: A public, searchable index of my letters to the Financial Times, grouped by year and linked to downloadable hosted PDFs.
---
{% assign total_letters = site.data.ft_letters | size %}
{% assign year_groups = site.data.ft_letters | group_by: "year" | sort: "name" | reverse %}

<div class="page-stack">
  {% if total_letters == 0 %}
    <p class="meta-line">No letters are currently indexed. Rebuild the FT index if source files have been added.</p>
  {% else %}
  <section class="search-panel">
    <label for="ft-search">Search letters by title, date, or source filename</label>
    <input id="ft-search" type="search" placeholder="Search the archive" data-ft-search-input>
    <p class="results-meta">
      <span>{{ total_letters }} letters indexed</span>
      <span aria-hidden="true"> · </span>
      <span data-ft-results-count>{{ total_letters }} letters shown</span>
    </p>
  </section>

  <section class="ft-index">
    <div class="empty-state" data-ft-empty-state>
      No letters match the current search.
    </div>
    {% for group in year_groups %}
      <section class="year-group" data-ft-year-group>
        <h2>{{ group.name }}</h2>
        <ul class="year-list">
          {% for letter in group.items %}
          <li
              class="letter-item"
              data-ft-search-item
              data-title="{{ letter.title | xml_escape }}"
              data-date="{{ letter.date | xml_escape }}"
              data-source="{{ letter.source_filename | xml_escape }}"
              data-slug="{{ letter.slug | xml_escape }}"
            >
              <div class="letter-meta">{{ letter.date | date: "%B %-d, %Y" }}</div>
              <h3><a href="{{ letter.pdf | relative_url }}">{{ letter.title }}</a></h3>
              <p class="meta-line">Source file: {{ letter.source_filename }}</p>
              <div class="letter-actions">
                <a class="button-link" href="{{ letter.pdf | relative_url }}">Download PDF</a>
              </div>
            </li>
          {% endfor %}
        </ul>
      </section>
    {% endfor %}
  </section>
  {% endif %}
</div>
