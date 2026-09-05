import type { Sql } from 'postgres';

import { getBahiaMonthWindow } from '$lib/server/tesouraria/lancamentos/month-window';
import { treasuryMonthlyProfile } from './profile';

type SettingsRow = {
	postgresVersion: string;
	sharedBuffers: string;
	workMem: string;
	effectiveCacheSize: string;
	maxConnections: string;
};

async function readSettings(client: Sql) {
	const [settings] = await client<SettingsRow[]>`
		SELECT current_setting('server_version') AS "postgresVersion",
			current_setting('shared_buffers') AS "sharedBuffers",
			current_setting('work_mem') AS "workMem",
			current_setting('effective_cache_size') AS "effectiveCacheSize",
			current_setting('max_connections') AS "maxConnections"
	`;
	if (!settings) throw new Error('PostgreSQL settings are unavailable.');
	return settings;
}

async function readCardinalities(client: Sql) {
	const window = getBahiaMonthWindow(new Date(treasuryMonthlyProfile.reference));
	const startDate = window.start.toISOString().slice(0, 10);
	const endDate = window.endExclusive.toISOString().slice(0, 10);
	const [row] = await client<{ lancamentos: string; estornos: string; lancamentosNaJanela: string }[]>`
		SELECT
			(SELECT count(*) FROM lancamentos) AS lancamentos,
			(SELECT count(*) FROM estornos) AS estornos,
			(SELECT count(*) FROM lancamentos WHERE data_lancamento >= ${startDate} AND data_lancamento < ${endDate}) AS "lancamentosNaJanela"
	`;
	if (!row) throw new Error('Performance cardinalities are unavailable.');
	return Object.fromEntries(Object.entries(row).map(([name, value]) => [name, Number(value)]));
}

export async function captureTreasuryEnvironment(client: Sql) {
	return {
		capturedAt: new Date().toISOString(),
		settings: await readSettings(client),
		cardinalities: await readCardinalities(client),
	};
}
