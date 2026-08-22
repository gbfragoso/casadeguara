import { sql } from './cadastros-database';

const TEST_USERNAME = 'e2e-biblioteca';
const FIXTURE_SUFFIXES = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis'];

export const createNoticeText = (token: string, suffix: string) => `Aviso E2E ${token} ${suffix}`;

export const createNoticeFixtures = async (token: string) => {
	const texts = FIXTURE_SUFFIXES.map((suffix) => createNoticeText(token, suffix));

	for (const text of texts) {
		await sql`insert into aviso (texto, username) values (${text}, ${TEST_USERNAME})`;
	}

	return texts.toReversed().slice(0, 5);
};

export const countNotices = async (text: string) => {
	const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from aviso where texto = ${text}`;

	return count;
};

export const deleteNotices = (token: string) => sql`delete from aviso where texto like ${`Aviso E2E ${token}%`}`;
