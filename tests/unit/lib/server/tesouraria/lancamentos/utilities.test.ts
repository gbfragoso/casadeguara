import { describe, expect, it } from 'vitest';
import {
	alreadyReversedError,
	isUniqueViolation,
	LancamentoError,
	mapPersistenceError,
	notDepositableError,
	notFoundError,
	persistenceError,
	validationError,
} from '$lib/server/tesouraria/lancamentos/errors';
import { formatDate, toDate } from '$lib/server/tesouraria/lancamentos/format';
import { getTableConfig } from 'drizzle-orm/pg-core';
import {
	autor,
	autorHasLivro,
	editora,
	exemplar,
	keyword,
	livro,
	livroHasKeyword,
	serie,
} from '$lib/server/database/schema';
import {
	activeLancamentoPredicate,
	aviso,
	cadastroFotos,
	cadastros,
	estornos,
	lancamentos,
	user,
} from '$lib/server/database/schema';

describe('lancamento domain utilities', () => {
	it('normalizes dates for persistence', () => {
		expect(toDate('2026-09-02').toISOString()).toBe('2026-09-02T00:00:00.000Z');
		expect(formatDate(new Date('2026-09-02T12:00:00Z'))).toBe('2026-09-02');
		expect(formatDate('2026-09-02T00:00:00.000Z')).toBe('2026-09-02');
		expect(formatDate(null)).toBeNull();
	});

	it('classifies domain and recognized database failures', () => {
		const domain = validationError('invalid');
		const unique = { code: '23505' };
		const foreignKey = { code: '23503' };
		const check = { code: '23514' };

		expect(domain).toBeInstanceOf(LancamentoError);
		expect(notFoundError().code).toBe('LANCAMENTO_NOT_FOUND');
		expect(alreadyReversedError().code).toBe('LANCAMENTO_ALREADY_REVERSED');
		expect(notDepositableError().code).toBe('LANCAMENTO_NOT_DEPOSITABLE');
		expect(persistenceError().code).toBe('PERSISTENCE_ERROR');
		expect(isUniqueViolation(unique)).toBe(true);
		expect(isUniqueViolation({ cause: unique })).toBe(true);
		expect(isUniqueViolation({ code: '99999' })).toBe(false);
		expect(mapPersistenceError(domain)).toBe(domain);
		expect(mapPersistenceError(unique).code).toBe('LANCAMENTO_ALREADY_REVERSED');
		expect(mapPersistenceError(foreignKey).code).toBe('VALIDATION_ERROR');
		expect(mapPersistenceError(check).code).toBe('VALIDATION_ERROR');
		expect(mapPersistenceError(new Error()).code).toBe('PERSISTENCE_ERROR');
		expect(isUniqueViolation(null)).toBe(false);
		expect(isUniqueViolation({ code: 23505 })).toBe(false);
	});

	it('keeps schema foreign keys and constraints available to Drizzle', () => {
		const cadastroConfig = getTableConfig(cadastroFotos);
		const cadastrosConfig = getTableConfig(cadastros);
		const lancamentoConfig = getTableConfig(lancamentos);
		const estornoConfig = getTableConfig(estornos);

		expect(cadastroConfig.foreignKeys).toHaveLength(1);
		expect(cadastrosConfig.uniqueConstraints).toHaveLength(1);
		expect(lancamentoConfig.checks).toHaveLength(1);
		expect(lancamentoConfig.foreignKeys).toHaveLength(1);
		expect(estornoConfig.foreignKeys).toHaveLength(1);
		expect(cadastroConfig.foreignKeys[0]?.reference()).toBeDefined();
		expect(lancamentoConfig.foreignKeys[0]?.reference()).toBeDefined();
		expect(estornoConfig.foreignKeys[0]?.reference()).toBeDefined();
		expect(getTableConfig(autor).name).toBe('autor');
		expect(getTableConfig(livro).name).toBe('livro');
		expect(getTableConfig(aviso).name).toBe('aviso');
		expect(getTableConfig(user).name).toBe('User');
		expect(getTableConfig(editora).name).toBe('editora');
		expect(getTableConfig(exemplar).name).toBe('exemplar');
		expect(getTableConfig(keyword).name).toBe('keyword');
		expect(getTableConfig(serie).name).toBe('serie');
		expect(getTableConfig(autorHasLivro).primaryKeys).toHaveLength(1);
		expect(getTableConfig(livroHasKeyword).primaryKeys).toHaveLength(1);
		expect(activeLancamentoPredicate()).toBeDefined();
	});
});
