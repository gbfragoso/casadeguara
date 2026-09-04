import { randomUUID } from 'node:crypto';

import type { TestDatabase } from './cadastros-database';
import type { LancamentoSeed } from './lancamentos-fixture';

export type LancamentoSnapshot = {
	id: number;
	tipo: 'entrada' | 'saida';
	descricao: string;
	valor: string;
	depositado: boolean | null;
	uuidRecibo: string | null;
	idcontraparte: number | null;
};

export type ReversalSnapshot = { idlancamento: number; motivo: string; userEstorno: string };

const insertEntry = async (database: TestDatabase, seed: Extract<LancamentoSeed, { tipo: 'entrada' }>) => {
	const [row] = await database<LancamentoSnapshot[]>`
		insert into lancamentos
			(tipo, descricao, valor, data_lancamento, idcontraparte, depositado, uuid_recibo, data_registro, user_cadastro)
		values ('entrada', ${seed.descricao}, ${seed.valor}, ${seed.dataLancamento}, ${seed.contraparteId}, ${seed.depositado}, ${randomUUID()}, current_date, 'e2e-seed')
		returning idlancamento as id, tipo, descricao, valor, depositado, uuid_recibo as "uuidRecibo", idcontraparte
	`;
	if (!row) throw new Error('Entrada E2E não foi criada.');
	return row;
};

const insertExit = async (database: TestDatabase, seed: Extract<LancamentoSeed, { tipo: 'saida' }>) => {
	const [row] = await database<LancamentoSnapshot[]>`
		insert into lancamentos
			(tipo, descricao, valor, data_lancamento, idcontraparte, depositado, uuid_recibo, data_registro, user_cadastro)
		values ('saida', ${seed.descricao}, ${seed.valor}, ${seed.dataLancamento}, ${seed.contraparteId ?? null}, null, null, current_date, 'e2e-seed')
		returning idlancamento as id, tipo, descricao, valor, depositado, uuid_recibo as "uuidRecibo", idcontraparte
	`;
	if (!row) throw new Error('Saída E2E não foi criada.');
	return row;
};

export const insertLancamento = (database: TestDatabase, seed: LancamentoSeed) =>
	seed.tipo === 'entrada' ? insertEntry(database, seed) : insertExit(database, seed);

export const insertLancamentos = (database: TestDatabase, seeds: LancamentoSeed[]) =>
	Promise.all(seeds.map((seed) => insertLancamento(database, seed)));

export const readLancamento = async (database: TestDatabase, id: number) => {
	const [row] = await database<LancamentoSnapshot[]>`
		select idlancamento as id, tipo, descricao, valor, depositado,
			uuid_recibo as "uuidRecibo", idcontraparte
		from lancamentos where idlancamento = ${id}
	`;
	if (!row) throw new Error(`Lançamento E2E não encontrado: ${id}`);
	return row;
};

export const readLancamentoByDescription = async (database: TestDatabase, description: string) => {
	const [row] = await database<LancamentoSnapshot[]>`
		select idlancamento as id, tipo, descricao, valor, depositado,
			uuid_recibo as "uuidRecibo", idcontraparte
		from lancamentos where descricao = ${description}
	`;
	if (!row) throw new Error(`Lançamento E2E não encontrado: ${description}`);
	return row;
};

export const readReversal = async (database: TestDatabase, id: number) => {
	const [row] = await database<ReversalSnapshot[]>`
		select idlancamento, motivo, user_estorno as "userEstorno"
		from estornos where idlancamento = ${id}
	`;
	return row ?? null;
};

export const insertReversals = (database: TestDatabase, ids: number[], reason: string) =>
	database.begin(async (transaction) => {
		for (const id of ids) {
			await transaction`
				insert into estornos (idlancamento, motivo, user_estorno, data_estorno)
				values (${id}, ${reason}, 'e2e-admin', '2026-09-02')
			`;
		}
	});

export const deleteLancamentos = (database: TestDatabase, token: string) =>
	database.begin(async (transaction) => {
		const rows = await transaction<{ id: number }[]>`
			select idlancamento as id from lancamentos where descricao like ${`E2E ${token}%`}
		`;
		const ids = rows.map(({ id }) => id);
		if (ids.length === 0) return;
		await transaction`delete from estornos where idlancamento = any(${ids})`;
		await transaction`delete from lancamentos where idlancamento = any(${ids})`;
	});
