---
layout: page
title: Curriculum Vitae
nav: true
nav_title: CV
nav_order: 3
permalink: /cv/
description: Download Daniel Joseph Aronoff's CV and browse linked papers, talks, slides, and project materials.
lede: Download the current CV and browse the linked materials surfaced from it in structured form.
---
<div class="page-stack">
<section class="cv-panel">
    <div class="cv-actions">
      <a class="button-link" href="{{ '/assets/cv/daniel-joseph-aronoff-cv.pdf' | relative_url }}">Download CV</a>
    </div>
    <object class="cv-preview" data="{{ '/assets/cv/daniel-joseph-aronoff-cv.pdf' | relative_url }}#view=FitH" type="application/pdf">
      <p>PDF preview is not available in this browser. <a href="{{ '/assets/cv/daniel-joseph-aronoff-cv.pdf' | relative_url }}">Download the CV instead.</a></p>
    </object>
  </section>

  <section>
    <p class="section-label">Linked Materials from CV</p>
    <div class="cv-link-groups">
      {% for group in site.data.cv_links %}
        <section class="link-group">
          <h2>{{ group.category }}</h2>
          <ul class="cv-link-grid">
            {% for item in group.items %}
              <li class="cv-link-item">
                <h3>{{ item.title }}</h3>
                {% if item.note %}
                  <p class="meta-line">{{ item.note }}</p>
                {% endif %}
                <div class="cv-actions">
                  {% for link in item.links %}
                    <a class="button-link" href="{{ link.url }}">{{ link.label }}</a>
                  {% endfor %}
                </div>
              </li>
            {% endfor %}
          </ul>
        </section>
      {% endfor %}
    </div>
  </section>
</div>
