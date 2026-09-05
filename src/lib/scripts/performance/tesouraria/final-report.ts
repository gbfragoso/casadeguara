import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { format, resolveConfig } from 'prettier';

import type { BundleMeasurement } from './bundle';
import type { BaselineEnvironment } from './report';
import type { LongTaskSample } from './longtasks';

const OUTPUT_DIRECTORY = resolve('src/lib/scripts/performance/tesouraria');
const VERIFICATION_PATH = resolve('tasks/prd-grafico-lancamentos-tesouraria/verification.md');
const LONG_TASK_THRESHOLD_MS = 50;

export type LongTaskComparison = {
	index: number;
	baseline: LongTaskSample;
	final: LongTaskSample;
	baselineOverThreshold: number;
	finalOverThreshold: number;
	newOverThreshold: number;
};

export type FinalPerformanceReport = {
	environment: BaselineEnvironment;
	baselineBundle: BundleMeasurement;
	finalBundle: BundleMeasurement;
	chartAutoFiles: string[];
	longTasks: LongTaskComparison[];
};

const countOverThreshold = ({ durations }: LongTaskSample) =>
	durations.filter((duration) => duration > LONG_TASK_THRESHOLD_MS).length;

export const compareLongTaskSamples = (
	baseline: readonly LongTaskSample[],
	finalSamples: readonly LongTaskSample[],
): LongTaskComparison[] =>
	finalSamples.map((finalSample, index) => {
		const baselineSample = baseline[index] ?? { durations: [], maxMs: 0 };
		const baselineOverThreshold = countOverThreshold(baselineSample);
		const finalOverThreshold = countOverThreshold(finalSample);
		return {
			index: index + 1,
			baseline: baselineSample,
			final: finalSample,
			baselineOverThreshold,
			finalOverThreshold,
			newOverThreshold: Math.max(0, finalOverThreshold - baselineOverThreshold),
		};
	});

async function formatJson(value: unknown) {
	const options = (await resolveConfig(resolve('package.json'))) ?? {};
	return format(JSON.stringify(value), { ...options, parser: 'json' });
}

async function readVerification() {
	try {
		return await readFile(VERIFICATION_PATH, 'utf8');
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return '';
		throw error;
	}
}

function withoutSection(content: string, heading: string) {
	const start = content.indexOf(heading);
	if (start < 0) return content.trimEnd();
	const next = content.indexOf('\n## ', start + heading.length);
	return `${content.slice(0, start).trimEnd()}${next < 0 ? '' : `\n\n${content.slice(next).trimStart()}`}`;
}

function createBundleLines(report: FinalPerformanceReport) {
	const delta = report.finalBundle.gzipBytes - report.baselineBundle.gzipBytes;
	return [
		'## E2E-06 — Orçamento do cliente',
		'',
		`- Captura: ${report.environment.capturedAt}`,
		`- Revisão do build final: \`${report.environment.revision}\``,
		`- Node.js: ${report.environment.node}; npm: ${report.environment.npm}; Playwright: ${report.environment.playwright}; Chromium: ${report.environment.chromium}.`,
		`- Fechamento transitivo de \`/(protected)/tesouraria\`: baseline ${report.baselineBundle.gzipBytes} bytes gzip; final ${report.finalBundle.gzipBytes} bytes gzip; delta ${delta} bytes (${delta <= 102400 ? 'aprovado' : 'reprovado'}; limite 102400).`,
		`- Build final: ${report.finalBundle.files.length} arquivos, ${report.finalBundle.rawBytes} bytes brutos; nós ${report.finalBundle.routeNodeIds.join(', ')}.`,
		`- \`chart.js/auto\`: ${report.chartAutoFiles.length === 0 ? 'ausente no fechamento transitivo' : `encontrado em ${report.chartAutoFiles.join(', ')}`}.`,
		'',
	];
}

function createLongTaskLines(comparisons: readonly LongTaskComparison[]) {
	const lines = [
		'- Tarefas longas: cinco contextos frios em viewport 375 × 667, escala 2, toque habilitado e CPU 4×; janela observada até a estabilização do canvas.',
	];
	comparisons.forEach((comparison) => {
		lines.push(
			`- Amostra ${comparison.index}: baseline ${comparison.baseline.durations.join(', ') || 'nenhuma'} ms; final ${comparison.final.durations.join(', ') || 'nenhuma'} ms; novas acima de 50 ms: ${comparison.newOverThreshold}.`,
		);
	});
	lines.push(
		`- Resultado de tarefas longas: ${comparisons.every(({ newOverThreshold }) => newOverThreshold === 0) ? 'aprovado, nenhuma tarefa longa nova acima de 50 ms' : 'reprovado, há tarefas longas novas acima de 50 ms'}.`,
		'',
		'Os resultados brutos estão em `final-performance.json`, `final-bundle.json` e `final-longtasks.json`.',
		'',
	);
	return lines;
}

function createVerification(report: FinalPerformanceReport, previous: string) {
	const base = withoutSection(previous, '## E2E-06');
	return `${base ? `${base}\n\n` : ''}${[...createBundleLines(report), ...createLongTaskLines(report.longTasks)].join('\n')}`;
}

export async function writeFinalPerformanceReport(report: FinalPerformanceReport) {
	await mkdir(dirname(VERIFICATION_PATH), { recursive: true });
	const previous = await readVerification();
	const finalSamples = report.longTasks.map(({ final }) => final);
	await Promise.all([
		writeFile(resolve(OUTPUT_DIRECTORY, 'final-performance.json'), await formatJson(report)),
		writeFile(resolve(OUTPUT_DIRECTORY, 'final-bundle.json'), await formatJson(report.finalBundle)),
		writeFile(resolve(OUTPUT_DIRECTORY, 'final-longtasks.json'), await formatJson(finalSamples)),
		writeFile(VERIFICATION_PATH, createVerification(report, previous)),
	]);
}
