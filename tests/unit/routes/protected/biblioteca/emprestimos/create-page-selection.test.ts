// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { editField, getInput, getSubmit, mountPage, selectSuggestion } from './create-page-support.svelte';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

describe('novo empréstimo autocomplete', () => {
	it.each(['clicio fogaca', 'CLICIO FOGACA', 'clicio fogaça'])('selects a reader using %s', async (query) => {
		const { form } = await mountPage();

		await selectSuggestion('leitor', query, 7);

		expect(getInput('leitor').value).toBe('Clício Fogaça');
		expect(new FormData(form).getAll('leitorid')).toEqual(['7']);
		expect(getInput('leitor').required).toBe(true);
		expect(getSubmit().disabled).toBe(true);
	});

	it('accepts a reader name containing an apostrophe', async () => {
		const { form } = await mountPage();

		await selectSuggestion('leitor', "clebio d'avila", 8);

		expect(new FormData(form).get('leitorid')).toBe('8');
		expect(getInput('leitor').value).toBe("Clébio D'Ávila");
	});

	it.each(['ACAO E REACAO', 'ação e reação', '00456'])('finds a copy by %s', async (query) => {
		const { form } = await mountPage();

		await selectSuggestion('exemplar', query, 33);

		expect(getInput('exemplar').value).toBe('00456 - Ação e Reação - EX:1');
		expect(new FormData(form).getAll('exemplarid')).toEqual(['33']);
		expect(getInput('exemplar').required).toBe(true);
	});

	it('distinguishes copies of the same book and enables submission after both selections', async () => {
		const { form } = await mountPage();
		await selectSuggestion('leitor', 'clicio', 7);

		await selectSuggestion('exemplar', 'EX:2', 32);

		expect(new FormData(form).get('exemplarid')).toBe('32');
		expect(new FormData(form).get('leitorid')).toBe('7');
		expect(getSubmit().disabled).toBe(false);
	});

	it.each([
		['leitor', 'leitorid'],
		['exemplar', 'exemplarid'],
	])('invalidates an edited %s selection', async (field, name) => {
		const { form } = await mountPage();
		await selectSuggestion('leitor', 'clicio', 7);
		await selectSuggestion('exemplar', '00456', 33);

		await editField(field, 'pesquisa sem seleção');

		expect(new FormData(form).get(name)).toBe('');
		expect(getInput(field).checkValidity()).toBe(false);
		expect(getSubmit().disabled).toBe(true);
	});

	it('uses exemplar-specific labels and validation messages', async () => {
		await mountPage();

		await editField('exemplar', 'não existe');

		expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-label')).toBe('Exemplares sugeridos');
		expect(document.querySelector('[role="status"]')?.textContent).toBe('Nenhum exemplar encontrado.');
		expect(getInput('exemplar').validationMessage).toBe('Selecione um exemplar da lista.');
	});

	it('selects a reader by keyboard without changing the exemplar', async () => {
		const { form } = await mountPage();
		await selectSuggestion('exemplar', '00456', 33);
		await editField('leitor', 'clicio');

		getInput('leitor').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await tick();
		getInput('leitor').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await tick();

		expect(new FormData(form).get('leitorid')).toBe('7');
		expect(new FormData(form).get('exemplarid')).toBe('33');
	});
});
