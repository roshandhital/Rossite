# Rossite

Static site. No frameworks, no build step, no CDN dependencies beyond Google Fonts.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page |
| `styles.css` | All styling and CSS animation |
| `script.js` | Loader, reveals, cursor, tilt, counters |
| `404.html` | Styled not-found page (GitHub Pages serves this automatically) |
| `favicon.svg` | Gradient monogram icon |
| `site.webmanifest` | Makes the site installable on phones |
| `robots.txt` | Lets search engines index the site |

Drop all of these into the repo root. You can delete the old `favicon.ico`
and the unused GIFs (`bird.gif`, `snowing.gif`, `mountainrange.png`,
`skiing.gif`, `cloud2.gif`, `code.gif`, `ITsupport.webp`, `crownlogo.png`,
`shine giphy.webp`, `alltimefav.png`).

## Animations

**On load** — counter runs 0 to 100, panel slides away, name rises out of a
mask line by line, role text scrambles into place, content staggers in.

**Always running** — three aurora blobs drift behind everything, film grain
shifts over the top, a 3D cube rotates in the hero, the marquee rolls, the
gradient on your surname shifts through violet, pink and amber.

**On scroll** — gradient progress bar (native CSS scroll timeline), headings
rise line by line out of masks, sections stagger in, numbers count up, cube
pauses once off screen.

**On hover** — custom two-part cursor with spring physics, buttons and links
pull magnetically toward the pointer, skill tiles tilt in 3D with a light
that follows the cursor, job rows shift right and reveal an arrow.

## If something looks wrong

Everything degrades. No JavaScript: the loader clears itself via CSS after
2.1 seconds and all content is visible. Reduced-motion enabled: the loader,
cursor and all animation are disabled, content shows immediately.

## Notes

- `site.webmanifest` assumes the site lives at `/Rossite/`. If you move it to
  a custom domain or the repo root, update `start_url` and `scope` to `/`.
- The GitHub link assumes `github.com/roshandhital`.
- Colours are CSS variables at the top of `styles.css` — change `--violet`,
  `--pink` and `--amber` to reskin everything at once.
