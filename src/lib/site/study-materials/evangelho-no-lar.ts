import { downloadable, febBasicWorks, studySection } from './resources.js';
import type { StudyMaterialContent } from './types.js';

export const HOME_GOSPEL_MATERIAL: StudyMaterialContent = {
	titulo: 'Orientações para estudo do Evangelho no Lar',
	resumo: null,
	secoes: [
		studySection({
			paragrafos: [
				'O Evangelho no lar deve ser feito tendo como base o terceiro livro da codificação espírita, o livro Evangelho Segundo o Espiritismo – ESE.',
				'No Evangelho Segundo o Espiritismo está o ensino moral do Cristo, desenvolvido pelos Espíritos de Luz em comunicações mediúnicas recolhidas, organizadas, comentadas e trazidas a público pelo Codificador Allan Kardec.',
				'Para ajudar na compreensão do estudo moral do Cristo, a Benfeitora Joanna de Ângelis nos trouxe, por meio da psicografia do médium Divaldo Pereira Franco, o livro “Jesus e o Evangelho – À Luz da Psicologia Profunda”.',
				'No livro “Jesus e o Evangelho – À Luz da Psicologia Profunda”, Joanna nos traz em cada capítulo, um comentário sobre um capítulo do ESE.',
			],
			recursos: [
				febBasicWorks('O Evangelho Segundo o Espiritismo'),
				downloadable('Roteiro do estudo do Evangelho', 'estudo-do-evangelho', '113 KB'),
			],
		}),
	],
};
