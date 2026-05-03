# Daniel Joseph Aronoff: Academic Website

This repository is a custom Jekyll site for Daniel Joseph Aronoff's academic website. The design is intentionally restrained: editorial typography, a strong grid, monochrome surfaces, thin rules, and a muted accent.

## Local setup

Prerequisites:

- Ruby `3.2.3`
- Bundler

Install dependencies:

```bash
RBENV_VERSION=3.2.3 /Users/danielaronoff/.rbenv/shims/bundle install
```

Run locally:

```bash
RBENV_VERSION=3.2.3 /Users/danielaronoff/.rbenv/shims/bundle exec jekyll serve --livereload
```

Build a production preview:

```bash
RBENV_VERSION=3.2.3 /Users/danielaronoff/.rbenv/shims/bundle exec jekyll build

Render static HTML locally into `docs/` for deployment without GitHub Actions:

```bash
RBENV_VERSION=3.2.3 /Users/danielaronoff/.rbenv/shims/bundle exec jekyll build -d docs
touch docs/.nojekyll
```
```

## Where editable content lives

- Homepage text: [`_pages/index.md`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_pages/index.md)
- Books: [`_data/books.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/books.yml)
- Talks: [`_data/talks.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/talks.yml)
- Contact details: [`_data/contact.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/contact.yml)
- CV-linked materials: [`_data/cv_links.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/cv_links.yml)
- FT letter metadata overrides: [`_data/ft_letters_overrides.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/ft_letters_overrides.yml)

## Replacing the portrait

Replace [`assets/img/daniel-joseph-aronoff-portrait.jpeg`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/assets/img/daniel-joseph-aronoff-portrait.jpeg) with a new image at the same path, or update the path referenced in:

- [`_config.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_config.yml)
- [`_layouts/home.html`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_layouts/home.html)

## Replacing or updating the CV

The canonical public CV lives at:

- [`assets/cv/daniel-joseph-aronoff-cv.pdf`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/assets/cv/daniel-joseph-aronoff-cv.pdf)

After replacing it, review:

- [`_pages/cv.md`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_pages/cv.md)
- [`_data/cv_links.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/cv_links.yml)

## CV-linked assets

The source of truth for the structured CV links is [`_data/cv_links.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/cv_links.yml). Linked PDFs live in [`assets/cv/linked/`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/assets/cv/linked) — drop new files there and reference them as `/assets/cv/linked/<filename>.pdf`.

## Importing FT letters

Import the Financial Times archive and rebuild the site data file with:

```bash
python3 scripts/build_ft_index.py
```

Preview the sizing report without copying files:

```bash
python3 scripts/build_ft_index.py --report-only
```

The script:

- scans the local archive
- reports file count and storage size
- copies PDFs into `assets/ft-letters/`
- generates [`_data/ft_letters.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/ft_letters.yml)
- applies manual corrections from [`_data/ft_letters_overrides.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/ft_letters_overrides.yml)
- logs unresolved or uncertain entries

## Correcting FT metadata manually

Use [`_data/ft_letters_overrides.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/ft_letters_overrides.yml) for title or date fixes keyed by the date-plus-slug folder name, for example:

```yml
"2017-03-13__president-trump-has-legitimate-frustrations":
  title: "President Trump has legitimate frustrations"
```

After editing overrides, rerun:

```bash
python3 scripts/build_ft_index.py
```

## Deploying with GitHub Pages (no Actions build)

This site is now built locally and published as pre-rendered static HTML.

Recommended flow (single branch + `docs/`):

1. Generate and stage the static site:

```bash
RBENV_VERSION=3.2.3 /Users/danielaronoff/.rbenv/shims/bundle exec jekyll build -d docs
touch docs/.nojekyll
git add docs
git commit -m "Update static site output"
```

2. In GitHub repository settings: Pages > Build and deployment > Source = `Deploy from a branch` > branch `main` > folder `/docs`.

3. Push:

```bash
git push
```

Optional flow (HTML-only branch):

1. Build to `docs/` as above.
2. Copy `docs/` into a dedicated branch (for example `gh-pages`) and push that branch instead.

This gives you a source branch with Jekyll and a deployable HTML branch.

## Publishing script

Use the helper script:

```bash
./scripts/build_static_pages.sh
```

It runs the local Jekyll build, writes to `docs/`, and writes `docs/.nojekyll` to force static serving.
