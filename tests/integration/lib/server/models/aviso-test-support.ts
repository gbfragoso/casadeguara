import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { aviso } from '$lib/database/schema';
import type { Aviso } from '$lib/server/models/aviso';
import { eq } from 'drizzle-orm';

type NoticeFixture = { date: Date | null; suffix: string };

type NoticeTestContext = {
	notices: Aviso[];
	text: (suffix: string) => string;
	track: (notice: Aviso) => void;
};

const TEST_USERNAME = 'integration-test';

export async function withNotices<T>(fixtures: NoticeFixture[], callback: (context: NoticeTestContext) => Promise<T>) {
	const notices: Aviso[] = [];
	const token = randomUUID();
	const text = (suffix: string) => `notice-${token}-${suffix}`;
	const track = (notice: Aviso) => notices.push(notice);

	try {
		for (const fixture of fixtures) {
			const [notice] = await db
				.insert(aviso)
				.values({ dataCadastro: fixture.date, texto: text(fixture.suffix), username: TEST_USERNAME })
				.returning();

			if (!notice) throw new Error('Fixture de aviso não foi criada.');

			track(notice);
		}

		return await callback({ notices, text, track });
	} finally {
		await Promise.all(notices.map(({ idaviso }) => db.delete(aviso).where(eq(aviso.idaviso, idaviso))));
	}
}
