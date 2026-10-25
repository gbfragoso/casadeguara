import { describe, expect, it } from 'vitest';

import { listAccessibleModules, resolveLoginDestination } from '#lib/navigation/system-modules.js';

const listLabels = (roles: string[]) => listAccessibleModules(roles).map((module) => module.label);

describe('TU-02 system modules', () => {
	it('sends a user with only Comunicação to the module', () => {
		expect(resolveLoginDestination('comunicacao')).toBe('/comunicacao');
	});

	it('sends a user with several areas to the module selection', () => {
		expect(resolveLoginDestination('secretaria,comunicacao')).toBe('/sistemas');
	});

	it('lists Secretaria and Comunicação for a user with both areas', () => {
		expect(listLabels(['secretaria', 'comunicacao'])).toEqual(['Secretaria', 'Comunicação']);
	});

	it('sends a library coordinator straight to the library', () => {
		expect(resolveLoginDestination('biblioteca,biblioteca:admin')).toBe('/biblioteca');
	});

	it('keeps sending a single coordination role to its module', () => {
		expect(resolveLoginDestination('tesouraria:admin')).toBe('/tesouraria');
	});

	it('has no destination for a user without a module', () => {
		expect(resolveLoginDestination('desconhecido')).toBeNull();
	});

	it('ignores spaces around the roles', () => {
		expect(listLabels([' tesouraria ', ' comunicacao:admin'])).toEqual(['Tesouraria', 'Comunicação']);
	});
});
