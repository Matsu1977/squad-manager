export const PLAYER_ROLES = [
  "Portiere",
  "Difensore",
  "Centrocampista",
  "Attaccante",
  "Allenatore",
] as const;
export type PlayerRole = (typeof PLAYER_ROLES)[number];

export const PLAYER_STATUSES = [
  "Ativo",
  "Infortunato",
  "Sospeso",
  "Inattivo",
] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const ROLE_COLORS: Record<PlayerRole, string> = {
  Portiere: "bg-yellow-500",
  Difensore: "bg-blue-500",
  Centrocampista: "bg-green-500",
  Attaccante: "bg-red-500",
  Allenatore: "bg-purple-500",
};

export const ROLE_TEXT_COLORS: Record<PlayerRole, string> = {
  Portiere: "text-yellow-700",
  Difensore: "text-blue-700",
  Centrocampista: "text-green-700",
  Attaccante: "text-red-700",
  Allenatore: "text-purple-700",
};

export const STATUS_COLORS: Record<PlayerStatus, string> = {
  Ativo: "bg-green-500",
  Infortunato: "bg-red-500",
  Sospeso: "bg-yellow-500",
  Inattivo: "bg-gray-500",
};

export const STATUS_VARIANTS: Record<
  PlayerStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Ativo: "default",
  Infortunato: "destructive",
  Sospeso: "secondary",
  Inattivo: "outline",
};

export const FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "3-5-2",
  "4-2-3-1",
  "4-5-1",
  "3-4-3",
  "5-3-2",
] as const;
export type Formation = (typeof FORMATIONS)[number];

export const PREFERRED_FEET = ["Destro", "Sinistro", "Ambidestro"] as const;
export type PreferredFoot = (typeof PREFERRED_FEET)[number];

export const COMPETITIONS = [
  "Campionato",
  "Coppa",
  "Amichevole",
  "Torneo",
] as const;
export type Competition = (typeof COMPETITIONS)[number];

/** Stagione calcistica (luglio-giugno) a partire da una data ISO. */
export function seasonFromDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  return d.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export const RATING_FIELDS = [
  { key: "rating_pace", label: "Velocità" },
  { key: "rating_shooting", label: "Tiro" },
  { key: "rating_passing", label: "Passaggio" },
  { key: "rating_dribbling", label: "Dribbling" },
  { key: "rating_defending", label: "Difesa" },
  { key: "rating_physical", label: "Fisico" },
] as const;
export type RatingKey = (typeof RATING_FIELDS)[number]["key"];

export const SKILL_STATUSES = [
  "Da migliorare",
  "In corso",
  "Raggiunto",
] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export const SKILL_STATUS_VARIANTS: Record<
  SkillStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Da migliorare": "destructive",
  "In corso": "secondary",
  Raggiunto: "default",
};

export const SKILL_CATEGORIES = [
  "Tecnica",
  "Atletica",
  "Tattica",
  "Mentale",
  "Portiere",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

/** Abilità suggerite, raggruppate per categoria. */
export const SKILL_SUGGESTIONS: Record<SkillCategory, string[]> = {
  Tecnica: [
    "Piede destro",
    "Piede sinistro",
    "Colpo di testa",
    "Controllo palla",
    "Dribbling",
    "Passaggio corto",
    "Passaggio lungo",
    "Cross",
    "Tiro da fuori",
    "Calci piazzati",
    "Rigori",
  ],
  Atletica: [
    "Scatto",
    "Velocità",
    "Resistenza",
    "Forza",
    "Elevazione",
    "Agilità",
    "Recupero",
  ],
  Tattica: [
    "Visione di gioco",
    "Posizionamento",
    "Marcatura",
    "Pressing",
    "Inserimenti",
    "Copertura difensiva",
    "Gioco senza palla",
  ],
  Mentale: [
    "Concentrazione",
    "Leadership",
    "Disciplina",
    "Gestione pressione",
    "Comunicazione",
  ],
  Portiere: [
    "Riflessi",
    "Uscite alte",
    "Presa",
    "Gioco coi piedi",
    "Parate sui rigori",
  ],
};
