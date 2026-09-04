import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';

import type { captureTreasuryEnvironment } from './monthly-environment';
import type { measureTreasuryMonthlyQuery } from './monthly-measure';
import { MONTHLY_SAMPLE_RUNS, MONTHLY_WARMUP_RUNS } from './monthly-measure';
import { treasuryMonthlyProfile } from './profile';

type Environment = Awaited<ReturnType<typeof captureTreasuryEnvironment>>;
type Measurement = Awaited<ReturnType<typeof measureTreasuryMonthlyQuery>>;

const ARTIFACT_DIRECTORY = resolve('src/lib/scripts/performance/tesouraria');
const VERIFICATION_PATH = resolve('tasks/prd-grafico-lancamentos-tesouraria/verification.md');

async function formatJson(value: unknown) {
	const options = (await resolveConfig(resolve('package.json'))) ?? {};
	return format(JSON.stringify(value), { ...options, parser: 'json' });
}

function createVerification(environment: Environment, measurement: Measurement) {
	return [
		'## TI-04 — Consulta mensal',
		'',
		`- Captura: ${environment.capturedAt}`,
		`- PostgreSQL: ${environment.settings.postgresVersion}`,
		`- Perfil: ${treasuryMonthlyProfile.lancamentos} lançamentos, ${treasuryMonthlyProfile.estornos} estornos, ${treasuryMonthlyProfile.lancamentosNaJanela} linhas na janela.`,
		`- Execução: ${MONTHLY_WARMUP_RUNS} aquecimentos e ${MONTHLY_SAMPLE_RUNS} amostras sequenciais na mesma conexão.`,
		`- Consulta mensal: p50 ${measurement.p50Ms.toFixed(3)} ms; p95 ${measurement.p95Ms.toFixed(3)} ms; mínimo ${measurement.minMs.toFixed(3)} ms; máximo ${measurement.maxMs.toFixed(3)} ms.`,
		'- Decisão de índice: a consulta foi medida com os índices existentes; nenhum índice adicional foi criado.',
		'',
		'Os resultados completos, parâmetros e o plano `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` estão em `monthly-results.json` e `monthly-plan.json`.',
		'',
	].join('\n');
}

async function readPreviousVerification() {
	try {
		return await readFile(VERIFICATION_PATH, 'utf8');
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return '';
		throw error;
	}
}

export async function writeTreasuryMonthlyReport(environment: Environment, measurement: Measurement) {
	await mkdir(dirname(VERIFICATION_PATH), { recursive: true });
	const result = { environment, profile: treasuryMonthlyProfile, measurement: { ...measurement, plan: undefined } };
	const previousVerification = await readPreviousVerification();
	const previousSectionIndex = previousVerification.indexOf('## TI-04');
	const baseline = (
		previousSectionIndex < 0 ? previousVerification : previousVerification.slice(0, previousSectionIndex)
	).trimEnd();
	const verification = `${baseline ? `${baseline}\n\n` : ''}${createVerification(environment, measurement)}`;
	await Promise.all([
		writeFile(resolve(ARTIFACT_DIRECTORY, 'monthly-results.json'), await formatJson(result)),
		writeFile(resolve(ARTIFACT_DIRECTORY, 'monthly-plan.json'), await formatJson(measurement.plan)),
		writeFile(VERIFICATION_PATH, verification),
	]);
}
