import { createPhotoReader } from '../photos.js';
import type { DepartmentPageContent } from './types.js';

const photo = createPhotoReader(
	import.meta.glob<string>('../images/departamentos/manjedoura/*.webp', {
		eager: true,
		query: '?url',
		import: 'default',
	}),
);

export const MANGER_PAGE: DepartmentPageContent = {
	titulo: 'Manjedoura Dr. Bezerra de Menezes',
	capa: photo(
		'capa',
		'Peças de enxoval feitas à mão: fraldas bordadas, casaquinho de tricô, pijama e kits embrulhados em banheiras',
	),
	paragrafos: [
		'A Manjedoura Dr. Adolfo Bezerra de Menezes foi criada no dia 08 de março de 2008, com objetivo de confeccionar e organizar os enxovais para os recém-nascidos, das gestantes assistidas por nossa Instituição.',
		'O primeiro enxoval foi entregue no dia 08 de agosto de 2008 e desde essa data, mensalmente são entregues ao Recanto de Potira os enxovais confeccionados com muito amor e pelas mãos talentosas dos nossos irmãos colaboradores que: costuram, bordam, pintam, tricotam, fazem crochet, são cobertores, roupinhas, sapatos, etc. Tudo confeccionado a mão e na cor solicitada pela mamãe gestante.',
	],
	topicos: [],
	agenda: { titulo: 'Reuniões', entradas: [{ rotulo: 'Sexta-feira', horario: 'Das 14h30 às 17h' }] },
	coordenacao: ['manjedoura'],
	galerias: [],
	citacao: null,
};
