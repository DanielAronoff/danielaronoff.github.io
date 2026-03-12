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
    {% assign talk_items = site.data.talks %}
    {% assign slide_group = site.data.cv_links | where: "category", "Slide presentations" | first %}
    {% assign slide_items = slide_group.items %}
    {% assign timeline = talk_items | concat: slide_items %}
    {% assign timeline_sorted = timeline | sort: "date_key" | reverse %}
    <ul class="talk-list">
      {% for item in timeline_sorted %}
        <li class="talk-item">
          <div class="meta-line">
            {% if item.date_label %}
              {{ item.date_label }}
            {% elsif item.date %}
              {{ item.date }}
            {% else %}
              {{ item.date_key }}
            {% endif %}
            {% if item.event %}
              · {{ item.event }}
            {% elsif item.note %}
              · {{ item.note }}
            {% endif %}
          </div>
          <h2>{{ item.title }}</h2>
          <div class="talk-actions">
            {% if item.video_url %}
              <a class="button-link button-link--video" href="{{ item.video_url }}">Watch video</a>
            {% endif %}
            {% if item.links %}
              {% for link in item.links %}
                {% assign link_label = link.label | downcase %}
                {% if link_label contains "video" %}
                  <a class="button-link button-link--video" href="{{ link.url }}">{{ link.label }}</a>
                {% elsif link_label contains "slide" %}
                  <a class="button-link button-link--slides" href="{{ link.url }}">{{ link.label }}</a>
                {% else %}
                  <a class="button-link" href="{{ link.url }}">{{ link.label }}</a>
                {% endif %}
              {% endfor %}
            {% endif %}
          </div>
        </li>
      {% endfor %}
    </ul>
  </section>
</div>
