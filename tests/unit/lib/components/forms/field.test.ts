// @vitest-environment happy-dom
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import Field from '#lib/components/forms/Field.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

type ControlState = { describedBy: string | undefined; invalid: 'true' | undefined };

const createControl = (received: ControlState[]) =>
	createRawSnippet((state: () => ControlState) => ({
		render: () => {
			received.push(state());
			return '<input id="tombo" />';
		},
	}));

describe('Field', () => {
	it('associates the error messages and the help with the control', async () => {
		const received: ControlState[] = [];

		const target = await renderComponent(Field, {
			id: 'tombo',
			label: 'Tombo',
			help: 'Informe somente dígitos.',
			errors: ['Tombo é obrigatório.', 'Tombo deve conter de 1 a 8 dígitos.'],
			control: createControl(received),
		});

		const errors = getElement(target, '#tombo-errors', HTMLDivElement);
		expect([...errors.querySelectorAll('p')].map((message) => message.textContent)).toEqual([
			'Tombo é obrigatório.',
			'Tombo deve conter de 1 a 8 dígitos.',
		]);
		expect(received).toEqual([{ describedBy: 'tombo-help tombo-errors', invalid: 'true' }]);
		expect(getElement(target, '#tombo-help', HTMLParagraphElement).textContent).toBe('Informe somente dígitos.');
		expect(getElement(target, 'label', HTMLLabelElement).htmlFor).toBe('tombo');
	});

	it('shows a repeated error message once', async () => {
		const message = 'Selecione ou cadastre ao menos um autor.';

		const target = await renderComponent(Field, {
			id: 'autores',
			label: 'Autores',
			errors: [message, message],
			control: createControl([]),
		});

		const errors = getElement(target, '#autores-errors', HTMLDivElement);
		expect([...errors.querySelectorAll('p')].map((paragraph) => paragraph.textContent)).toEqual([message]);
	});

	it('uses the error and help ids given by the screen', async () => {
		const received: ControlState[] = [];

		const target = await renderComponent(Field, {
			id: 'senha',
			label: 'Senha',
			help: 'Força da senha',
			helpId: 'forca-senha',
			errors: ['Senha inválida.'],
			errorsId: 'login-errors',
			control: createControl(received),
		});

		expect(received).toEqual([{ describedBy: 'forca-senha login-errors', invalid: 'true' }]);
		expect(target.querySelector('#login-errors')).not.toBeNull();
	});

	it('omits the error association when the field is valid', async () => {
		const received: ControlState[] = [];

		const target = await renderComponent(Field, {
			id: 'ordem',
			label: 'Ordem na coleção',
			help: 'Informe a ordem somente quando houver coleção.',
			control: createControl(received),
		});

		expect(received).toEqual([{ describedBy: 'ordem-help', invalid: undefined }]);
		expect(target.querySelector('#ordem-errors')).toBeNull();
	});

	it('leaves the control undescribed without help or errors', async () => {
		const received: ControlState[] = [];

		await renderComponent(Field, { id: 'titulo', label: 'Título', errors: [], control: createControl(received) });

		expect(received).toEqual([{ describedBy: undefined, invalid: undefined }]);
	});
});
