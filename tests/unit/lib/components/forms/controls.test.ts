// @vitest-environment happy-dom
import { createAttachmentKey } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';

import Checkbox from '#lib/components/forms/Checkbox.svelte';
import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
import FieldAddons from '#lib/components/forms/FieldAddons.svelte';
import FieldGroup from '#lib/components/forms/FieldGroup.svelte';
import Radio from '#lib/components/forms/Radio.svelte';
import Select from '#lib/components/forms/Select.svelte';
import TextArea from '#lib/components/forms/TextArea.svelte';
import TextInput from '#lib/components/forms/TextInput.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

const options = htmlSnippet('<option value="entrada">Entrada</option>');

describe('form controls', () => {
	it('forwards the attributes and attachments to the native input', async () => {
		const attach = vi.fn();

		const target = await renderComponent(TextInput, {
			id: 'tombo',
			name: 'tombo',
			type: 'number',
			value: '1001',
			required: true,
			'aria-invalid': 'true',
			'aria-describedby': 'tombo-errors',
			[createAttachmentKey()]: attach,
		});

		const input = getElement(target, 'input', HTMLInputElement);
		expect([input.id, input.name, input.type, input.value, input.required]).toEqual([
			'tombo',
			'tombo',
			'number',
			'1001',
			true,
		]);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('tombo-errors');
		expect(attach).toHaveBeenCalledWith(input);
	});

	it('renders a file input for photo uploads', async () => {
		const target = await renderComponent(TextInput, { id: 'foto', name: 'foto', type: 'file', accept: 'image/*' });

		const input = getElement(target, '#foto', HTMLInputElement);

		expect(input.type).toBe('file');
		expect(input.accept).toBe('image/*');
	});

	it('forwards the attributes and the selected value to the native select', async () => {
		const target = await renderComponent(Select, {
			id: 'tipo',
			name: 'tipo',
			value: 'entrada',
			required: true,
			'aria-describedby': 'tipo-help',
			children: options,
		});

		const select = getElement(target, 'select', HTMLSelectElement);
		expect([select.id, select.name, select.value, select.required, select.multiple]).toEqual([
			'tipo',
			'tipo',
			'entrada',
			true,
			false,
		]);
		expect(select.getAttribute('aria-describedby')).toBe('tipo-help');
	});

	it('renders a multiple select without the closed-select icon', async () => {
		const target = await renderComponent(Select, {
			id: 'autores',
			name: 'autores',
			multiple: true,
			children: options,
		});

		const select = getElement(target, 'select', HTMLSelectElement);

		expect(select.multiple).toBe(true);
		expect(target.querySelector('[aria-hidden="true"]')).toBeNull();
	});

	it('forwards the attributes and the value to the native textarea', async () => {
		const target = await renderComponent(TextArea, {
			id: 'descricao',
			name: 'descricao',
			value: 'Doação de livros',
			required: true,
			'aria-invalid': 'true',
		});

		const textarea = getElement(target, 'textarea', HTMLTextAreaElement);
		expect([textarea.id, textarea.name, textarea.value, textarea.required]).toEqual([
			'descricao',
			'descricao',
			'Doação de livros',
			true,
		]);
		expect(textarea.getAttribute('aria-invalid')).toBe('true');
	});

	it.each([
		['checkbox', Checkbox],
		['radio', Radio],
	] as const)('associates the label with the %s control', async (type, component) => {
		const target = await renderComponent(component, {
			id: 'confirmado',
			name: 'confirmado',
			value: 'sim',
			checked: true,
			children: htmlSnippet('<span>Depósito confirmado</span>'),
		});

		const input = getElement(target, `input[type="${type}"]`, HTMLInputElement);
		expect([input.name, input.value, input.checked]).toEqual(['confirmado', 'sim', true]);
		expect(input.labels?.[0]?.textContent?.trim()).toBe('Depósito confirmado');
	});

	it.each([
		['ChoiceGroup', ChoiceGroup],
		['FieldGroup', FieldGroup],
		['FieldAddons', FieldAddons],
	] as const)('renders %s as one container with the forwarded attributes', async (_name, component) => {
		const target = await renderComponent(component, {
			role: 'radiogroup',
			'aria-label': 'Tipo de lançamento',
			children: htmlSnippet('<span>Todos</span>'),
		});

		const group = getElement(target, '[role="radiogroup"]', HTMLDivElement);

		expect(group.getAttribute('aria-label')).toBe('Tipo de lançamento');
		expect(group.textContent).toBe('Todos');
	});
});
