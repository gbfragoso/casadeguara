// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { changeType, getInput, mountCreatePage } from './form-page-support.svelte';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

describe('novo lançamento counterpart integration', () => {
	it('submits only the ID of a confirmed suggestion', async () => {
		const { form } = await mountCreatePage();
		const input = getInput('#contraparteId');
		input.value = 'CLICIO FOGACA';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		const option = document.querySelector('[role="option"]');
		if (!(option instanceof HTMLButtonElement)) throw new Error('Sugestão não encontrada.');

		option.click();
		await tick();

		expect(new FormData(form).getAll('contraparteId')).toEqual(['7']);
		expect(input.name).toBe('');
		expect(input.value).toBe('Clício Fogaça');
	});

	it('clears the selected donor and deposit when changing to an exit', async () => {
		const { form } = await mountCreatePage({
			values: { tipo: 'entrada', contraparteId: '7', depositado: 'true' },
			errors: {},
		});

		await changeType('saida');

		expect(getInput('#contraparteId').value).toBe('');
		expect(getInput('#contraparteId').required).toBe(false);
		expect(new FormData(form).get('contraparteId')).toBe('');
		expect(document.querySelector('#depositado')).toBeNull();
	});

	it('clears unfinished search text and requires a donor when changing to an entry', async () => {
		await mountCreatePage({ values: { tipo: 'saida' }, errors: {} });
		const input = getInput('#contraparteId');
		input.value = 'pesquisa incompleta';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();

		await changeType('entrada');

		expect(getInput('#contraparteId').value).toBe('');
		expect(getInput('#contraparteId').required).toBe(true);
		expect(getInput('#contraparteId').checkValidity()).toBe(false);
		expect(getInput('#depositado').checked).toBe(false);
	});

	it('restores the selected cadastro and values after server validation errors', async () => {
		const { props, form } = await mountCreatePage();
		const errors = {
			descricao: ['Descrição obrigatória.'],
			valor: ['Valor inválido.'],
			dataLancamento: ['Data inválida.'],
		};

		props.form = {
			values: {
				tipo: 'entrada',
				contraparteId: '7',
				valor: 'inválido',
				descricao: '',
				dataLancamento: '',
				depositado: 'true',
			},
			errors,
		};
		await tick();

		expect(getInput('#contraparteId').value).toBe('Clício Fogaça');
		expect(new FormData(form).get('contraparteId')).toBe('7');
		expect(getInput('#depositado').checked).toBe(true);
		expect(getInput('#valor').value).toBe('inválido');
		Object.entries(errors).forEach(([field, messages]) => {
			expect(getInput(`#${field}`).getAttribute('aria-describedby')).toBe(`${field}-errors`);
			expect(document.getElementById(`${field}-errors`)?.textContent).toContain(messages[0]);
		});
	});

	it('keeps the selected cadastro visible alongside a general submission error', async () => {
		const { props } = await mountCreatePage();

		props.form = {
			values: { tipo: 'saida', contraparteId: '7' },
			errors: { form: ['Não foi possível cadastrar.'] },
		};
		await tick();

		expect(getInput('#contraparteId').value).toBe('Clício Fogaça');
		expect(document.querySelector('[role="alert"]')?.textContent).toBe('Não foi possível cadastrar.');
	});
});
