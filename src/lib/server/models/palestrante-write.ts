import type { db } from '#lib/server/database/connection.js';
import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { palestrantes, palestras } from '#lib/server/database/schema.js';
import { count, eq } from 'drizzle-orm';

import { translatePalestranteError } from './palestrante-error';

type SpeakerDatabase = typeof db;
type SpeakerTransaction = Parameters<Parameters<SpeakerDatabase['transaction']>[0]>[0];
type SpeakerWriter = SpeakerDatabase | SpeakerTransaction;

export type SpeakerRemoval = { status: 'removed' | 'missing' } | { status: 'in-use'; palestras: number };

export const createSpeaker = async (writer: SpeakerWriter, nome: string, actorId: string) => {
	const [created] = await writer
		.insert(palestrantes)
		.values({ nome, nomeBusca: normalizeSearch(nome), userCadastro: actorId })
		.returning({ id: palestrantes.id })
		.catch(translatePalestranteError);

	return created;
};

export const renameSpeaker = async (database: SpeakerDatabase, id: number, nome: string, actorId: string) => {
	const renamed = await database
		.update(palestrantes)
		.set({ nome, nomeBusca: normalizeSearch(nome), userAlteracao: actorId, dataAlteracao: new Date() })
		.where(eq(palestrantes.id, id))
		.returning({ id: palestrantes.id })
		.catch(translatePalestranteError);

	return renamed.length > 0;
};

const countSpeakerTalks = async (transaction: SpeakerTransaction, id: number) => {
	const [usage] = await transaction.select({ total: count() }).from(palestras).where(eq(palestras.palestranteId, id));
	return usage.total;
};

export const removeSpeaker = (database: SpeakerDatabase, id: number) =>
	database.transaction(async (transaction): Promise<SpeakerRemoval> => {
		const [speaker] = await transaction
			.select({ id: palestrantes.id })
			.from(palestrantes)
			.where(eq(palestrantes.id, id))
			.for('update');
		if (speaker === undefined) return { status: 'missing' };
		const total = await countSpeakerTalks(transaction, id);
		if (total > 0) return { status: 'in-use', palestras: total };
		await transaction.delete(palestrantes).where(eq(palestrantes.id, id));
		return { status: 'removed' };
	});
