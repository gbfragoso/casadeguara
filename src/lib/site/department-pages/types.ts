import type { CoordinationKey } from '../board.js';
import type { PhotoGallery, SitePhoto } from '../photos.js';

export type ScheduleEntry = { rotulo: string; horario: string };

export type DepartmentTopic = { titulo: string; itens: readonly string[] };

export type DepartmentQuote = { texto: string; fonte: string };

export type DepartmentPageContent = {
	titulo: string;
	capa: SitePhoto;
	paragrafos: readonly string[];
	topicos: readonly DepartmentTopic[];
	agenda: { titulo: string; entradas: readonly ScheduleEntry[] };
	coordenacao: readonly CoordinationKey[];
	galerias: readonly PhotoGallery[];
	citacao: DepartmentQuote | null;
};
