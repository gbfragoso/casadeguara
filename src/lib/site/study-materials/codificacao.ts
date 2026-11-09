import { febBasicWorks, studyCover, studySection } from './resources.js';
import type { StudyMaterialContent } from './types.js';

const FEB_WORK_NOTICE =
	'A FEB – Federação Espírita Brasileira, disponibiliza em seu portal gratuitamente esta obra, podendo ser obtida em:';

export const CODIFICATION_MATERIAL: StudyMaterialContent = {
	titulo: 'Codificação',
	resumo: 'A Codificação Espírita é baseada no pentateuco Kardequiano, formada pelos livros: O Livro dos Espíritos, 1857; O Livro dos Médiuns, 1861; O Evangelho segundo o Espiritismo, 1864; O Céu e o Inferno, 1865; A Gênese, 1868.',
	secoes: [
		studySection({
			titulo: 'Pentateuco',
			capa: studyCover(
				'codificacao-pentateuco',
				'Capas dos cinco livros da Codificação, edição histórica da FEB, com o retrato de Allan Kardec: O Livro dos Espíritos, O Livro dos Médiuns, O Evangelho segundo o Espiritismo, O Céu e o Inferno e A Gênese.',
				1030,
				270,
			),
			paragrafos: [
				'O Livro dos Espíritos – LE, primeiro livro da Codificação, é estruturado em quatro partes e contém 1.019 perguntas formuladas pelo Codificador Allan Kardec. O LE aborda os ensinamentos espíritas, de uma forma lógica e racional, sob os aspectos científico, filosófico e religioso.',
				'O Livro dos Médiuns – LM, segundo livro da Codificação, reúne o ensino especial dos Espíritos sobre a teoria de todos os gêneros de manifestações, os meios de comunicação com o mundo invisível, o desenvolvimento da mediunidade, as dificuldades e os tropeços que se podem encontrar na prática do Espiritismo. O LM é o manual mais seguro para todos que se dedicam às atividades de comunicação com o Mundo Espiritual.',
				'O Evangelho Segundo o Espiritismo – ESE, terceiro livro da Codificação, aborda o aspecto moral da codificação, a moral do Cristo, desenvolvido pelos Espíritos de Luz em comunicações mediúnicas recolhidas, organizadas, comentadas e trazidas a público por Allan Kardec.',
				'O Céu e o Inferno – CI, quarto livro da Codificação, demonstra a imortalidade do Espírito e a condição que ele usufruirá no Mundo Espiritual, como conseqüência de seus próprios atos. Divide-se em duas partes: A primeira, estabelece um exame comparado das doutrinas religiosas sobre a vida após a morte. A segunda parte, resultante de um trabalho prático, reúne exemplos acerca da situação da alma durante e após a desencarnação.',
				'A Gênese, quinto livro da Codificação, divide-se em três partes: Na primeira parte, analisa a origem do planeta Terra, de forma coerente, fugindo às interpretações misteriosas e mágicas sobre a criação do mundo; Em sua segunda parte, aborda a questão dos milagres, explicando a natureza dos fluidos e os fatos extraordinários contidos no Evangelho; Na terceira parte enfoca as predições do Evangelho, os sinais dos tempos e a geração nova, que marcará um novo tempo no Mundo com a prática da justiça, da paz e da fraternidade.',
				'A FEB – Federação Espírita Brasileira, disponibiliza em seu portal gratuitamente a obra da codificação, podendo ser obtida em:',
			],
			recursos: [febBasicWorks('Obras básicas da Codificação')],
		}),
		studySection({
			titulo: 'Obras que complementam a codificação',
			subsecoes: [
				studySection({
					titulo: 'Obras Póstumas',
					capa: studyCover(
						'codificacao-obras-postumas',
						'Capa do livro Obras Póstumas, de Allan Kardec, com o retrato do autor.',
						189,
						270,
					),
					paragrafos: [
						'Após a desencarnação de Allan Kardec, foi publicado o livro Obras Póstumas. A obra apresenta, no começo, bem escrita biografia do Codificador. Reúne importantes registros deixados por Allan Kardec, acerca de pontos doutrinários e fundamentação do Espiritismo dividindo-se em duas grandes partes. A primeira aborda assuntos como: caráter e conseqüências religiosas das manifestações dos Espíritos; as cinco alternativas da Humanidade; questões e problemas; as expiações coletivas; liberdade, igualdade, fraternidade; música espírita; a morte espiritual; a vida futura. A segunda inclui apontamentos em torno da iniciação espírita e o roteiro missionário de Kardec, assim como uma “exposição de motivos”, apresentada na “Constituição do Espiritismo”, como precioso legado do mestre lionês às sociedades espíritas do futuro.',
						FEB_WORK_NOTICE,
					],
					recursos: [febBasicWorks('Obras Póstumas')],
				}),
				studySection({
					titulo: 'O que é o Espiritismo',
					capa: studyCover(
						'codificacao-o-que-e-o-espiritismo',
						'Capa do livro O que é o Espiritismo, de Allan Kardec, com o retrato do autor.',
						199,
						270,
					),
					paragrafos: [
						'Obra sempre atual, útil aos adeptos da Doutrina Espírita, como também àqueles que desejam conhecer a natureza do Espiritismo e a definição de seus pontos fundamentais. A lógica e o bom senso de Allan Kardec aí se evidenciam, desconcertando os negativistas e clareando as indagações dos que acreditam e aspiram à vida superior. Divide-se em 3 capítulos: O primeiro, sob a forma de diálogos com um crítico, um céptico e um padre, traz respostas àqueles que desconhecem os princípios básicos da Doutrina, bem como apropriadas refutações aos seus contraditores. O segundo capítulo, expõe partes da ciência prática e experimental, caracterizando-se como um resumo de O Livro dos Médiuns. No terceiro capítulo, é publicado o resumo de O Livro dos Espíritos, com a solução, apontada pela Doutrina Espírita, de problemas de ordem psicológica, moral e filosófica.',
						FEB_WORK_NOTICE,
					],
					recursos: [febBasicWorks('O que é o Espiritismo')],
				}),
			],
		}),
	],
};
