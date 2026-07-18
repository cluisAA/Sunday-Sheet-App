"use client";

import { useState } from "react";
import { Song, SECTIONS } from "@/lib/types";

type Props = {
  initial?: Song | null;
  onSave: (song: Omit<Song, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

const STRUCTURE_LABELS = ["Intro", "Verse 1", "Chorus", "Verse 2", "Bridge", "Verse 3", "Outro"];

export default function SongEditor({ initial, onSave, onCancel, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [section, setSection] = useState(initial?.section ?? "Entrance");
  const [mode, setMode] = useState<"block" | "structured">("block");
  const [blockText, setBlockText] = useState(initial?.text ?? "");
  const [structured, setStructured] = useState<Record<string, string>>({});
  const [customTag, setCustomTag] = useState("");

  const canSave = title.trim().length > 0 && (mode === "block" ? blockText.trim().length > 0 : true);

  function handleSave() {
    const text =
      mode === "block"
        ? blockText.trim()
        : STRUCTURE_LABELS.filter((l) => structured[l]?.trim())
            .map((l) => `[${l}]\n${structured[l].trim()}`)
            .join("\n\n");

    onSave({
      title: title.trim(),
      section,
      text,
      tags: [section, ...(customTag.trim() ? [customTag.trim()] : [])],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-3 sm:p-6 overflow-y-auto no-print">
      <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--line-strong)] rounded-md shadow-xl my-6">
        <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[var(--wine)]">
            {initial ? "Edit song" : "Add a song"}
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] text-sm"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Here I Am, Lord"
              className="w-full rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wine)]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1">
                Extra tag (optional)
              </label>
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="e.g. Advent"
                className="w-full rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                Lyrics
              </label>
              <div className="flex text-xs rounded border border-[var(--line-strong)] overflow-hidden">
                <button
                  onClick={() => setMode("block")}
                  className={`px-2.5 py-1 ${mode === "block" ? "bg-[var(--wine)] text-white" : "bg-white text-[var(--ink-soft)]"}`}
                >
                  Paste as one block
                </button>
                <button
                  onClick={() => setMode("structured")}
                  className={`px-2.5 py-1 border-l border-[var(--line-strong)] ${mode === "structured" ? "bg-[var(--wine)] text-white" : "bg-white text-[var(--ink-soft)]"}`}
                >
                  Verse / chorus
                </button>
              </div>
            </div>

            {mode === "block" ? (
              <textarea
                value={blockText}
                onChange={(e) => setBlockText(e.target.value)}
                rows={10}
                placeholder="Paste the lyrics (and chords, if you have them) straight from wherever you found the song."
                className="w-full rounded border border-[var(--line-strong)] bg-white px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--wine)]"
              />
            ) : (
              <div className="space-y-2">
                {STRUCTURE_LABELS.map((label) => (
                  <div key={label}>
                    <div className="text-xs text-[var(--ink-soft)] mb-0.5">{label}</div>
                    <textarea
                      value={structured[label] ?? ""}
                      onChange={(e) =>
                        setStructured((s) => ({ ...s, [label]: e.target.value }))
                      }
                      rows={2}
                      className="w-full rounded border border-[var(--line)] bg-white px-2.5 py-1.5 text-sm font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[var(--line)] flex items-center justify-between">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="text-sm text-[var(--wine-dark)] hover:underline"
            >
              Delete song
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded border border-[var(--line-strong)] text-[var(--ink-soft)] hover:bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 text-sm rounded bg-[var(--wine)] text-white disabled:opacity-40 hover:bg-[var(--wine-dark)]"
            >
              Save to index
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
