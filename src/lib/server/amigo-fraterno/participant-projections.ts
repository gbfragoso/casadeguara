import { cadastroFotos, cadastros } from '$lib/database/schema';
import { sql } from 'drizzle-orm';

export type AmigoFraternoParticipant = {
	id: number;
	name: string;
	hasPhoto: boolean;
};

export type AmigoFraternoPdfParticipant = {
	id: number;
	name: string;
	photo: Uint8Array | null;
};

export const participantSummaryFields = {
	id: cadastros.idleitor,
	name: cadastros.nome,
	hasPhoto: sql<boolean>`${cadastroFotos.cadastroId} is not null`,
};

export const participantPdfFields = {
	id: cadastros.idleitor,
	name: cadastros.nome,
	photo: cadastroFotos.cartao,
};
