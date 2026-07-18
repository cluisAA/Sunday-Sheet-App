# CLAUDE.md — Sunday Sheet

Read this before making changes. It's the handoff from the chat session that built v1.

## What this is
A song index + running-order builder for a church music ministry. The user ("Clive")
picks ~4 songs each week from a large songbook and used to do it by hand: Ctrl+F through
one giant Word file, copy-paste into a separate sheet. This app replaces that loop:
search → select → reorder → generate a PDF/Word sheet.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- `docx` + `file-saver` npm packages for Word export
- Browser `window.print()` for PDF export (no PDF library dependency — deliberate choice, keep it this way unless there's a real reason to change)
- No backend/database. Data lives in `data/songs.json` (bundled at build) merged with
  `localStorage` overrides for anything the user adds/edits/deletes at runtime.
- Deploy target: Vercel via GitHub, zero-config Next.js detection.

## File map
- `app/page.tsx` — the whole app: index/search/filter, running order, generate actions
- `components/SongEditor.tsx` — add/edit modal (block-paste or verse/chorus structured entry)
- `components/PrintSheet.tsx` — hidden `.print-sheet` div, only visible via print CSS, used by the PDF flow
- `lib/types.ts` — `Song` type, `SECTIONS` list
- `lib/storage.ts` — localStorage merge logic (added/edited/deleted songs + selection persistence)
- `lib/wordExport.ts` — builds the `.docx` via the `docx` package
- `data/songs.json` — 220 songs, auto-parsed from the user's original Word file and deduplicated

## Data quality — known gap
The original Word file had inconsistent formatting (some song titles bold, some
underlined, some plain, chords sometimes on their own line above lyrics). The parser
used formatting heuristics (bold/underline + blank-line-before) to detect song
boundaries. It's a good first pass, not perfect — expect the user to report occasional:
- A title that's actually a lyric line (parser over-triggered)
- Two songs merged into one entry (parser under-triggered, usually in the densely-bold
  section of the original doc)
- A section tag that's wrong — most things after the original doc's last section marker
  got bucketed into "General / Praise" since the source file stopped labelling sections
  partway through

When the user reports one of these, fix it via data in `data/songs.json` directly if they
want it fixed for everyone, or point them to the in-app "Edit" flow if it's a one-off on
their own device.

## Design system (don't drift from this without reason)
Hymnal / order-of-service aesthetic, not generic SaaS. Tokens live in `app/globals.css`:
- Paper/parchment background (`--paper`), deep wine/burgundy accent (`--wine`), brass,
  sage — liturgical palette, not the default cream+terracotta AI look
- Serif display font for headings (`--font-display`, system serif stack — deliberately
  NOT next/font/google, see below), clean sans for UI, mono for tags/counts
- Signature element: the "hymn-tile" — numbered tiles in the running order panel,
  referencing physical hymn number boards in churches

**Fonts are system stacks, not next/font/google.** This was a deliberate fix: the build
sandbox couldn't reach fonts.googleapis.com. It's not clear whether that restriction
applies to the user's own machine or Vercel's build servers. If the user wants the exact
Lora/Public Sans/IBM Plex Mono pairing back, swap the font-family values in
`app/globals.css` and/or reintroduce `next/font/google` in `app/layout.tsx` — try it
locally first (`npm run dev`) before assuming it'll fail.

## Roadmap (agreed with user, not yet built)
Priority order as discussed:
1. **Chords show/hide toggle** — store lyrics in ChordPro format (`[G]word`), render
   with or without chords at print/generate time. Needs a migration pass over
   `data/songs.json` (existing chord lines are currently just plain text inline) plus a
   chord entry UI (click-to-insert or type-inline `[G]`) in `SongEditor.tsx`.
2. Tag songs by liturgical season (Advent, Lent, Easter, Ordinary Time)
3. "Last used" tracking to avoid repeating songs too often
4. Shared/multi-user data (would require a real backend — currently localStorage-only,
   single browser/device)
5. Save a Sunday's selection as a reusable template

## Style/interaction conventions already established
- Section filter is single-select chips, not multi-select — keep it simple
- Reorder is up/down arrow buttons, not drag-and-drop (simpler to build correctly,
   revisit only if the user asks)
- "Generate PDF" = browser print dialog, not a generated-and-downloaded PDF file —
   the user hasn't asked for a dependency-based PDF library and this works fine
