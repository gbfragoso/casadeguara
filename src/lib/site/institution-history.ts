import type { BoardMember } from './board.js';
import { createPhotoReader, type PhotoGallery } from './photos.js';

const photo = createPhotoReader(
	import.meta.glob<string>('./images/a-instituicao/*.webp', { eager: true, query: '?url', import: 'default' }),
);

const member = (cargo: string, nome: string): BoardMember => ({ cargo, nome });

export const INSTITUTION_HISTORY = {
	origem: [
		'A origem da Instituição remonta aos idos de 1954, quando funcionava, na residência do casal Omar Canna Brasil e Josefa Cleides Costa (Dona Clei), o núcleo familiar espiritualista-umbandista denominado, simplesmente, Casa de Guará.',
		'O grupo cresceu em número e, em virtude do pequeno espaço que a residência da rua Belo Horizonte, 32, no bairro Pontalzinho, proporcionava, houve necessidade da criação de um Centro maior, aberto ao público.',
		'Assim, daquela célula familiar, e com o entusiasmo daqueles irmãos, que doaram todos os pertences e até conseguiram um gabinete dentário, originou-se o Centro Espírita Guaraiêssu, cujo nome homenageava, pelas iniciais, três Entidades que lhes eram vinculadas: o Caboclo Guará, Iemanjá e a Cabocla Suzana.',
		'A nova Instituição iniciou suas atividades em instalações cedidas pelos irmãos Jorge Cardoso e Maria José Farias Cardoso, na avenida Ilhéus, próximo ao Hospital Manoel Novais.',
		'Após curto lapso de existência, quando da mudança da diretoria, os novos componentes, em maior número, modificaram o nome da Instituição para Centro Espírita Fraternidade, como atualmente é conhecido, com orientação Kardecista. O casal pioneiro, então, decidiu afastar-se, retornando, com pequeno grupo de simpatizantes, para sua residência, retomando as reuniões semanais agora com crescente número de frequentadores.',
		'Foi então que, sentindo nova necessidade de ampliação, em 13.05.1966, ainda na rua Belo Horizonte, 32, aquele grupo originário, mantida a orientação Umbandista, se transformou, juridicamente, no GRUPO ESPÍRITA CASA DE GUARÁ, em assembleia geral, com aprovação de seu Estatuto e da criação da comissão de construção da sede própria, presidida pelo irmão Eliés Haun, em terreno que foi adquirido na rua Major Dórea, 86, bairro Castália (sede atual).',
	],
	primeiraDiretoria: {
		introducao:
			'A primeira diretoria foi empossada em 13.05.1966, data que ficou registrada como a da fundação oficial da Entidade, e foi assim constituída:',
		membros: [
			member('Presidente de Honra', 'Omar Canna Brasil'),
			member('Presidente', 'Otávio Alves da Silva'),
			member('Vice-presidente', 'Carlos Eduardo Pitanga da Silva'),
			member('1º Secretário', 'Ary Quadros Teixeira'),
			member('2º Secretário', 'João Batista de Jesus Neto'),
			member('1º Tesoureiro', 'Romildo Sanches de Assis'),
			member('2º Tesoureiro', 'Heitor Pimentel dos Passos'),
			member('1º Bibliotecário', 'Guilherme Belmiro de Mattos'),
			member('Orador', 'Hermenegildo de Souza'),
			member('Presidente da Comissão de Construção', 'Eliés Haun'),
		],
	},
	desfecho:
		'Outros irmãos juntaram-se aos pioneiros trabalhadores, e permanecem fiéis aos atuais postulados espirituais da Casa de Guará que, após a desencarnação da Irmã Josefa Cleides Costa (Dona Clei), tornou pública a nova orientação doutrinária, de fidelidade à Doutrina Espírita, codificada por Allan Kardec, sob orientação do atual Mentor, o Irmão Batuíra, uma transição realizada em perfeita sintonia com a equipe espiritual fundadora, que permanece conosco.',
} as const;

export const HEADQUARTERS_FACADE = photo(
	'sede-01',
	'Fachada azul da sede do Grupo Espírita Casa de Guará, com o nome e uma cruz no alto, na Rua Major Dórea.',
);

export const HEADQUARTERS_GALLERY: PhotoGallery = {
	titulo: 'Sede',
	fotos: [
		photo('sede-02', 'Entrada da sede decorada com flores de papel e a palavra ECRIAR sobre a porta.'),
		photo('sede-03', 'Corredor interno da sede, com plantas e um mural pintado na parede.'),
		photo('sede-04', 'Mural pintado com Jesus acolhendo uma mulher e uma criança entre flores.'),
		photo('sede-05', 'Salão de palestras com fileiras de cadeiras azuis e um corredor central.'),
		photo('sede-06', 'Frente do salão de palestras, com tribuna, instrumentos e quadros na parede.'),
	],
};
