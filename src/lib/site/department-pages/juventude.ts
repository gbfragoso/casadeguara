import { createPhotoReader } from '../photos.js';
import type { DepartmentPageContent } from './types.js';

const photo = createPhotoReader(
	import.meta.glob<string>('../images/departamentos/juventude/*.webp', {
		eager: true,
		query: '?url',
		import: 'default',
	}),
);

export const YOUTH_PAGE: DepartmentPageContent = {
	titulo: 'Juventude Espírita Amélia Rodrigues (JEAR)',
	capa: photo('capa', 'Jovens da JEAR cantam acompanhados por um guitarrista no salão da Casa'),
	paragrafos: [],
	topicos: [],
	agenda: {
		titulo: 'Reuniões',
		entradas: [
			{ rotulo: 'Encontro com os jovens', horario: 'Sábados, das 15h às 17h' },
			{ rotulo: 'Planejamento e avaliação', horario: 'Segundas-feiras, às 19h' },
		],
	},
	coordenacao: ['juventude'],
	galerias: [],
	citacao: null,
};
