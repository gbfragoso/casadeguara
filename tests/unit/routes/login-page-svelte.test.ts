import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../src/routes/+page.svelte';
import { hasModuleShell } from '../support/module-shell-regions';
import { getRenderedButton, getRenderedInput, parseRenderedBody } from '../support/rendered-document';

type LoginForm = { invalidEmail?: boolean; invalidPassword?: boolean; failedLogin?: boolean; message?: string };

const renderLogin = (form: LoginForm | null = null) => parseRenderedBody(render(Page, { props: { form } }).body);

describe('login page', () => {
	it('renders the logo and the sign-in button without the module shell', () => {
		const document = renderLogin();

		expect(document.querySelector('img[alt="Avatar"]')?.getAttribute('src')).toBe('/logo.png');
		expect(getRenderedButton(document, 'form[method="POST"] button').textContent?.trim()).toBe('Entrar');
		expect(hasModuleShell(document)).toBe(false);
	});

	it('renders the fields as valid before any submission', () => {
		const document = renderLogin();

		const fields = ['#email', '#password'].map((selector) => getRenderedInput(document, selector));

		expect(fields.map((field) => field.getAttribute('aria-invalid'))).toEqual([null, null]);
		expect(document.querySelector('#email-errors, #password-errors')).toBeNull();
	});

	it('associates the invalid email message with the email field', () => {
		const document = renderLogin({ invalidEmail: true });

		const email = getRenderedInput(document, '#email');

		expect(email.getAttribute('aria-invalid')).toBe('true');
		expect(email.getAttribute('aria-describedby')).toBe('email-errors');
		expect(document.querySelector('#email-errors')?.textContent?.trim()).toBe('E-mail inválido');
	});

	it('associates the invalid password message with the password field', () => {
		const document = renderLogin({ invalidPassword: true });

		const password = getRenderedInput(document, '#password');

		expect(password.getAttribute('aria-invalid')).toBe('true');
		expect(password.getAttribute('aria-describedby')).toBe('password-errors');
		expect(document.querySelector('#password-errors')?.textContent?.trim()).toBe('Senha inválida');
	});

	it('shows the failed sign-in message below the button', () => {
		const document = renderLogin({ failedLogin: true });

		const message = document.querySelector('form > p');

		expect(message?.textContent?.trim()).toBe('Email ou senha inválidos');
		expect(message?.previousElementSibling?.querySelector('button')).not.toBeNull();
	});

	it('shows the server message for users without a module', () => {
		const document = renderLogin({ message: 'Solicite ao administrador do sistema cadastramento no setor' });

		expect(document.querySelector('form > p')?.textContent?.trim()).toBe(
			'Solicite ao administrador do sistema cadastramento no setor',
		);
	});
});
