import type { Sql } from 'postgres';

import { buildMonthlyTotalsQuery } from '$lib/server/tesouraria/lancamentos/monthly-totals';
import { getBahiaMonthWindow } from '$lib/server/tesouraria/lancamentos/month-window';
import type { LancamentoDatabase } from '$lib/server/tesouraria/lancamentos/types';
import { treasuryMonthlyProfile } from './profile';

export const MONTHLY_WARMUP_RUNS = 20;
export const MONTHLY_SAMPLE_RUNS = 100;
export const MONTHLY_STATEMENT_TIMEOUT_MS = 5_000;

type QueryParameter = string | number | boolean | null;

type CompiledQuery = { sql: string; params: QueryParameter[] };

function parseParameters(parameters: unknown[]): QueryParameter[] {
	return parameters.map((value) => {
		if (value === null) return value;
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
		if (value instanceof Date) return value.toISOString().slice(0, 10);
		throw new Error('Monthly totals emitted an unsupported query parameter.');
	});
}

function compileMonthlyQuery(database: LancamentoDatabase): CompiledQuery {
	const window = getBahiaMonthWindow(new Date(treasuryMonthlyProfile.reference));
	const compiled = buildMonthlyTotalsQuery(database, window).toSQL();
	return { sql: compiled.sql, params: parseParameters(compiled.params) };
}

async function executeQuery(client: Sql, query: CompiledQuery) {
	return client.unsafe(query.sql, query.params);
}

async function capturePlan(client: Sql, query: CompiledQuery) {
	const [row] = await client.unsafe(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}`, query.params);
	if (!row || !('QUERY PLAN' in row)) throw new Error('PostgreSQL did not return an execution plan.');
	return row['QUERY PLAN'];
}

function percentile(samples: number[], ratio: number) {
	const ordered = [...samples].sort((left, right) => left - right);
	return ordered[Math.ceil(ordered.length * ratio) - 1];
}

export async function measureTreasuryMonthlyQuery(database: LancamentoDatabase, client: Sql) {
	const query = compileMonthlyQuery(database);
	for (let index = 0; index < MONTHLY_WARMUP_RUNS; index += 1) await executeQuery(client, query);
	const samples: number[] = [];
	for (let index = 0; index < MONTHLY_SAMPLE_RUNS; index += 1) {
		const startedAt = performance.now();
		await executeQuery(client, query);
		samples.push(performance.now() - startedAt);
	}
	return {
		query,
		p50Ms: percentile(samples, 0.5),
		p95Ms: percentile(samples, 0.95),
		minMs: Math.min(...samples),
		maxMs: Math.max(...samples),
		plan: await capturePlan(client, query),
	};
}
