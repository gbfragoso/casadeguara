export const ART_PALETTE = {
	fundo: '#f0f8fe',
	forma: '#ddf0fe',
	pontos: '#bae0fe',
	cartao: '#ffffff',
	selo: '#ffffff',
	faixa: '#015886',
	destaque: '#ffb70f',
	destaqueClaro: '#ffd166',
	rotulo: '#8a6000',
	textoForte: '#012e4a',
	texto: '#014469',
	textoSuave: '#015886',
	textoClaro: '#ffffff',
} as const;

export type ArtColor = keyof typeof ART_PALETTE;
