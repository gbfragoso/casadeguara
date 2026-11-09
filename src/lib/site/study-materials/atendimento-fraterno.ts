import { externalLink, studyCover, studySection, youtubeVideo } from './resources.js';
import type { StudyMaterialContent } from './types.js';

const QUALIFICATION_VIDEOS = [
	['Introdução', 'sZ5NnqEH0x0'],
	['Mensagem de Manoel Philomeno de Miranda', '1hDxsJikhxU'],
	['Complexidade da tarefa', 'aITGUlbDfsc'],
	['Objetivos – parte I', 'rJA7p946AmY'],
	['Objetivos – parte II', '3sJX0cvBTVI'],
	['Onde tudo começa – recepção e atividade inicial', 'LxpC0K_wUrs'],
	['Receber a pessoa', 'AruwpeMbP8I'],
	['Ouvir – parte I', 'EpqU-1XrK0g'],
	['Ouvir – parte II', 'pVd1tnWp3pU'],
	['Construção do tema – parte I', 'wHJLUJYJmKI'],
	['Construção do tema – parte II', 't6DE5sIx67Y'],
	['Construção do tema – parte III', 'kM2gJiJRNIQ'],
	['Construção do tema – parte IV', 'VOst6JD9Mqc'],
	['Interpretação doutrinária – parte I', 'hD9sgrpBnNo'],
	['Interpretação doutrinária – parte II', 'vSQY4pe49PY'],
	['Interpretação doutrinária – parte III', '6p-8aY2Fah0'],
	['Interpretação doutrinária (obras subsidiárias)', 'faN8fN_l_IM'],
	['Encaminhamentos especializados', 'JDJXNzMBGzQ'],
] as const;

export const FRATERNAL_CARE_MATERIAL: StudyMaterialContent = {
	titulo: 'Atendimento Fraterno',
	resumo: null,
	secoes: [
		studySection({
			titulo: 'Diálogo Fraterno: ética e técnicas',
			capa: studyCover(
				'atendimento-fraterno-livro',
				'Capa do livro Diálogo Fraterno: Ética e Técnica, de Marlon Reikdal, com dedos desenhados como rostos sorridentes sob balões de fala coloridos.',
				1000,
				1026,
			),
			paragrafos: [
				'Projeto de estudo do livro de Marlon Reikdal.',
				'“Como acolher os que buscam no Espiritismo o lenitivo para suas dores, respostas para suas dúvidas?',
				'O atendimento fraterno é a porta de entrada ao Centro Espírita. Realizá-lo de forma adequada requer estudo, reflexão, planejamento. Ética e técnica precisam estar em sintonia para que o consolo e esclarecimento cheguem aos corações aflitos e produzam resultados positivos. Marlon Reikdal compartilha sua experiência nesta área, sempre pautada nas diretrizes da Doutrina Espírita, especialmente na obra de Allan Kardec, Manoel Philomeno de Miranda e Joanna de Ângelis, sob o farol seguro dos ensinamentos do Mestre Jesus. Excelente roteiro para aqueles que se dedicam à tarefa de acolher e ouvir.”',
			],
			recursos: [externalLink('Blog de Marlon Reikdal', 'https://marlonreikdal.blogspot.com/', 'Fonte do texto')],
		}),
		studySection({
			titulo: 'Curso de qualificação para Atendimento Fraterno nas Casas Espíritas',
			paragrafos: [
				'Estudo de casos – etapa do acolhimento, do ouvir, do construir a problemática, das orientações doutrinárias e encaminhamentos – orientações para construção do percurso terapêutico – 18 vídeos.',
			],
			recursos: QUALIFICATION_VIDEOS.map(([rotulo, videoId]) => youtubeVideo(rotulo, videoId)),
			numerada: true,
		}),
		studySection({
			titulo: 'Capacitação para o Atendimento Fraterno',
			recursos: [
				youtubeVideo('Seminário – parte I', 'kKg4ktcUvNE'),
				youtubeVideo('Seminário – parte II', 'C8ELBJTJZW0'),
			],
		}),
	],
};
