import { profile } from './profile';
import type { Sql } from 'postgres';

type SettingsRow = {
	postgresVersion: string;
	sharedBuffers: string;
	workMem: string;
	effectiveCacheSize: string;
	maxConnections: string;
};

type CardinalityRow = {
	books: string;
	authors: string;
	publishers: string;
	collections: string;
	keywords: string;
	bookAuthors: string;
	bookKeywords: string;
	copies: string;
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
	const [row] = await client<CardinalityRow[]>`
		SELECT (SELECT count(*) FROM livro) AS books,
			(SELECT count(*) FROM autor) AS authors,
			(SELECT count(*) FROM editora) AS publishers,
			(SELECT count(*) FROM serie) AS collections,
			(SELECT count(*) FROM keyword) AS keywords,
			(SELECT count(*) FROM autor_has_livro) AS "bookAuthors",
			(SELECT count(*) FROM livro_has_keyword) AS "bookKeywords",
			(SELECT count(*) FROM exemplar) AS copies
	`;
	if (!row) throw new Error('Profile cardinalities are unavailable.');
	return Object.fromEntries(Object.entries(row).map(([name, value]) => [name, Number(value)]));
}

export async function captureEnvironment(client: Sql) {
	return {
		capturedAt: new Date().toISOString(),
		schemaRevision: profile.source.schemaRevision,
		docker: profile.source.docker,
		settings: await readSettings(client),
		cardinalities: await readCardinalities(client),
	};
}
