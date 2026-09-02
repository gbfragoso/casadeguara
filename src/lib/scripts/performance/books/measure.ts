import type { BookPerformanceScenario } from './scenarios';
import { buildBookSearchQuery, type LegacyBookSearchInput } from '$lib/server/models/livro-search';
import type { LivroSearchInput } from '$lib/validation/livro';
import type { db } from '$lib/server/database/connection';
import type { Sql } from 'postgres';

export const WARMUP_RUNS = 20;
export const SAMPLE_RUNS = 100;
export const STATEMENT_TIMEOUT_MS = 5_000;

type QueryParameter = string | number | boolean | null;
type CompiledQuery = { sql: string; params: QueryParameter[] };

function parseParameters(parameters: unknown[]): QueryParameter[] {
	return parameters.map((value) => {
		if (value === null) return value;
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
		throw new Error('Book search emitted an unsupported query parameter.');
	});
}

function compileQuery(database: typeof db, scenario: BookPerformanceScenario): CompiledQuery {
	const compiled = isFinalInput(scenario.input)
		? compileFinalInput(database, scenario.input)
		: compileLegacyInput(database, scenario.input);
	return { sql: compiled.sql, params: parseParameters(compiled.params) };
}

function isFinalInput(input: LegacyBookSearchInput | LivroSearchInput): input is LivroSearchInput {
	return 'colecaoId' in input;
}

function compileFinalInput(database: typeof db, input: LivroSearchInput) {
	return buildBookSearchQuery(database, input).toSQL();
}

function compileLegacyInput(database: typeof db, input: LegacyBookSearchInput) {
	return buildBookSearchQuery(database, input).toSQL();
}

async function executeQuery(client: Sql, query: CompiledQuery) {
	const rows = await client.unsafe(query.sql, query.params);
	return rows.length;
}

async function capturePlan(client: Sql, query: CompiledQuery) {
	const rows = await client.unsafe(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}`, query.params);
	const [row] = rows;
	if (!row || !('QUERY PLAN' in row)) throw new Error('PostgreSQL did not return an execution plan.');
	return row['QUERY PLAN'];
}

function percentile(samples: number[], ratio: number) {
	const ordered = [...samples].sort((left, right) => left - right);
	return ordered[Math.ceil(ordered.length * ratio) - 1];
}

async function collectSamples(client: Sql, query: CompiledQuery) {
	const samples: number[] = [];
	for (let index = 0; index < SAMPLE_RUNS; index += 1) {
		const startedAt = performance.now();
		await executeQuery(client, query);
		samples.push(performance.now() - startedAt);
	}
	return samples;
}

export async function measureScenario(database: typeof db, client: Sql, scenario: BookPerformanceScenario) {
	const query = compileQuery(database, scenario);
	let rows = 0;
	for (let index = 0; index < WARMUP_RUNS; index += 1) rows = await executeQuery(client, query);
	const samples = await collectSamples(client, query);
	return {
		name: scenario.name,
		selectivity: scenario.selectivity,
		expectedRows: scenario.expectedRows,
		rows,
		query,
		p50Ms: percentile(samples, 0.5),
		p95Ms: percentile(samples, 0.95),
		minMs: Math.min(...samples),
		maxMs: Math.max(...samples),
		plan: await capturePlan(client, query),
	};
}

export type BookMeasurement = Awaited<ReturnType<typeof measureScenario>>;
