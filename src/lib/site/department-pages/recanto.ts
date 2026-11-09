import { RECANTO_COVER, RECANTO_GALLERIES } from './recanto-photos.js';
import type { DepartmentPageContent } from './types.js';

export const RECANTO_PAGE: DepartmentPageContent = {
	titulo: 'Recanto de Potira',
	capa: RECANTO_COVER,
	paragrafos: [
		'O Recanto de Potira faz parte do Núcleo de Promoção Social do Grupo Espírita Casa de Guará.',
		'Sediado na rua do Cajueiro nº 26, bairro Nova Ferradas, Itabuna/BA, tem como objetivo acolher as gestantes do bairro de Nova Ferradas e bairros circunvizinhos.',
		'Este trabalho, iniciado em 2008, mudou a realidade da taxa de mortalidade infantil no bairro, que na época era a mais alta de Itabuna, se tornando hoje um dos bairros de menor taxa.',
		'As gestantes são entrevistadas a partir do 3º mês de gestação e após a entrevista, são visitadas nas suas residências, completando assim o cadastro no programa. Nos meses subsequentes elas são acolhidas por uma equipe multidisciplinar que acompanha o andamento do pré-natal, fazem orientações a respeito dos cuidados com a gestação, com o bebê e o autocuidado, entre outras.',
		'Cada gestante recebe uma feira de alimentos descrita por uma nutricionista, feira que alimenta uma família de até 10 pessoas durante 1 mês, garantindo os nutrientes necessários para o desenvolvimento do feto e da saúde da mãe, até a fase de aleitamento. No mês que antecede o parto, elas recebem enxoval completo confeccionados artesanalmente por nossas voluntárias e um kit de roupas para toda a família. São realizadas oficinas mensais sobre temas que envolve os cuidados na gestação e do recém-nascido.',
		'Projetos futuros já estão sendo desenvolvidos onde poderemos dar atendimento gratuito médico, odontológico, psicológico e jurídico.',
		'Todo nosso trabalho é financiado e realizado por voluntários, que com mãos bondosas, aceitaram caminhar no evangelho de Jesus.',
		'Não recebemos nenhuma ajuda dos Poderes públicos. Nossas atividades são mantidas com recursos de doações das pessoas sensíveis e bondosas e as mensalidades dos trabalhadores da nossa Casa.',
	],
	topicos: [],
	agenda: {
		titulo: 'Agenda',
		entradas: [
			{
				rotulo: 'Entrega de feiras e enxovais em Nova Ferradas',
				horario: 'Primeira sexta-feira do mês, a partir das 13h30',
			},
			{ rotulo: 'Planejamento e avaliação', horario: 'Última sexta-feira do mês, às 16h30' },
		],
	},
	coordenacao: ['recanto', 'recanto-promocao-social', 'recanto-saude-juridica'],
	galerias: RECANTO_GALLERIES,
	citacao: {
		texto: 'Organiza tuas prateleiras de bondade, e serve esperança e coragem aos que te busquem apoio',
		fonte: 'Meimei no livro Amizade, psicografia de Francisco C. Xavier',
	},
};
