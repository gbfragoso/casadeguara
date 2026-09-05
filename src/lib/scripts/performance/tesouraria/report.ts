import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';

import type { BundleMeasurement } from './bundle';
import type { LongTaskSample } from './longtasks';

const OUTPUT_DIRECTORY = resolve('src/lib/scripts/performance/tesouraria');
const VERIFICATION_PATH = resolve('tasks/prd-grafico-lancamentos-tesouraria/verification.md');

export type BaselineEnvironment = {
	capturedAt: string;
	node: string;
	revision: string;
	npm: string;
	playwright: string;
	chromium: string;
};

export type BaselineReport = {
	environment: BaselineEnvironment;
	bundle: BundleMeasurement;
	longTasks: LongTaskSample[];
};

function createVerification(report: BaselineReport) {
	const maxLongTask = Math.max(...report.longTasks.map(({ maxMs }) => maxMs), 0);
	return [
		'# Verificação — gráfico de lançamentos da Tesouraria',
		'',
		'## Baseline anterior à biblioteca',
		'',
		`- Captura: ${report.environment.capturedAt}`,
		`- Revisão: \`${report.environment.revision}\``,
		`- Node.js: ${report.environment.node}`,
		`- npm: ${report.environment.npm}`,
		`- Playwright: ${report.environment.playwright}`,
		`- Chromium: ${report.environment.chromium}`,
		`- Rota: \`${report.bundle.route}\` (nós ${report.bundle.routeNodeIds.join(', ')})`,
		`- Fechamento transitivo: ${report.bundle.files.length} arquivos, ${report.bundle.rawBytes} bytes brutos, ${report.bundle.gzipBytes} bytes gzip (nível 9).`,
		`- Tarefas longas: ${report.longTasks.length} amostras frias; máximo observado ${maxLongTask.toFixed(3)} ms (CPU 4×).`,
		'',
		'Os valores detalhados estão em `baseline-bundle.json` e `baseline-longtasks.json`. A captura usou viewport 375 × 667, escala 2, toque habilitado e observador instalado antes da navegação. Esta medição é a referência para a comparação pós-integração; não representa um critério de aprovação isolado.',
		'',
	].join('\n');
}

async function formatJson(value: unknown) {
	const options = (await resolveConfig(resolve('package.json'))) ?? {};
	return format(JSON.stringify(value), { ...options, parser: 'json' });
}

export async function writeBaselineReport(report: BaselineReport) {
	await mkdir(dirname(VERIFICATION_PATH), { recursive: true });
	await Promise.all([
		writeFile(resolve(OUTPUT_DIRECTORY, 'baseline-bundle.json'), await formatJson(report.bundle)),
		writeFile(resolve(OUTPUT_DIRECTORY, 'baseline-longtasks.json'), await formatJson(report.longTasks)),
		writeFile(VERIFICATION_PATH, createVerification(report)),
	]);
}

export async function writeBundleBaseline(bundle: BundleMeasurement) {
	await mkdir(OUTPUT_DIRECTORY, { recursive: true });
	await writeFile(resolve(OUTPUT_DIRECTORY, 'baseline-bundle.json'), await formatJson(bundle));
}
