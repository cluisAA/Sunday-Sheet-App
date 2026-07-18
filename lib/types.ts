export type Song = {
  id: number;
  title: string;
  section: string;
  text: string;
  tags: string[];
};

export const SECTIONS = [
  "Mass Parts",
  "Entrance",
  "Offertory",
  "Communion",
  "Recessional",
  "Actions",
  "General / Praise",
] as const;
