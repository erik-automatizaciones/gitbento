# assets

Social/preview images live here.

- **`og-image.svg`** — source for the 1200×630 social card. Export it to **`og-image.png`**
  (referenced by the `og:image` / `twitter:image` meta tags in `index.html`):

  ```bash
  # with rsvg-convert (librsvg)
  rsvg-convert -w 1200 -h 630 og-image.svg -o og-image.png
  # or with Inkscape
  inkscape og-image.svg --export-filename=og-image.png -w 1200 -h 630
  ```

- **`demo.gif`** — record the app in action (Peek or Kooha on Linux) for the README.
- **`screenshot-aurora.png` / `screenshot-midnight.png` / `screenshot-sunset.png`** —
  generate your own card in each theme and use the **Download PNG** button.
