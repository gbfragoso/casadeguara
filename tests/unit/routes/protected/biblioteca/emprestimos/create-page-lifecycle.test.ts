// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import {
	copies,
	readers,
	getInput,
	getSubmit,
	mountPage,
	selectSuggestion,
	startSubmission,
} from './create-page-support.svelte';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

describe('novo empréstimo async data and validation', () => {
	it('waits for both option lists before allowing a loan', async () => {
		const readerData = Promise.withResolvers<typeof readers>();
		const copyData = Promise.withResolvers<typeof copies>();
		await mountPage({ leitores: readerData.promise, exemplares: copyData.promise });

		expect(document.body.textContent).toContain('Carregando leitores...');
		expect(document.body.textContent).toContain('Carregando exemplares...');
		expect(getSubmit().disabled).toBe(true);
		readerData.resolve(readers);
		copyData.resolve(copies);
		await tick();
		await selectSuggestion('leitor', 'clicio', 7);
		await selectSuggestion('exemplar', '00456', 33);

		expect(getSubmit().disabled).toBe(false);
	});

	it.each(['leitores', 'exemplares'])('reports failure to load %s', async (field) => {
		const readerData = Promise.withResolvers<typeof readers>();
		const copyData = Promise.withResolvers<typeof copies>();
		await mountPage({ leitores: readerData.promise, exemplares: copyData.promise });

		if (field === 'leitores') {
			readerData.reject(new Error('indisponível'));
			copyData.resolve(copies);
		} else {
			readerData.resolve(readers);
			copyData.reject(new Error('indisponível'));
		}
		await tick();

		expect(document.querySelector('[role="alert"]')?.textContent).toBe(`Não foi possível carregar os ${field}.`);
		expect(getSubmit().disabled).toBe(true);
	});

	it.each(['leitor', 'exemplar'])('keeps the selection and links a server error to %s', async (field) => {
		const { props, form } = await mountPage();
		await selectSuggestion('leitor', 'clicio', 7);
		await selectSuggestion('exemplar', '00456', 33);

		props.form = { status: 400, field, message: 'Não é possível realizar este empréstimo.' };
		await tick();

		expect(new FormData(form).get('leitorid')).toBe('7');
		expect(new FormData(form).get('exemplarid')).toBe('33');
		expect(getInput(field).getAttribute('aria-invalid')).toBe('true');
		expect(getInput(field).getAttribute('aria-describedby')).toBe('emprestimo-errors');
		expect(document.getElementById('emprestimo-errors')?.textContent).toContain(props.form.message);
	});

	it('disables repeat submissions until the action result is applied', async () => {
		const { form } = await mountPage();
		const action = new URL('http://localhost/biblioteca/emprestimos/novo');
		await selectSuggestion('leitor', 'clicio', 7);
		await selectSuggestion('exemplar', '00456', 33);

		const complete = await startSubmission(form, action);
		await tick();
		expect(getSubmit().disabled).toBe(true);
		expect(getSubmit().getAttribute('aria-busy')).toBe('true');
		await complete({
			action,
			formData: new FormData(form),
			formElement: form,
			result: { type: 'failure', status: 400, data: {} },
			update: vi.fn(),
		});
		await tick();

		expect(getSubmit().disabled).toBe(false);
		expect(getSubmit().getAttribute('aria-busy')).toBe('false');
	});
});
