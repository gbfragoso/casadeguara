import { describe, expect, it } from 'vitest';

import { captureTreasuryEnvironment } from './monthly-environment';
import { measureTreasuryMonthlyQuery, MONTHLY_STATEMENT_TIMEOUT_MS } from './monthly-measure';
import { treasuryMonthlyProfile } from './profile';
import { writeTreasuryMonthlyReport } from './monthly-report';
import { connectTreasuryPerformanceDatabase } from './database';
import { seedTreasuryMonthlyProfile } from './seed-monthly';

describe('TI-04 performance da projeção mensal da tesouraria', () => {
	it('mede a consulta agregada no perfil representativo', async () => {
		const { client, database } = connectTreasuryPerformanceDatabase();
		try {
			await seedTreasuryMonthlyProfile(client);
			await client.unsafe(`SET statement_timeout = ${MONTHLY_STATEMENT_TIMEOUT_MS}`);
			const environment = await captureTreasuryEnvironment(client);
			const measurement = await measureTreasuryMonthlyQuery(database, client);

			expect(environment.cardinalities).toEqual({
				lancamentos: treasuryMonthlyProfile.lancamentos,
				estornos: treasuryMonthlyProfile.estornos,
				lancamentosNaJanela: treasuryMonthlyProfile.lancamentosNaJanela,
			});
			expect(measurement.query.sql).toContain('date_trunc');
			expect(measurement.query.sql).toContain('NOT EXISTS');
			expect(measurement.plan).toBeDefined();
			expect(measurement.p95Ms).toBeLessThanOrEqual(200);
			await writeTreasuryMonthlyReport(environment, measurement);
		} finally {
			await client.end();
		}
	});
});
