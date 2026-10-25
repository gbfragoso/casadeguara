import { randomUUID } from 'node:crypto';

import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { db } from '#lib/server/database/connection.js';
import { palestrantes, palestras } from '#lib/server/database/schema.js';
import { eq, inArray, like } from 'drizzle-orm';

export const TEST_ACTOR_ID = 'integration-test';

const TOKEN_LENGTH = 8;

type TalkValues = Partial<typeof palestras.$inferInsert> & { data: string; horario: string };

type TalkFixtures = {
	token: string;
	insertTalk: (values: TalkValues) => Promise<number>;
	insertSpeaker: (nome: string) => Promise<number>;
	trackTalk: (id: number) => void;
	readTalk: (id: number) => Promise<typeof palestras.$inferSelect | undefined>;
};

export async function withTalkFixtures<T>(callback: (fixtures: TalkFixtures) => Promise<T>) {
	const token = randomUUID().slice(0, TOKEN_LENGTH);
	const talkIds: number[] = [];
	const trackTalk = (id: number) => talkIds.push(id);

	const insertTalk = async (values: TalkValues) => {
		const [created] = await db
			.insert(palestras)
			.values({ userCadastro: TEST_ACTOR_ID, ...values })
			.returning({ id: palestras.id });
		trackTalk(created.id);
		return created.id;
	};

	const insertSpeaker = async (nome: string) => {
		const [created] = await db
			.insert(palestrantes)
			.values({ nome, nomeBusca: normalizeSearch(nome), userCadastro: TEST_ACTOR_ID })
			.returning({ id: palestrantes.id });
		return created.id;
	};

	const readTalk = async (id: number) => (await db.select().from(palestras).where(eq(palestras.id, id))).at(0);

	try {
		return await callback({ token, insertTalk, insertSpeaker, trackTalk, readTalk });
	} finally {
		if (talkIds.length > 0) await db.delete(palestras).where(inArray(palestras.id, talkIds));
		await db.delete(palestrantes).where(like(palestrantes.nomeBusca, `%${token}%`));
	}
}
