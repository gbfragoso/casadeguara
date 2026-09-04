import type { Sql } from 'postgres';

import { treasuryMonthlyProfile } from './profile';

const FIRST_MONTH = '2021-10-01';
const TOTAL_ROWS = treasuryMonthlyProfile.lancamentos - 1;

export async function seedTreasuryMonthlyProfile(client: Sql) {
	await client`TRUNCATE estornos, lancamentos RESTART IDENTITY`;
	const [counterpart] = await client<{ id: number }[]>`
		INSERT INTO cadastros (nome, trab)
		VALUES ('Perfil de performance da tesouraria', true)
		RETURNING idleitor AS id
	`;
	if (!counterpart) throw new Error('Performance counterpart was not created.');

	await client.unsafe(
		`WITH inserted AS (
			INSERT INTO lancamentos (tipo, descricao, valor, data_lancamento, idcontraparte, depositado, uuid_recibo)
			SELECT CASE WHEN series.value % 2 = 0 THEN 'entrada'::tipo_lancamento ELSE 'saida'::tipo_lancamento END,
				'treasury-performance-' || series.value,
				CASE WHEN series.value % 5 = 0 THEN (series.value % 100000)::numeric / 1000 ELSE (series.value % 100000)::numeric / 100 END,
				(DATE '${FIRST_MONTH}' + (series.value / 2000)::int * INTERVAL '1 month' + (series.value % 28) * INTERVAL '1 day')::date,
				${counterpart.id},
				CASE WHEN series.value % 2 = 0 THEN false ELSE NULL END,
				CASE WHEN series.value % 2 = 0 THEN md5('treasury-performance-' || series.value)::uuid ELSE NULL END
			FROM generate_series(0, ${TOTAL_ROWS}) AS series(value)
			RETURNING idlancamento
		)
		INSERT INTO estornos (idlancamento, motivo, user_estorno)
		SELECT idlancamento, 'Perfil de performance', 'performance'
		FROM inserted
		WHERE idlancamento % 10 = 1`,
	);

	await client`ANALYZE lancamentos`;
	await client`ANALYZE estornos`;
}
