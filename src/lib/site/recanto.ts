export type RecantoHighlight = { icone: string; titulo: string; descricao: string };

export const RECANTO_LOGO_ALT = 'Recanto de Potira, Núcleo de Promoção Social para Gestantes';

export const RECANTO_HIGHLIGHTS: readonly RecantoHighlight[] = [
	{
		icone: 'fa-stethoscope',
		titulo: 'Acompanhamento',
		descricao:
			'A partir do 3º mês de gestação, cada gestante é entrevistada, visitada em casa e acompanhada no pré-natal por uma equipe multidisciplinar.',
	},
	{
		icone: 'fa-basket-shopping',
		titulo: 'Feira mensal',
		descricao:
			'Feira montada por nutricionista para atender a família da confirmação da gravidez até o fim do aleitamento.',
	},
	{
		icone: 'fa-baby',
		titulo: 'Enxoval',
		descricao:
			'No mês do parto a gestante ganha um enxoval completo, bordado e pintado à mão por voluntárias, e roupas higienizadas para toda a família.',
	},
	{
		icone: 'fa-chalkboard-user',
		titulo: 'Oficinas',
		descricao:
			'Encontros mensais sobre aleitamento materno, dentição saudável, higiene do bebê e fisioterapia pré e pós-parto.',
	},
];
