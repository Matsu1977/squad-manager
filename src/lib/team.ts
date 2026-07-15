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
