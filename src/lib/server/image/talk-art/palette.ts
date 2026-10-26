export const ART_PALETTE = {
	fundo: '#014469',
	fundoProfundo: '#012e4a',
	forma: '#006ca5',
	destaque: '#ffb70f',
	texto: '#ffffff',
	textoSobreDestaque: '#012e4a',
	selo: '#ffffff',
} as const;

export type ArtColor = keyof typeof ART_PALETTE;
