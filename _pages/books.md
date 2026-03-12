---
layout: page
title: Books
nav: true
nav_title: Books
nav_order: 3
permalink: /books/
description: Books by Daniel Joseph Aronoff.
lede: Two books on secular stagnation, accumulation, and the financial crisis, presented in a typographic, text-forward format.
---
<section class="book-list">
  {% for book in site.data.books %}
    <article class="book-entry">
      <figure class="book-cover-wrap" aria-label="{{ book.title }}">
        {% if book.cover_image %}
          <img class="book-cover" src="{{ book.cover_image | relative_url }}" alt="Cover of {{ book.title }}">
        {% else %}
          <div class="book-cover-placeholder" role="img" aria-label="Cover image placeholder for {{ book.title }}"></div>
        {% endif %}
      </figure>
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
    </article>
  {% endfor %}
</section>
