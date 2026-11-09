import { error } from '@sveltejs/kit';

import { findDepartmentPage } from '#lib/site/department-pages/index.js';
import { isDepartmentPageSlug } from '#lib/site/department-pages/slugs.js';
import { findDepartmentCard } from '#lib/site/departments.js';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const slug = params.departamento;
	if (!isDepartmentPageSlug(slug)) error(404, 'Página não encontrada');

	return { slug, conteudo: findDepartmentPage(slug), resumo: findDepartmentCard(slug)?.resumo ?? null };
};
