# Product Design Portfolio CMS

Pure HTML/CSS/JavaScript portfolio CMS for GitHub Pages.

## Files

- `index.html` - static app shell
- `styles.css` - premium monochrome glass UI
- `data.js` - default profile, project, and press data
- `app.js` - routing, edit mode, localStorage persistence, analytics
- `assets/` - replaceable visual placeholders

## Run Locally

Open `index.html` directly, or run a small static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Edit Mode

The app defaults to View Mode. Press `Edit` in the header to:

- Add, edit, duplicate, delete, and reorder projects
- Replace thumbnail, hero, gallery, and video URLs
- Arrange Behance-style project story blocks on a long canvas
- Drag text/image blocks and drop image files directly onto the canvas
- Tune glass blur, opacity, type scale, card spacing, grid density, and animation speed
- Edit profile data
- Export/import JSON
- View local analytics

All edits are stored in browser `localStorage`. To make changes permanent for a deployed GitHub Pages site, export JSON and copy the resulting content back into `data.js`.

## Analytics Scope

The analytics dashboard is intentionally backend-free. It records only the current browser's interactions:

- Project clicks
- Project detail views
- Project dwell time
- Recent local activity

For real visitor analytics later, add a privacy-conscious hosted analytics provider or a small serverless endpoint.
