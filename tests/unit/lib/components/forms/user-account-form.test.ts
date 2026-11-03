// @vitest-environment happy-dom
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));
vi.mock('$app/state', async () => ({ page: (await import('../support/page-state.svelte.js')).pageState }));

import UserAccountForm from '#lib/components/forms/UserAccountForm.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

const editedUser = {
	username: 'ana@exemplo.dev',
	name: 'Ana Souza',
	access: {
		modules: {
			biblioteca: 'none',
			secretaria: 'volunteer',
			tesouraria: 'coordination',
			comunicacao: 'none',
		} as const,
		superuser: true,
	},
};

const STRENGTH = 'progress[aria-label="Força da senha"]';

const readDescription = (element: Element) =>
	(element.getAttribute('aria-describedby') ?? '')
		.split(' ')
		.map((id) => document.getElementById(id)?.textContent?.trim());

const readGroups = (target: HTMLElement) =>
	[...target.querySelectorAll('fieldset')].map((fieldset) => [
		fieldset.querySelector('legend')?.textContent?.trim(),
		[...fieldset.querySelectorAll('label')].map((label) => label.textContent?.trim()),
	]);

const readCheckedLevels = (target: HTMLElement) =>
	[...target.querySelectorAll<HTMLInputElement>('input[type="radio"]:checked')].map((radio) => [
		radio.name,
		radio.value,
	]);

describe('TU-24 UserAccountForm fields', () => {
	it('renders one access group per module with the three levels', async () => {
		const target = await renderComponent(UserAccountForm, { form: null });

		const levels = ['Sem acesso', 'Voluntário', 'Coordenação'];
		expect(readGroups(target)).toEqual([
			['Biblioteca', levels],
			['Secretaria', levels],
			['Tesouraria', levels],
			['Comunicação', levels],
		]);
	});

	it('explains that the superuser box grants only user management', async () => {
		const target = await renderComponent(UserAccountForm, { form: null });

		const superuser = getElement(target, '#superuser', HTMLInputElement);

		expect(superuser.closest('label')?.textContent?.trim()).toBe('Superusuário');
		expect(readDescription(superuser)).toEqual(['Libera apenas a gestão de usuários, sem acesso aos módulos.']);
	});

	it('starts a new account without access', async () => {
		const target = await renderComponent(UserAccountForm, { form: null });

		expect(readCheckedLevels(target).map(([, level]) => level)).toEqual(['none', 'none', 'none', 'none']);
		expect(getElement(target, '#superuser', HTMLInputElement).checked).toBe(false);
	});

	it('fills the edited account with its current access', async () => {
		const target = await renderComponent(UserAccountForm, { form: null, user: editedUser });

		expect(getElement(target, '#username', HTMLInputElement).value).toBe('ana@exemplo.dev');
		expect(getElement(target, '#name', HTMLInputElement).value).toBe('Ana Souza');
		expect(readCheckedLevels(target)).toEqual([
			['access-biblioteca', 'none'],
			['access-secretaria', 'volunteer'],
			['access-tesouraria', 'coordination'],
			['access-comunicacao', 'none'],
		]);
		expect(getElement(target, '#superuser', HTMLInputElement).checked).toBe(true);
	});

	it('keeps the submitted values after a rejected submission', async () => {
		const values = { ...editedUser, name: 'Ana S.', access: { ...editedUser.access, superuser: false } };
		const form = { values, errors: { superuser: ['Você não pode retirar a sua própria role de superusuário.'] } };

		const target = await renderComponent(UserAccountForm, { form, user: editedUser });

		expect(getElement(target, '#name', HTMLInputElement).value).toBe('Ana S.');
		expect(getElement(target, '#superuser', HTMLInputElement).checked).toBe(false);
	});
});

describe('TU-25 UserAccountForm password and errors', () => {
	it('requires the password and shows its strength when creating', async () => {
		const target = await renderComponent(UserAccountForm, { form: null });

		expect(getElement(target, '#password', HTMLInputElement).required).toBe(true);
		expect(target.querySelector(STRENGTH)).not.toBeNull();
	});

	it('explains that a blank password keeps the current one when editing', async () => {
		const target = await renderComponent(UserAccountForm, { form: null, user: editedUser });

		const password = getElement(target, '#password', HTMLInputElement);

		expect(password.required).toBe(false);
		expect(readDescription(password)).toEqual(['Deixe em branco para manter a senha atual.']);
		expect(target.querySelector(STRENGTH)).toBeNull();
	});

	it('shows the strength once a new password is typed when editing', async () => {
		const target = await renderComponent(UserAccountForm, { form: null, user: editedUser });
		const password = getElement(target, '#password', HTMLInputElement);

		password.value = 'nova-senha';
		password.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(target.querySelector(STRENGTH)).not.toBeNull();
	});

	it('links each field error to its control', async () => {
		const form = {
			values: editedUser,
			errors: {
				username: ['E-mail inválido'],
				password: ['Senha não atende aos requisitos mínimos de segurança'],
			},
		};

		const target = await renderComponent(UserAccountForm, { form });

		expect(readDescription(getElement(target, '#username', HTMLInputElement))).toEqual([
			'Use o e-mail de acesso, com até 30 caracteres.',
			'E-mail inválido',
		]);
		expect(readDescription(getElement(target, '#password', HTMLInputElement))).toEqual([
			'Mínimo de 6 caracteres.',
			'Senha não atende aos requisitos mínimos de segurança',
		]);
	});

	it('links the access error to every module group', async () => {
		const message = 'Escolha ao menos um acesso: um módulo ou a opção de superusuário.';

		const target = await renderComponent(UserAccountForm, {
			form: { values: editedUser, errors: { access: [message] } },
		});

		expect([...target.querySelectorAll('fieldset')].map(readDescription)).toEqual([
			[message],
			[message],
			[message],
			[message],
		]);
	});

	it('links the self-removal refusal to the superuser box', async () => {
		const message = 'Você não pode retirar a sua própria role de superusuário.';

		const target = await renderComponent(UserAccountForm, {
			form: { values: editedUser, errors: { superuser: [message] } },
			user: editedUser,
		});

		expect(readDescription(getElement(target, '#superuser', HTMLInputElement))).toEqual([
			'Libera apenas a gestão de usuários, sem acesso aos módulos.',
			message,
		]);
	});

	it('announces the successful update', async () => {
		const target = await renderComponent(UserAccountForm, { form: { status: 200 }, user: editedUser });

		expect(target.querySelector('[role="status"]')?.textContent?.trim()).toBe('Usuário atualizado com sucesso!');
	});

	it('alerts that a rejected submission needs review', async () => {
		const form = { values: editedUser, errors: { username: ['Já existe um usuário com este login.'] } };

		const target = await renderComponent(UserAccountForm, { form });

		expect(target.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
			'Não foi possível salvar o usuário. Revise os campos indicados.',
		);
	});
});
