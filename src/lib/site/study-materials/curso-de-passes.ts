import { downloadable, externalLink, libraryBook, studySection } from './resources.js';
import type { StudyMaterialContent } from './types.js';

const MAGNETIC_CHAIN_LESSONS = [
	['Kardec, Magnetismo e Corrente Magnética', '3,4 MB'],
	['Eurípedes Barsanulfo, Alia a Corrente Magnética à desobsessão', '1,5 MB'],
	['Concordância dos Espíritos em torno da Corrente Magnética', '2,7 MB'],
	['O Magnetismo e o Espiritismo', '2,7 MB'],
	['Ação Magnética', '3,2 MB'],
	['O Pensamento é Uma Força, Ação do Pensamento Coletivo', '3,2 MB'],
	['A Obsessão, Flagelo de Todos os Tempos', '3,8 MB'],
	['A aplicação do magnetismo pelos Espíritos inferiores, a obsessão', '3,3 MB'],
	['A Corrente Magnética, Desobsessão Coletiva', '3,1 MB'],
	['Os Médiuns da Corrente e sua atuação magnética', '4,0 MB'],
	['O passe na Corrente Magnética e a ação do médium passista', '3,9 MB'],
	['O paciente e a Corrente, fatores que influenciam a recepção magnética', '3,6 MB'],
	['Rotina de funcionamento da Corrente Magnética', '5,2 MB'],
	['A Corrente Magnética, Base do tratamento espiritual na Casa Espírita', '4,2 MB'],
] as const;

const lessonNumber = (index: number) => String(index + 1).padStart(2, '0');

export const PASS_COURSE_MATERIAL: StudyMaterialContent = {
	titulo: 'O Passe Espírita',
	resumo: 'Esta página disponibiliza o material de estudo necessário para o conhecimento do Passe Espírita.',
	secoes: [
		studySection({
			titulo: 'Material Curso de Passes',
			recursos: [
				downloadable('Guia prático de Cromoterapia', 'guia-pratico-de-cromoterapia', '1,9 MB'),
				libraryBook('Livro: Aconteceu na Casa Espírita'),
				libraryBook('Livro: Terapia pelos passes'),
				downloadable('O Passe Espírita', 'o-passe-espirita', '7,8 MB'),
				downloadable('Saúde Mental À Luz do Evangelho', 'saude-mental-a-luz-do-evangelho', '8,1 MB'),
				externalLink(
					'Sistemas do corpo humano',
					'https://www.todamateria.com.br/sistemas-do-corpo-humano/',
					'Toda Matéria',
				),
			],
		}),
		studySection({
			titulo: 'Material Curso Corrente Magnética',
			recursos: MAGNETIC_CHAIN_LESSONS.map(([tema, tamanho], index) =>
				downloadable(
					`Aula ${lessonNumber(index)} – ${tema}`,
					`corrente-magnetica-aula-${lessonNumber(index)}`,
					tamanho,
				),
			),
		}),
	],
};
