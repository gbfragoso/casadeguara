import { describe, expect, it } from 'vitest';

import { withProvisionedDatabase } from './migration-test-support';

type ExplainRow = { 'QUERY PLAN': unknown };

describe('lancamentos operational readiness', () => {
	it('compares representative legacy and unified totals and captures a query plan', async () => {
		await withProvisionedDatabase(async (database) => {
			const client = database.$client;
			await client.unsafe(`
				create temp table legacy_entradas (identrada integer, descricao varchar(200), valor numeric, data_entrada date);
				create temp table legacy_saidas (idsaida integer, descricao varchar(200), valor numeric, data_saida date);
				insert into legacy_entradas values (1, 'Operacional entrada', 150.00, '2026-09-01');
				insert into legacy_saidas values (2, 'Operacional saída', 80.00, '2026-09-02');
				insert into cadastros (nome, trab) values ('Operacional contraparte', true);
				insert into lancamentos (tipo, descricao, valor, data_lancamento, idcontraparte, depositado, uuid_recibo)
				values ('entrada', 'Operacional entrada', 150.00, '2026-09-01', (select idleitor from cadastros where nome = 'Operacional contraparte'), false, '11111111-1111-7111-8111-111111111111');
				insert into lancamentos (tipo, descricao, valor, data_lancamento, depositado, uuid_recibo)
				values ('saida', 'Operacional saída', 80.00, '2026-09-02', null, null);
			`);

			const [legacyStats] = await client<{ entries: number; exits: number; total: string }[]>`
				select
					(select count(*)::int from legacy_entradas) as entries,
					(select count(*)::int from legacy_saidas) as exits,
					(select coalesce(sum(valor), 0)::numeric from legacy_entradas) +
					(select coalesce(sum(valor), 0)::numeric from legacy_saidas) as total
			`;
			const [unifiedStats] = await client<{ entries: number; exits: number; total: string }[]>`
				select
					count(*) filter (where tipo = 'entrada')::int as entries,
					count(*) filter (where tipo = 'saida')::int as exits,
					coalesce(sum(valor), 0)::numeric as total
				from lancamentos
			`;
			const legacyPlan = await client<ExplainRow[]>`
				EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
				SELECT identrada AS id, valor FROM legacy_entradas
				UNION ALL
				SELECT idsaida AS id, valor FROM legacy_saidas
			`;
			const unifiedPlan = await client<ExplainRow[]>`
				EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
				SELECT tipo, count(*)::int AS total, coalesce(sum(valor), 0::numeric) AS valor
				FROM lancamentos
				GROUP BY tipo
			`;

			expect(unifiedStats).toEqual(legacyStats);
			expect(legacyPlan[0]?.['QUERY PLAN']).toBeDefined();
			expect(unifiedPlan[0]?.['QUERY PLAN']).toBeDefined();
			console.info('lancamentos.operational_plan_captured', {
				legacyPlan: legacyPlan[0]?.['QUERY PLAN'],
				unifiedPlan: unifiedPlan[0]?.['QUERY PLAN'],
			});
		});
	});
});
