import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import PhotoCropper from '$lib/components/image/PhotoCropper.svelte';
import PhotoSection from '$lib/components/image/PhotoSection.svelte';
import {
	getRenderedButton,
	getRenderedDiv,
	getRenderedInput,
	parseRenderedBody,
} from '../../../support/rendered-document';

describe('PhotoCropper', () => {
	it('renders an accessible crop region and typed position controls', () => {
		const { body } = render(PhotoCropper, {
			props: {
				src: 'foto/original',
				alt: 'Foto de Maria',
				initialPosition: { focalX: 0.63, focalY: 0.41, zoom: 1.35 },
				onCancel: () => undefined,
			},
		});
		const document = parseRenderedBody(body);
		const frame = getRenderedDiv(document, '[role="button"]');
		const zoom = getRenderedInput(document, 'input[type="range"]');
		const focalX = getRenderedInput(document, 'input[name="focalX"]');
		const focalY = getRenderedInput(document, 'input[name="focalY"]');
		const zoomValue = getRenderedInput(document, 'input[type="hidden"][name="zoom"]');

		expect(frame.getAttribute('aria-label')).toBe('Área de enquadramento da foto');
		expect(frame.getAttribute('aria-describedby')).toBe('photo-cropper-instructions');
		expect(document.querySelector('#photo-cropper-instructions')?.textContent).toContain('Use as setas do teclado');
		expect(zoom.getAttribute('aria-label')).toBe('Ampliação da foto');
		expect(focalX.value).toBe('0.63');
		expect(focalY.value).toBe('0.41');
		expect(zoomValue.value).toBe('1.35');
		expect(getRenderedButton(document, 'button[type="submit"]').textContent).toContain('Confirmar enquadramento');
		expect(document.querySelectorAll('button[type="button"]')).toHaveLength(2);
	});
});

describe('PhotoSection', () => {
	it('keeps the current photo visible while exposing lifecycle actions and status', () => {
		const { body } = render(PhotoSection, {
			props: { hasPhoto: true, alt: 'Foto de Maria', form: { operation: 'photoSaved', status: 200 } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('Cadastrada');
		expect(document.querySelector('img[alt="Foto de Maria"]')?.getAttribute('src')).toBe('foto');
		expect(document.querySelector('form[action="?/salvarFoto"]')).not.toBeNull();
		expect(document.querySelector('form[action="?/removerFoto"]')).not.toBeNull();
		expect(document.body.textContent).toContain('Incluir ou substituir foto');
		expect(document.body.textContent).toContain('Reenquadrar foto');
		expect(document.body.textContent).toContain('Remover foto');
		expect(document.querySelector('[role="status"]')?.textContent).toBe('Foto salva com sucesso!');
	});

	it('announces a validation error without hiding the pending state', () => {
		const { body } = render(PhotoSection, {
			props: {
				hasPhoto: false,
				alt: 'Foto de Maria',
				form: { operation: 'photoSaved', errors: { foto: ['Arquivo inválido.'] } },
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('Pendente');
		expect(document.querySelector('[role="alert"]')?.textContent).toContain('Arquivo inválido.');
		expect(document.querySelector('img[alt="Foto de Maria"]')).toBeNull();
	});

	it('announces each successful photo operation', () => {
		const reframed = parseRenderedBody(
			render(PhotoSection, {
				props: { hasPhoto: true, alt: 'Foto de Maria', form: { operation: 'photoReframed', status: 200 } },
			}).body,
		);
		const removed = parseRenderedBody(
			render(PhotoSection, {
				props: { hasPhoto: true, alt: 'Foto de Maria', form: { operation: 'photoRemoved', status: 200 } },
			}).body,
		);

		expect(reframed.querySelector('[role="status"]')?.textContent).toBe('Foto reenquadrada com sucesso!');
		expect(removed.querySelector('[role="status"]')?.textContent).toBe('Foto removida com sucesso!');
	});
});
