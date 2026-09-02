import { describe, expect, it } from 'vitest';
import { bookPerformanceScenarios, type BookPerformanceScenario } from './scenarios';
import { connectPerformanceDatabase } from './database';
import { captureEnvironment } from './environment';
import { measureScenario, STATEMENT_TIMEOUT_MS, type BookMeasurement } from './measure';
import { profile } from './profile';
import { writePostArtifacts } from './report';
import { seedBookProfile } from './seed';

function toFinalScenario(scenario: BookPerformanceScenario): BookPerformanceScenario {
	if (!('colecao' in scenario.input)) return scenario;
	const { colecao, ...input } = scenario.input;
	return {
		...scenario,
		input: { ...input, colecaoId: colecao ? Number(colecao) : undefined },
	};
}

async function capturePostPerformance() {
	const { client, database } = connectPerformanceDatabase();
	try {
		await seedBookProfile(database);
		await client.unsafe(`SET statement_timeout = ${STATEMENT_TIMEOUT_MS}`);
		const environment = await captureEnvironment(client);
		const measurements: BookMeasurement[] = [];
		for (const scenario of bookPerformanceScenarios.map(toFinalScenario)) {
			const measurement = await measureScenario(database, client, scenario);
			expect(measurement.rows).toBeGreaterThanOrEqual(scenario.expectedRows.min);
			expect(measurement.rows).toBeLessThanOrEqual(scenario.expectedRows.max);
			measurements.push(measurement);
		}
		await writePostArtifacts(environment, measurements);
		return { environment, measurements };
	} finally {
		await client.end();
	}
}

describe('TI-13 performance pós-revitalização da pesquisa de livros', () => {
	it('records the final query with the baseline profile and sequential samples', async () => {
		const expectedScenarioNames = bookPerformanceScenarios.map(({ name }) => name);

		const { environment, measurements } = await capturePostPerformance();

		expect(environment.cardinalities).toEqual(profile.cardinalities);
		expect(measurements.map(({ name }) => name)).toEqual(expectedScenarioNames);
		expect(measurements.every(({ query, plan }) => query.sql.length > 0 && plan !== undefined)).toBe(true);
		expect(measurements.find(({ name }) => name === 'autor-prefixo-amplo')?.query.sql).toContain('exists');
	});
});
