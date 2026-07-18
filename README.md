# Sunday Sheet

A song index + running-order builder, built from your existing songbook.

## What it does
- **Index**: every song from the uploaded database, searchable by title or lyrics, filterable by section (Entrance, Offertory, Communion, Recessional, Actions, Mass Parts, General/Praise).
- **Running order**: tick songs, reorder with the arrows, and they build Sunday's sheet on the right.
- **Generate**:
  - *PDF* — click "Generate PDF (print)", then choose "Save as PDF" in the print dialog. Works on any device, no extra software needed by anyone receiving it.
  - *Word* — click "Download Word (.docx)" for an editable version.
- **Add / edit songs**: "+ Add song" or "Edit" on any entry. Paste a whole block (lyrics, chords and all) or fill it in verse-by-verse. New songs are searchable immediately.

## Data note
The song database was auto-parsed from the original Word file (`Al_songs_database__updated___1_June_2022.docx`) — 220 songs after removing duplicates. The parsing is a first pass: a handful of titles or section tags may need a quick fix via "Edit" (some songs in the original file weren't formatted consistently, so a few boundaries were guessed). Anything you add or fix is saved in your browser (localStorage), so it persists between visits on the same device/browser.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel (free)
1. Push this folder to a new GitHub repository.
2. Go to vercel.com → "Add New Project" → import that repository.
3. Leave all settings as default (Vercel auto-detects Next.js) → Deploy.
4. You'll get a live URL (e.g. `sunday-sheet.vercel.app`) — share it with anyone on the music team.

## Known limitations (v1)
- Data persistence is per-browser (localStorage), not shared across devices yet — fine for one person, worth upgrading if the team needs shared access.
- Chords aren't parsed into a show/hide toggle yet — chord lines currently sit inline in the lyrics text as originally pasted. This is the next planned feature.
