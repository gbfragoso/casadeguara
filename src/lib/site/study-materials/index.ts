import { FRATERNAL_CARE_MATERIAL } from './atendimento-fraterno.js';
import { CODIFICATION_MATERIAL } from './codificacao.js';
import { PASS_COURSE_MATERIAL } from './curso-de-passes.js';
import { HOME_GOSPEL_MATERIAL } from './evangelho-no-lar.js';
import type { StudyMaterialSlug } from './slugs.js';
import type { StudyMaterialContent } from './types.js';

export { STUDY_MATERIAL_SLUGS } from './slugs.js';

const STUDY_MATERIALS: Record<StudyMaterialSlug, StudyMaterialContent> = {
	'atendimento-fraterno': FRATERNAL_CARE_MATERIAL,
	codificacao: CODIFICATION_MATERIAL,
	'curso-de-passes': PASS_COURSE_MATERIAL,
	'evangelho-no-lar': HOME_GOSPEL_MATERIAL,
};

export const findStudyMaterial = (slug: StudyMaterialSlug) => STUDY_MATERIALS[slug];
