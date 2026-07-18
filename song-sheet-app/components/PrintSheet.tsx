import { Song } from "@/lib/types";

export default function PrintSheet({
  songs,
  title,
}: {
  songs: Song[];
  title: string;
}) {
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-sheet px-10 py-10 max-w-[720px] mx-auto text-black">
      <h1 className="font-display text-3xl font-bold text-center">{title || "Sunday Sheet"}</h1>
      <p className="text-center italic text-gray-600 mb-8">{date}</p>
      {songs.map((song, idx) => (
        <div key={song.id} className="mb-8 break-inside-avoid">
          <h2 className="font-display text-xl font-semibold border-b-2 border-black/70 pb-1 mb-2">
            {idx + 1}. {song.title}
            <span className="text-sm font-normal italic text-gray-500 ml-2">
              ({song.section})
            </span>
          </h2>
          <div className="whitespace-pre-wrap font-body text-[15px] leading-relaxed">
            {song.text}
          </div>
        </div>
      ))}
    </div>
  );
}
