import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { SAMPLE_RUNS, WARMUP_RUNS, type BookMeasurement } from './measure';
import type { captureEnvironment } from './environment';
import { profile } from './profile';
import { format, resolveConfig } from 'prettier';

type Environment = Awaited<ReturnType<typeof captureEnvironment>>;

const ARTIFACT_DIRECTORY = resolve('src/lib/scripts/performance/books');
const REPORT_PATH = resolve('tasks/prd-revitalizacao-livros-biblioteca/performance.md');

function createMeasurementTable(measurements: BookMeasurement[]) {
	const rows = measurements.map(
		({ name, selectivity, rows: count, p50Ms, p95Ms }) =>
			`| ${name} | ${selectivity} | ${count} | ${p50Ms.toFixed(3)} | ${p95Ms.toFixed(3)} |`,
	);
	return ['| Cenário | Seletividade | Linhas | p50 (ms) | p95 (ms) |', '| --- | --- | ---: | ---: | ---: |', ...rows];
}

function createCardinalityList(environment: Environment) {
	return Object.entries(environment.cardinalities).map(([name, value]) => `- ${name}: ${value}`);
}

function createProfileSection(environment: Environment) {
	return [
		'## Perfil anonimizado',
		'',
		`Dump agregado v${profile.version}, derivado de ${profile.source.databaseSizeBytes} bytes da base local. Nomes, títulos, tombos e referências foram substituídos por valores determinísticos.`,
		`A anomalia de ${profile.orphans.bookAuthorsMissingBook} relação autor/livro órfã foi preservada sem copiar conteúdo da origem.`,
		'',
		...createCardinalityList(environment),
	];
}

function createReport(environment: Environment, measurements: BookMeasurement[]) {
	return [
		'# Baseline de performance dos livros',
		'',
		'## Ambiente',
		'',
		`- Captura: ${environment.capturedAt}`,
		`- Revisão de referência: \`${environment.schemaRevision}\``,
		`- PostgreSQL: ${environment.settings.postgresVersion} (${environment.docker.image})`,
		`- Recursos Docker: ${environment.docker.cpus} CPUs, ${environment.docker.memoryBytes} bytes de memória, sem limites explícitos no container.`,
		`- Configuração: shared_buffers=${environment.settings.sharedBuffers}, work_mem=${environment.settings.workMem}, effective_cache_size=${environment.settings.effectiveCacheSize}, max_connections=${environment.settings.maxConnections}.`,
		'',
		...createProfileSection(environment),
		'',
		'## Medição baseline',
		'',
		`Comando: \`npm run performance:books\`. Cada cenário executou ${WARMUP_RUNS} aquecimentos e ${SAMPLE_RUNS} amostras sequenciais; o EXPLAIN foi capturado separadamente.`,
		'',
		...createMeasurementTable(measurements),
		'',
		'As consultas parametrizadas e seus parâmetros estão em `baseline-results.json`; os planos completos de `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` estão em `baseline-plans.json`.',
		'',
		'## Decisão estrutural',
		'',
		'Nenhum índice ou view foi criado ou adotado na baseline. A decisão final será tomada na tarefa 6.0 após medir a consulta revitalizada no mesmo ambiente e perfil.',
		'',
	].join('\n');
}

async function formatJson(value: unknown) {
	const options = (await resolveConfig(resolve('package.json'))) ?? {};
	return format(JSON.stringify(value), { ...options, parser: 'json' });
}

function omitPlan(measurement: BookMeasurement) {
	return {
		name: measurement.name,
		selectivity: measurement.selectivity,
		expectedRows: measurement.expectedRows,
		rows: measurement.rows,
		query: measurement.query,
		p50Ms: measurement.p50Ms,
		p95Ms: measurement.p95Ms,
		minMs: measurement.minMs,
		maxMs: measurement.maxMs,
	};
}

async function writeMeasurementArtifacts(
	environment: Environment,
	measurements: BookMeasurement[],
	prefix: 'baseline' | 'post',
) {
	const results = measurements.map(omitPlan);
	const plans = Object.fromEntries(measurements.map(({ name, plan }) => [name, plan]));
	const [formattedResults, formattedPlans] = await Promise.all([
		formatJson({ environment, results }),
		formatJson(plans),
	]);
	await mkdir(dirname(REPORT_PATH), { recursive: true });
	await Promise.all([
		writeFile(resolve(ARTIFACT_DIRECTORY, `${prefix}-results.json`), formattedResults),
		writeFile(resolve(ARTIFACT_DIRECTORY, `${prefix}-plans.json`), formattedPlans),
	]);
}

export async function writeBaselineArtifacts(environment: Environment, measurements: BookMeasurement[]) {
	await writeMeasurementArtifacts(environment, measurements, 'baseline');
	await writeFile(REPORT_PATH, createReport(environment, measurements));
}

export async function writePostArtifacts(environment: Environment, measurements: BookMeasurement[]) {
	await writeMeasurementArtifacts(environment, measurements, 'post');
}
