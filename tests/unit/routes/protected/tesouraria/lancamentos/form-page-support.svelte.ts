import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { afterEach } from 'vitest';
import CreatePage from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/novo/+page.svelte';

let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
});

export const getInput = (selector: string) => {
	const input = document.querySelector(selector);
	if (!(input instanceof HTMLInputElement)) throw new Error(`Campo ${selector} não encontrado.`);
	return input;
};

export async function mountCreatePage(form?: ComponentProps<typeof CreatePage>['form']) {
	const props = $state<ComponentProps<typeof CreatePage>>({
		data: { username: 'Tesouraria', userid: 'u', isAdmin: false, contrapartes: [{ id: 7, nome: 'Clício Fogaça' }] },
		form,
	});
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(CreatePage, { target, props });
	await tick();
	const element = target.querySelector('form');
	if (!element) throw new Error('Formulário não encontrado.');
	return { props, form: element };
}

export async function changeType(value: string) {
	const select = document.querySelector('#tipo');
	if (!(select instanceof HTMLSelectElement)) throw new Error('Tipo não encontrado.');
	select.value = value;
	select.dispatchEvent(new Event('change', { bubbles: true }));
	await tick();
}
