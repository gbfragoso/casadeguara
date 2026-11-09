import { DEPARTMENT_PAGE_SLUGS, type DepartmentPageSlug } from './department-pages/slugs.js';
import { STUDY_MATERIAL_SLUGS, type StudyMaterialSlug } from './study-materials/slugs.js';

export type SitePath =
	| 'a-instituicao'
	| 'diretoria'
	| 'palestras'
	| `departamentos/${DepartmentPageSlug}`
	| `material-de-estudo/${StudyMaterialSlug}`;

export type SiteMenuLink = { kind: 'link'; rotulo: string; path: SitePath };

export type SiteMenuGroup = { kind: 'group'; id: string; rotulo: string; links: readonly SiteMenuLink[] };

export type SiteMenuItem = SiteMenuLink | SiteMenuGroup;

const DEPARTMENT_LABELS: Record<DepartmentPageSlug, string> = {
	biblioteca: 'Biblioteca',
	evangelizacao: 'Evangelização',
	juventude: 'Juventude',
	manjedoura: 'Manjedoura',
	recanto: 'Recanto de Potira',
};

const STUDY_MATERIAL_LABELS: Record<StudyMaterialSlug, string> = {
	'atendimento-fraterno': 'Atendimento Fraterno',
	codificacao: 'Codificação',
	'curso-de-passes': 'Curso de Passes',
	'evangelho-no-lar': 'Evangelho no Lar',
};

const link = (rotulo: string, path: SitePath): SiteMenuLink => ({ kind: 'link', rotulo, path });

const DEPARTMENT_LINKS = DEPARTMENT_PAGE_SLUGS.map((slug) => link(DEPARTMENT_LABELS[slug], `departamentos/${slug}`));

const STUDY_MATERIAL_LINKS = STUDY_MATERIAL_SLUGS.map((slug) =>
	link(STUDY_MATERIAL_LABELS[slug], `material-de-estudo/${slug}`),
);

export const SITE_MENU: readonly SiteMenuItem[] = [
	link('A instituição', 'a-instituicao'),
	link('Diretoria', 'diretoria'),
	{ kind: 'group', id: 'departamentos', rotulo: 'Departamentos', links: DEPARTMENT_LINKS },
	link('Palestras', 'palestras'),
	{ kind: 'group', id: 'material-de-estudo', rotulo: 'Material de Estudo', links: STUDY_MATERIAL_LINKS },
];

const TRAILING_SLASH = /\/$/;

export const isCurrentPage = (menuLink: SiteMenuLink, currentPath: string) =>
	currentPath.replace(TRAILING_SLASH, '') === `/${menuLink.path}`;

export const holdsCurrentPage = (group: SiteMenuGroup, currentPath: string) =>
	group.links.some((menuLink) => isCurrentPage(menuLink, currentPath));
