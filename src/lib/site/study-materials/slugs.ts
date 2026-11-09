import { isMemberOf } from '#lib/utils/membership.js';

export const STUDY_MATERIAL_SLUGS = [
	'atendimento-fraterno',
	'codificacao',
	'curso-de-passes',
	'evangelho-no-lar',
] as const;

export type StudyMaterialSlug = (typeof STUDY_MATERIAL_SLUGS)[number];

export const isStudyMaterialSlug = (value: string) => isMemberOf(STUDY_MATERIAL_SLUGS, value);
