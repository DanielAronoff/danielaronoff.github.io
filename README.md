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

## Syncing CV-linked assets

The source of truth for the structured CV links is [`_data/cv_links.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/cv_links.yml).

To import locally stored CV-linked PDFs from the separate asset repo into `assets/cv/linked/`, run:

```bash
python3 scripts/sync_cv_assets.py
```

Optional flags:

```bash
python3 scripts/sync_cv_assets.py --source /path/to/daronoff-cv-assets --dry-run
```

The script does not delete existing files. It only copies or updates assets referenced by `source_file` entries in [`_data/cv_links.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/_data/cv_links.yml).

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

## Deploying with GitHub Pages

GitHub Pages deploys through the workflow at:

- [`.github/workflows/pages.yml`](/Users/danielaronoff/Documents/GitHub/danielaronoff.github.io/.github/workflows/pages.yml)

On pushes to `main`, the workflow installs Ruby dependencies, builds the Jekyll site, and deploys the generated `_site` directory to GitHub Pages.
