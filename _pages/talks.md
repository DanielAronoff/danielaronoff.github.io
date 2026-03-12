---
layout: page
title: Talks
nav: true
nav_title: Talks
nav_order: 4
permalink: /talks/
description: Selected talks, recorded presentations, and related slide decks by Daniel Joseph Aronoff.
lede: Selected recorded talks, with related slide decks surfaced from the CV where relevant.
---
<div class="page-stack">
  <section>
    <ul class="talk-list">
      {% assign sorted_talks = site.data.talks | sort: "date" | reverse %}
      {% for talk in sorted_talks %}
        <li class="talk-item">
          <div class="meta-line">{{ talk.date_label }} · {{ talk.event }}</div>
          <h2>{{ talk.title }}</h2>
          <div class="talk-actions">
            <a class="button-link" href="{{ talk.video_url }}">Watch video</a>
          </div>
        </li>
      {% endfor %}
    </ul>
  </section>

  <section>
    <p class="section-label">Selected slide decks</p>
    {% assign slide_group = site.data.cv_links | where: "category", "Slide presentations" | first %}
    {% assign sorted_slides = slide_group.items | sort: "date" | reverse %}
    <ul class="talk-list">
      {% for item in sorted_slides %}
        <li class="talk-item">
          {% if item.note %}
            <div class="meta-line">{{ item.note }}</div>
          {% endif %}
          <h2>{{ item.title }}</h2>
          <div class="talk-actions">
            {% for link in item.links %}
              <a class="button-link" href="{{ link.url }}">{{ link.label }}</a>
            {% endfor %}
          </div>
        </li>
      {% endfor %}
    </ul>
  </section>
</div>
