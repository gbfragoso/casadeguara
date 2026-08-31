import type { TestDatabase } from './cadastros-database';

const TEST_USERNAME = 'e2e-biblioteca';
const FIXTURE_SUFFIXES = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis'];

export const createNoticeText = (token: string, suffix: string) => `Aviso E2E ${token} ${suffix}`;

export type NoticeFixture = { id: number; text: string };

export const createNoticeFixture = async (database: TestDatabase, token: string): Promise<NoticeFixture> => {
	const text = createNoticeText(token, 'fixture');
	const [notice] = await database<{ id: number }[]>`
		insert into aviso (texto, username) values (${text}, ${TEST_USERNAME}) returning idaviso as id
	`;
	if (!notice) throw new Error('Aviso de teste nÃ£o foi criado.');
	return { id: notice.id, text };
};

export const createNoticeFixtures = async (database: TestDatabase, token: string) => {
	const texts = FIXTURE_SUFFIXES.map((suffix) => createNoticeText(token, suffix));

	for (const text of texts) {
		await database`insert into aviso (texto, username) values (${text}, ${TEST_USERNAME})`;
	}

	return texts.toReversed().slice(0, 5);
};

export const countNotices = async (database: TestDatabase, text: string) => {
	const [{ count }] = await database<
		{ count: number }[]
	>`select count(*)::int as count from aviso where texto = ${text}`;

	return count;
};

export const deleteNotices = (database: TestDatabase, token: string) =>
	database`delete from aviso where texto like ${`Aviso E2E ${token}%`}`;
