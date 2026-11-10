import { febBasicWorks, studyCover, studySection } from './resources.js';
import type { StudyMaterialContent } from './types.js';

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
				'O Livro dos Espíritos (1857), primeiro livro da Codificação, organiza-se em quatro partes e reúne 1.019 perguntas formuladas por Allan Kardec, que abordam os ensinamentos espíritas sob os aspectos científico, filosófico e religioso.',
				'O Livro dos Médiuns (1861), segundo livro da Codificação, estuda os fenômenos e a comunicação com os Espíritos: a natureza do Espírito, o perispírito e as manifestações espíritas. Termina com um pequeno vocabulário espírita.',
				'O Evangelho segundo o Espiritismo (1864), terceiro livro da Codificação, relaciona passagens do Evangelho aos ensinamentos dos Espíritos em 28 capítulos, apresenta a moral do Cristo em linguagem acessível e encerra com uma coletânea de preces espíritas.',
				'O Céu e o Inferno (1865), quarto livro da Codificação, examina a justiça divina à luz do Espiritismo: compara as doutrinas religiosas sobre a vida após a morte e reúne exemplos da situação da alma durante e após a desencarnação, como consequência de seus próprios atos.',
				'A Gênese (1868), quinto livro da Codificação, trata da origem da Terra e das explicações sobre a criação, esclarece os chamados milagres de Jesus e interpreta as predições do Evangelho, que convidam à prática da justiça, da paz e da fraternidade.',
			],
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
						'Publicada após a desencarnação de Allan Kardec, a obra começa com a biografia do Codificador e o discurso de Camille Flammarion em seus funerais. Reúne apontamentos doutrinários de Kardec e a “Constituição do Espiritismo”, deixada como legado às sociedades espíritas do futuro.',
					],
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
						'Apresenta os pontos fundamentais da Doutrina Espírita, útil tanto aos adeptos quanto a quem deseja conhecê-la. Em três capítulos, traz diálogos com um crítico, um cético e um padre, um resumo de O Livro dos Médiuns e um resumo de O Livro dos Espíritos.',
					],
				}),
			],
		}),
		studySection({
			titulo: 'Onde ler as obras',
			paragrafos: [
				'A FEB – Federação Espírita Brasileira disponibiliza gratuitamente em seu portal todas as obras de Allan Kardec, inclusive as edições da Revista Espírita.',
			],
			recursos: [febBasicWorks('Obras de Kardec para download')],
		}),
	],
};
