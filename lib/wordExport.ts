import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { Song } from "./types";

function dateHeading(): string {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function exportToWord(songs: Song[], sheetTitle?: string) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: sheetTitle?.trim() || "Sunday Sheet",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: dateHeading(), italics: true, color: "555555" })],
      spacing: { after: 400 },
    })
  );

  songs.forEach((song, idx) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "7A2035" },
        },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, color: "7A2035" }),
          new TextRun({ text: song.title, bold: true }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: song.section, italics: true, size: 18, color: "888888" }),
        ],
      })
    );

    song.text.split("\n").forEach((line) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line || " " })],
          spacing: { after: 40 },
        })
      );
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(sheetTitle?.trim() || "sunday-sheet").replace(/\s+/g, "-").toLowerCase()}.docx`;
  saveAs(blob, filename);
}
