import { bookPerformanceScenarios } from './scenarios';
import { connectPerformanceDatabase } from './database';
import { captureEnvironment } from './environment';
import { measureScenario, STATEMENT_TIMEOUT_MS, type BookMeasurement } from './measure';
import { profile } from './profile';
import { writeBaselineArtifacts } from './report';
import { seedBookProfile } from './seed';
import { describe, expect, it } from 'vitest';

async function captureBaseline() {
	const { client, database } = connectPerformanceDatabase();
	try {
		await seedBookProfile(database);
		await client.unsafe(`SET statement_timeout = ${STATEMENT_TIMEOUT_MS}`);
		const environment = await captureEnvironment(client);
		const measurements: BookMeasurement[] = [];
		for (const scenario of bookPerformanceScenarios) {
			const measurement = await measureScenario(database, client, scenario);
			expect(measurement.rows).toBeGreaterThanOrEqual(scenario.expectedRows.min);
			expect(measurement.rows).toBeLessThanOrEqual(scenario.expectedRows.max);
			measurements.push(measurement);
		}
		await writeBaselineArtifacts(environment, measurements);
		return { environment, measurements };
	} finally {
		await client.end();
	}
}

describe('TI-12 baseline de pesquisa de livros', () => {
	it('records the real query, representative cardinalities, plans and sequential samples', async () => {
		const expectedScenarioNames = bookPerformanceScenarios.map(({ name }) => name);

		const { environment, measurements } = await captureBaseline();

		expect(environment.cardinalities).toEqual(profile.cardinalities);
		expect(measurements.map(({ name }) => name)).toEqual(expectedScenarioNames);
		expect(measurements.every(({ query, plan }) => query.sql.length > 0 && plan !== undefined)).toBe(true);
	});
});
