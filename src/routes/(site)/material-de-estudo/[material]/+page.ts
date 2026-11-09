import { error } from '@sveltejs/kit';

import { findStudyMaterial } from '#lib/site/study-materials/index.js';
import { isStudyMaterialSlug } from '#lib/site/study-materials/slugs.js';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const slug = params.material;
	if (!isStudyMaterialSlug(slug)) error(404, 'Página não encontrada');

	return { conteudo: findStudyMaterial(slug) };
};
