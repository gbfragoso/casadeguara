import type { DrawnIconName, DrawnIconTone } from './drawn-icons.js';

export type RecantoStage = {
	etapa: string;
	icone: DrawnIconName;
	tom: DrawnIconTone;
	titulo: string;
	descricao: string;
};

export const RECANTO_LOGO_ALT = 'Recanto de Potira, Núcleo de Promoção Social para Gestantes';

export const RECANTO_STAGES: readonly RecantoStage[] = [
	{
		etapa: 'A partir do 3º mês',
		icone: 'acompanhamento',
		tom: 'sky',
		titulo: 'Acompanhamento',
		descricao:
			'A partir do 3º mês de gestação, cada gestante é entrevistada, visitada em casa e acompanhada no pré-natal por uma equipe multidisciplinar.',
	},
	{
		etapa: 'Se atender aos critérios do programa',
		icone: 'feira',
		tom: 'gold',
		titulo: 'Feira mensal',
		descricao: 'Feira montada por nutricionista para atender a família até o fim do aleitamento.',
	},
	{
		etapa: 'Todos os meses',
		icone: 'oficinas',
		tom: 'sky',
		titulo: 'Oficinas',
		descricao:
			'Encontros mensais sobre aleitamento materno, dentição saudável, higiene do bebê e fisioterapia pré e pós-parto.',
	},
	{
		etapa: 'No mês do parto',
		icone: 'enxoval',
		tom: 'gold',
		titulo: 'Enxoval',
		descricao:
			'No mês do parto a gestante ganha um enxoval completo, bordado e pintado à mão por voluntárias, e roupas higienizadas para toda a família.',
	},
];
