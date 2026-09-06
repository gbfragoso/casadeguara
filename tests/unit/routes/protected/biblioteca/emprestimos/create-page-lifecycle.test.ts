// @vitest-environment happy-dom
import { tick } from 'svelte';
import { expect, it, vi } from 'vitest';
import {
	copies,
	readers,
	getInput,
	getSubmit,
	mountPage,
	selectSuggestion,
	startSubmission,
	editField,
} from './create-page-support.svelte';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

it('renders both fields immediately and requires confirmed selections', async () => {
	await mountPage();

	expect(getInput('leitor').value).toBe('');
	expect(getInput('exemplar').value).toBe('');
	expect(document.querySelector('[role="status"]')).toBeNull();
	expect(getSubmit().disabled).toBe(true);
});

it('keeps the focused field and unfinished query when option lists are refreshed', async () => {
	const { props } = await mountPage();
	await editField('leitor', 'clicio');
	const input = getInput('leitor');

	props.data = { leitores: [...readers], exemplares: [...copies] };
	await tick();

	expect(getInput('leitor')).toBe(input);
	expect(document.activeElement).toBe(input);
	expect(input.value).toBe('clicio');
	expect(document.querySelector('[role="option"]')?.textContent?.trim()).toBe('Clício Fogaça');
});

it('keeps selected names and IDs when option lists are refreshed', async () => {
	const { props, form } = await mountPage();
	await selectSuggestion('leitor', 'clicio', 7);
	await selectSuggestion('exemplar', '00456', 33);
	const inputs = [getInput('leitor'), getInput('exemplar')];

	props.data = { leitores: [...readers], exemplares: [...copies] };
	await tick();

	expect(getInput('leitor')).toBe(inputs[0]);
	expect(getInput('exemplar')).toBe(inputs[1]);
	expect(getInput('leitor').value).toBe('Clício Fogaça');
	expect(getInput('exemplar').value).toBe('00456 - Ação e Reação - EX:1');
	expect(new FormData(form).get('leitorid')).toBe('7');
	expect(new FormData(form).get('exemplarid')).toBe('33');
	expect(getSubmit().disabled).toBe(false);
});

it.each(['leitores', 'exemplares'] as const)('keeps fields visible with empty %s', async (field) => {
	await mountPage({ leitores: readers, exemplares: copies, [field]: [] });

	expect(getInput('leitor').required).toBe(true);
	expect(getInput('exemplar').required).toBe(true);
	expect(getSubmit().disabled).toBe(true);
});

it.each(['leitor', 'exemplar'] as const)('keeps the selection and links a server error to %s', async (field) => {
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
