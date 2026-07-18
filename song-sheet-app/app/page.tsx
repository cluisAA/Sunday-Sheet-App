"use client";

import { useEffect, useMemo, useState } from "react";
import baseSongs from "@/data/songs.json";
import { Song, SECTIONS } from "@/lib/types";
import {
  mergeSongs,
  addSong,
  updateSong,
  deleteSong,
  loadSelection,
  saveSelection,
} from "@/lib/storage";
import { exportToWord } from "@/lib/wordExport";
import SongEditor from "@/components/SongEditor";
import PrintSheet from "@/components/PrintSheet";

const BASE_IDS = new Set((baseSongs as Song[]).map((s) => s.id));

export default function Home() {
  const [songs, setSongs] = useState<Song[]>(baseSongs as Song[]);
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<Song | null | "new">(null);
  const [sheetTitle, setSheetTitle] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSongs(mergeSongs(baseSongs as Song[]));
    setSelectedIds(loadSelection());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSelection(selectedIds);
  }, [selectedIds, hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs.filter((s) => {
      const matchesSection = sectionFilter === "All" || s.section === sectionFilter;
      const matchesQuery =
        !q || s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q);
      return matchesSection && matchesQuery;
    });
  }, [songs, query, sectionFilter]);

  const selectedSongs = useMemo(
    () =>
      selectedIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s)),
    [selectedIds, songs]
  );

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function moveSelected(index: number, dir: -1 | 1) {
    setSelectedIds((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeSelected(id: number) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function handleSaveSong(data: Omit<Song, "id">) {
    if (editing && editing !== "new") {
      const updated: Song = { ...data, id: editing.id };
      updateSong(updated, BASE_IDS.has(editing.id));
      setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      const created = addSong(data);
      setSongs((prev) => [...prev, created]);
    }
    setEditing(null);
  }

  function handleDeleteSong() {
    if (editing && editing !== "new") {
      deleteSong(editing.id, BASE_IDS.has(editing.id));
      setSongs((prev) => prev.filter((s) => s.id !== editing.id));
      setSelectedIds((prev) => prev.filter((x) => x !== editing.id));
    }
    setEditing(null);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-[var(--line)] bg-[var(--card)]/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--wine)] leading-none">
              Sunday Sheet
            </h1>
            <p className="text-xs text-[var(--ink-soft)] mt-1 font-mono">
              {songs.length} songs indexed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              placeholder="Sheet title, e.g. 19 July — Ordinary Time"
              className="hidden sm:block w-72 rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </header>

      <main className="no-print max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Index / search panel */}
        <section>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or lyrics…"
              className="flex-1 rounded border border-[var(--line-strong)] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wine)]"
            />
            <button
              onClick={() => setEditing("new")}
              className="whitespace-nowrap px-4 py-2.5 rounded bg-[var(--ink)] text-white text-sm font-medium hover:bg-black"
            >
              + Add song
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {["All", ...SECTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setSectionFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  sectionFilter === s
                    ? "bg-[var(--wine)] text-white border-[var(--wine)]"
                    : "bg-white text-[var(--ink-soft)] border-[var(--line-strong)] hover:border-[var(--wine)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto scroll-thin pr-1">
            {filtered.length === 0 && (
              <p className="text-sm text-[var(--ink-soft)] py-8 text-center">
                No songs match. Try a different search, or add it — takes thirty seconds.
              </p>
            )}
            {filtered.map((song) => {
              const isSelected = selectedIds.includes(song.id);
              return (
                <div
                  key={song.id}
                  className="flex items-center gap-3 bg-[var(--card)] border border-[var(--line)] rounded px-3 py-2.5 hover:border-[var(--line-strong)]"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(song.id)}
                    className="w-4 h-4 accent-[var(--wine)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{song.title}</div>
                    <div className="text-xs text-[var(--ink-soft)] font-mono">
                      {song.section}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(song)}
                    className="text-xs text-[var(--ink-soft)] hover:text-[var(--wine)] shrink-0"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Order of service panel */}
        <aside>
          <div className="sticky top-24 bg-[var(--card)] border border-[var(--line-strong)] rounded-md p-4">
            <h2 className="font-display text-lg font-semibold mb-1">Running order</h2>
            <p className="text-xs text-[var(--ink-soft)] mb-3">
              {selectedSongs.length === 0
                ? "Select songs from the index to build Sunday's sheet."
                : `${selectedSongs.length} song${selectedSongs.length > 1 ? "s" : ""} selected`}
            </p>

            <div className="space-y-2 mb-4">
              {selectedSongs.map((song, idx) => (
                <div
                  key={song.id}
                  className="flex items-center gap-2 bg-white border border-[var(--line)] rounded px-2.5 py-2"
                >
                  <span className="hymn-tile !min-w-[1.8rem] !h-7 !text-sm shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{song.title}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSelected(idx, -1)}
                      disabled={idx === 0}
                      className="w-6 h-6 text-xs rounded hover:bg-[var(--line)] disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSelected(idx, 1)}
                      disabled={idx === selectedSongs.length - 1}
                      className="w-6 h-6 text-xs rounded hover:bg-[var(--line)] disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeSelected(song.id)}
                      className="w-6 h-6 text-xs rounded hover:bg-[var(--wine)] hover:text-white"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <input
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              placeholder="Sheet title"
              className="sm:hidden w-full mb-2 rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm"
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={handlePrint}
                disabled={selectedSongs.length === 0}
                className="w-full px-4 py-2.5 rounded bg-[var(--wine)] text-white text-sm font-medium hover:bg-[var(--wine-dark)] disabled:opacity-40"
              >
                Generate PDF (print)
              </button>
              <button
                onClick={() => exportToWord(selectedSongs, sheetTitle)}
                disabled={selectedSongs.length === 0}
                className="w-full px-4 py-2.5 rounded border border-[var(--ink)] text-[var(--ink)] text-sm font-medium hover:bg-[var(--ink)] hover:text-white disabled:opacity-40"
              >
                Download Word (.docx)
              </button>
            </div>
          </div>
        </aside>
      </main>

      <PrintSheet songs={selectedSongs} title={sheetTitle} />

      {editing !== null && (
        <SongEditor
          initial={editing === "new" ? null : editing}
          onSave={handleSaveSong}
          onCancel={() => setEditing(null)}
          onDelete={editing !== "new" ? handleDeleteSong : undefined}
        />
      )}
    </div>
  );
}
