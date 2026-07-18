import { Song } from "./types";

const OVERRIDES_KEY = "songbook:overrides:v1";
const SELECTION_KEY = "songbook:selection:v1";

type Overrides = {
  added: Song[];
  edited: Record<number, Song>;
  deletedIds: number[];
  nextId: number;
};

function emptyOverrides(): Overrides {
  return { added: [], edited: {}, deletedIds: [], nextId: 1000000 };
}

export function loadOverrides(): Overrides {
  if (typeof window === "undefined") return emptyOverrides();
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw);
    return { ...emptyOverrides(), ...parsed };
  } catch {
    return emptyOverrides();
  }
}

function saveOverrides(o: Overrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));
}

export function mergeSongs(base: Song[]): Song[] {
  const o = loadOverrides();
  const deleted = new Set(o.deletedIds);
  const merged = base
    .filter((s) => !deleted.has(s.id))
    .map((s) => o.edited[s.id] ?? s);
  return [...merged, ...o.added];
}

export function addSong(song: Omit<Song, "id">): Song {
  const o = loadOverrides();
  const newSong: Song = { ...song, id: o.nextId };
  o.added.push(newSong);
  o.nextId += 1;
  saveOverrides(o);
  return newSong;
}

export function updateSong(song: Song, isBaseSong: boolean) {
  const o = loadOverrides();
  if (isBaseSong) {
    o.edited[song.id] = song;
  } else {
    const idx = o.added.findIndex((s) => s.id === song.id);
    if (idx >= 0) o.added[idx] = song;
  }
  saveOverrides(o);
}

export function deleteSong(id: number, isBaseSong: boolean) {
  const o = loadOverrides();
  if (isBaseSong) {
    if (!o.deletedIds.includes(id)) o.deletedIds.push(id);
    delete o.edited[id];
  } else {
    o.added = o.added.filter((s) => s.id !== id);
  }
  saveOverrides(o);
}

export function resetOverrides() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(OVERRIDES_KEY);
}

// -- selection persistence (so a half-built Sunday sheet survives a refresh) --

export function loadSelection(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSelection(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTION_KEY, JSON.stringify(ids));
}
