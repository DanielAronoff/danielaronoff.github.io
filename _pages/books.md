---
layout: page
title: Books and Chapters
nav: true
nav_title: Books and Chapters
nav_order: 3
permalink: /books/
description: Books and chapters by Daniel Joseph Aronoff.
lede: Books and chapters on market design, accumulation, and digital currencies, presented in a typographic, text-forward format.
---
<section class="book-list">
  {% for book in site.data.books %}
    <article class="book-entry">
      <div class="book-content">
        <div class="book-meta">{{ book.publisher }} · {{ book.year }}</div>
        <h2>{{ book.title }}</h2>
        <div class="book-body">
          {% assign paragraphs = book.jacket_text | split: "\n\n" %}
          {% for paragraph in paragraphs %}
            <p>{{ paragraph }}</p>
          {% endfor %}
        </div>
        <div class="book-actions">
          {% for link in book.links %}
            <a class="button-link" href="{{ link.url }}">{{ link.label }}</a>
          {% endfor %}
        </div>
      </div>
      <figure class="book-cover-wrap" aria-label="{{ book.title }}">
        {% if book.cover_image %}
          <a
            class="book-cover-link"
            href="{{ book.cover_image | relative_url }}"
            aria-label="Open cover for {{ book.title }}"
            target="_blank"
            rel="noopener"
            data-book-cover
          >
            <img class="book-cover" src="{{ book.cover_image | relative_url }}" alt="Cover of {{ book.title }}">
          </a>
        {% else %}
          <div class="book-cover-placeholder" role="img" aria-label="Cover image placeholder for {{ book.title }}"></div>
        {% endif %}
      </figure>
    </article>
  {% endfor %}
</section>

<div class="book-lightbox" data-book-lightbox aria-hidden="true" role="dialog" aria-label="Book cover preview">
  <div class="book-lightbox__backdrop" data-book-lightbox-backdrop></div>
  <div class="book-lightbox__frame">
    <button class="book-lightbox__close" type="button" aria-label="Close cover preview" data-book-lightbox-close>×</button>
    <img class="book-lightbox__image" src="" alt="">
  </div>
</div>
