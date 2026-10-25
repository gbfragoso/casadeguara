import type { withTalkFixtures } from './palestra-test-support';

export const EDITOR_ID = 'editor-integration';

type Fixtures = Parameters<Parameters<typeof withTalkFixtures>[0]>[0];

export const rangeOf = (ids: number[]) => ids.map((id) => ({ id, versao: 1 }));

export const readSlots = ({ readTalk }: Fixtures, ids: number[]) =>
	Promise.all(ids.map(async (id) => readTalk(id).then((talk) => `${talk?.data} ${talk?.horario}`)));

export const createAbcScenario = (year: number) => ({
	today: `${year}-03-01`,
	slots: [`${year}-03-02 08:45:00`, `${year}-03-07 14:30:00`, `${year}-03-09 08:45:00`],
	async insert({ insertTalk, insertSpeaker, token }: Fixtures) {
		const palestranteId = await insertSpeaker(`Carmélia Amorim ${token}`);
		const details = { palestranteId, local: 'Rua Major Dórea, 86', observacoes: 'Livro: Jesus e Atualidade' };
		const a = await insertTalk({ data: `${year}-03-02`, horario: '08:45', titulo: 'A', ...details });
		const b = await insertTalk({ data: `${year}-03-07`, horario: '14:30', titulo: 'B', ...details });
		const c = await insertTalk({ data: `${year}-03-09`, horario: '08:45', titulo: 'C', ...details });
		return { a, b, c, details };
	},
});
