import { enhance } from '$app/forms';
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { afterEach, vi } from 'vitest';
import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/novo/+page.svelte';

type Props = ComponentProps<typeof Page>;
export const readers = [
	{ idleitor: 7, nome: 'Clício Fogaça' },
	{ idleitor: 8, nome: "Clébio D'Ávila" },
];
export const copies = [
	{ idexemplar: 31, numero: 1, titulo: 'O Evangelho segundo o Espiritismo', tombo: '00123' },
	{ idexemplar: 32, numero: 2, titulo: 'O Evangelho segundo o Espiritismo', tombo: '00123' },
	{ idexemplar: 33, numero: 1, titulo: 'Ação e Reação', tombo: '00456' },
];

let mounted: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
	vi.clearAllMocks();
});

export async function mountPage(data: Props['data'] = { leitores: readers, exemplares: copies }) {
	const props = $state<Props>({ data });
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(Page, { target, props });
	await tick();
	const form = target.querySelector('form');
	if (!form) throw new Error('Formulário de empréstimo não encontrado.');
	return { props, form };
}

export const getInput = (field: string) => {
	const input = document.getElementById(field);
	if (!(input instanceof HTMLInputElement)) throw new Error(`Campo ${field} não encontrado.`);
	return input;
};

export const getSubmit = () => {
	const button = document.querySelector('button[type="submit"]');
	if (!(button instanceof HTMLButtonElement)) throw new Error('Botão de cadastro não encontrado.');
	return button;
};

export async function editField(field: string, query: string) {
	const input = getInput(field);
	input.focus();
	input.value = query;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
}

export async function selectSuggestion(field: string, query: string, id: number) {
	await editField(field, query);
	const option = document.getElementById(`${field}-option-${id}`);
	if (!(option instanceof HTMLButtonElement)) throw new Error('Sugestão não encontrada.');
	option.click();
	await tick();
}

export async function startSubmission(form: HTMLFormElement, action: URL) {
	const submit = vi.mocked(enhance).mock.calls.at(-1)?.[1];
	if (!submit) throw new Error('Envio aprimorado não encontrado.');
	const complete = await submit({
		action,
		cancel: vi.fn(),
		controller: new AbortController(),
		formData: new FormData(form),
		formElement: form,
		submitter: null,
	});
	if (!complete) throw new Error('Atualização do formulário não encontrada.');
	return complete;
}
