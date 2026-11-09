import type { SitePhoto } from '../photos.js';

export type StudyResource =
	| { kind: 'download'; rotulo: string; href: string; tamanho: string }
	| { kind: 'link'; rotulo: string; href: string; origem: string }
	| { kind: 'acervo'; rotulo: string };

export type StudyCover = SitePhoto & { largura: number; altura: number };

export type StudySection = {
	titulo: string | null;
	paragrafos: readonly string[];
	capa: StudyCover | null;
	recursos: readonly StudyResource[];
	numerada: boolean;
	subsecoes: readonly StudySection[];
};

export type StudyMaterialContent = {
	titulo: string;
	resumo: string | null;
	secoes: readonly StudySection[];
};
