import { LIBRARY_PAGE } from './biblioteca.js';
import { CHILDREN_EVANGELIZATION_PAGE } from './evangelizacao.js';
import { YOUTH_PAGE } from './juventude.js';
import { MANGER_PAGE } from './manjedoura.js';
import { RECANTO_PAGE } from './recanto.js';
import type { DepartmentPageSlug } from './slugs.js';
import type { DepartmentPageContent } from './types.js';

export { DEPARTMENT_PAGE_SLUGS } from './slugs.js';

const DEPARTMENT_PAGES: Record<DepartmentPageSlug, DepartmentPageContent> = {
	biblioteca: LIBRARY_PAGE,
	evangelizacao: CHILDREN_EVANGELIZATION_PAGE,
	juventude: YOUTH_PAGE,
	manjedoura: MANGER_PAGE,
	recanto: RECANTO_PAGE,
};

export const findDepartmentPage = (slug: DepartmentPageSlug) => DEPARTMENT_PAGES[slug];
