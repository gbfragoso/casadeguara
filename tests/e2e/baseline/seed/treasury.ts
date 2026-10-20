import type { SeedSql } from './sql';
import type { SeedCalendar } from './calendar';

type DateKey = 'monthStart' | 'previousMonthStart' | 'twoMonthsAgoStart';
type Entry = {
	descricao: string;
	valor: string;
	data: DateKey;
	contraparte: number;
	depositado: boolean;
	uuid: string;
};
type Exit = { descricao: string; valor: string; data: DateKey };

export const RECEIPT_UUID = '00000000-0000-4000-8000-000000000001';
export const REVERSED_RECEIPT_UUID = '00000000-0000-4000-8000-000000000003';
const REVERSAL_REASON = 'Valor lançado em duplicidade.';
const SEED_USER = 'linha-de-base-admin';

const ENTRIES: readonly Entry[] = [
	entry('Contribuição mensal', '150.00', 'monthStart', 0, true, RECEIPT_UUID),
	entry('Doação para a biblioteca', '80.50', 'monthStart', 1, false, '00000000-0000-4000-8000-000000000002'),
	entry('Contribuição avulsa', '45.00', 'monthStart', 2, false, REVERSED_RECEIPT_UUID),
	entry('Contribuição mensal', '120.00', 'previousMonthStart', 0, true, '00000000-0000-4000-8000-000000000004'),
	entry('Contribuição mensal', '95.00', 'twoMonthsAgoStart', 1, true, '00000000-0000-4000-8000-000000000005'),
];
const EXITS: readonly Exit[] = [
	{ descricao: 'Conta de energia', valor: '210.35', data: 'monthStart' },
	{ descricao: 'Material de limpeza', valor: '64.90', data: 'monthStart' },
	{ descricao: 'Conta de água', valor: '180.00', data: 'previousMonthStart' },
];

function entry(
	descricao: string,
	valor: string,
	data: DateKey,
	contraparte: number,
	depositado: boolean,
	uuid: string,
): Entry {
	return { descricao, valor, data, contraparte, depositado, uuid };
}

const insertEntry = (database: SeedSql, value: Entry, contributors: number[], calendar: SeedCalendar) =>
	database<{ idlancamento: number }[]>`
		insert into lancamentos (tipo, descricao, valor, data_lancamento, idcontraparte, depositado, uuid_recibo,
			data_registro, user_cadastro)
		values ('entrada', ${value.descricao}, ${value.valor}, ${calendar[value.data]}, ${contributors[value.contraparte]},
			${value.depositado}, ${value.uuid}, ${calendar[value.data]}, ${SEED_USER})
		returning idlancamento
	`;

const insertExit = (database: SeedSql, value: Exit, calendar: SeedCalendar) =>
	database`
		insert into lancamentos (tipo, descricao, valor, data_lancamento, data_registro, user_cadastro)
		values ('saida', ${value.descricao}, ${value.valor}, ${calendar[value.data]}, ${calendar[value.data]},
			${SEED_USER})
	`;

export const insertTreasury = async (database: SeedSql, contributors: number[], calendar: SeedCalendar) => {
	for (const value of ENTRIES) {
		const [{ idlancamento }] = await insertEntry(database, value, contributors, calendar);
		if (value.uuid !== REVERSED_RECEIPT_UUID) continue;
		await database`
			insert into estornos (idlancamento, motivo, user_estorno, data_estorno)
			values (${idlancamento}, ${REVERSAL_REASON}, ${SEED_USER}, ${calendar.today})
		`;
	}
	for (const value of EXITS) await insertExit(database, value, calendar);
};
