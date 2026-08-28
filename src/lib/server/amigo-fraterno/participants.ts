import { unaccent } from '$lib/database/functions';
import { db } from '$lib/database/connection';
import { cadastroFotos, cadastros } from '$lib/database/schema';
import { and, asc, eq } from 'drizzle-orm';

import { participantPdfFields, participantSummaryFields } from './participant-projections';

export class AmigoFraternoParticipants {
	constructor(private readonly database: typeof db) {}

	listSummary() {
		return this.database
			.select(participantSummaryFields)
			.from(cadastros)
			.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
			.where(this.eligibilityFilter())
			.orderBy(asc(unaccent(cadastros.nome)), asc(cadastros.idleitor));
	}

	async listForPdf() {
		const participants = await this.database
			.select(participantPdfFields)
			.from(cadastros)
			.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
			.where(this.eligibilityFilter())
			.orderBy(asc(unaccent(cadastros.nome)), asc(cadastros.idleitor));

		return participants.map(({ photo, ...participant }) => ({
			...participant,
			photo: photo && new Uint8Array(photo),
		}));
	}

	private eligibilityFilter() {
		return and(eq(cadastros.amigoFraterno, true), eq(cadastros.trab, true), eq(cadastros.desencarnado, false));
	}
}

export const amigoFraternoParticipants = new AmigoFraternoParticipants(db);
