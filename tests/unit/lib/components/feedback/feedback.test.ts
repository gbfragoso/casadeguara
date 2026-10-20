// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
import Progress from '#lib/components/feedback/Progress.svelte';
import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';
import Tag from '#lib/components/feedback/Tag.svelte';
import Tags from '#lib/components/feedback/Tags.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('InlineNotification', () => {
	it('forwards the element and semantics to the rendered notification', async () => {
		const target = await renderComponent(InlineNotification, {
			kind: 'danger',
			element: 'p',
			role: 'alert',
			'aria-live': 'assertive',
			id: 'autores-erro',
			children: htmlSnippet('<span>Selecione ou cadastre ao menos um autor.</span>'),
		});

		const notification = getElement(target, 'p#autores-erro', HTMLParagraphElement);
		expect(notification.getAttribute('role')).toBe('alert');
		expect(notification.getAttribute('aria-live')).toBe('assertive');
		expect(notification.textContent?.trim()).toBe('Selecione ou cadastre ao menos um autor.');
	});

	it('renders a div by default with a decorative icon', async () => {
		const target = await renderComponent(InlineNotification, {
			kind: 'success',
			id: 'aviso',
			children: htmlSnippet('<span>Livro cadastrado com sucesso.</span>'),
		});

		const notification = getElement(target, 'div#aviso', HTMLDivElement);

		expect(notification.querySelector('i[aria-hidden="true"]')).not.toBeNull();
	});
});

describe('Tag', () => {
	it.each([
		[{ kind: 'success' as const }],
		[{ kind: 'warning' as const, light: true, size: 'medium' as const }],
		[{}],
	])('renders the tag text with the forwarded attributes for %o', async (style) => {
		const target = await renderComponent(Tag, {
			...style,
			'aria-live': 'polite',
			children: htmlSnippet('<span>Cadastrada</span>'),
		});

		const tag = getElement(target, '[aria-live="polite"]', HTMLSpanElement);

		expect(tag.textContent?.trim()).toBe('Cadastrada');
	});

	it('groups tags in one container', async () => {
		const target = await renderComponent(Tags, {
			id: 'situacoes',
			children: htmlSnippet('<span>Disponível</span>'),
		});

		expect(getElement(target, '#situacoes', HTMLDivElement).textContent).toBe('Disponível');
	});
});

describe('Progress', () => {
	it('exposes the value and maximum of the native progress bar', async () => {
		const target = await renderComponent(Progress, { value: 60, max: 100, 'aria-label': 'Força da senha' });

		const progress = getElement(target, 'progress', HTMLProgressElement);

		expect([progress.value, progress.max]).toEqual([60, 100]);
		expect(progress.getAttribute('aria-label')).toBe('Força da senha');
	});
});

describe('SkeletonLines', () => {
	it('hides the loading placeholder from assistive technology', async () => {
		const target = await renderComponent(SkeletonLines, { lines: 3, size: 'large', tone: 'highlight' });

		const skeleton = getElement(target, 'div', HTMLDivElement);

		expect(skeleton.getAttribute('aria-hidden')).toBe('true');
		expect(skeleton.children).toHaveLength(3);
	});
});
