import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import PhotoCropper from '$lib/components/image/PhotoCropper.svelte';
import PhotoSection from '$lib/components/image/PhotoSection.svelte';

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

		expect(body).toContain('role="button"');
		expect(body).toContain('Área de enquadramento da foto');
		expect(body).toContain('Use as setas do teclado');
		expect(body).toContain('type="range"');
		expect(body).toContain('aria-label="Ampliação da foto"');
		expect(body).toContain('name="focalX" value="0.63"');
		expect(body).toContain('name="focalY" value="0.41"');
		expect(body).toContain('name="zoom" value="1.35"');
		expect(body).toContain('Redefinir enquadramento');
		expect(body).toContain('Confirmar enquadramento');
		expect(body).toContain('Cancelar');
	});
});

describe('PhotoSection', () => {
	it('keeps the current photo visible while exposing lifecycle actions and status', () => {
		const { body } = render(PhotoSection, {
			props: {
				hasPhoto: true,
				alt: 'Foto de Maria',
				form: { operation: 'photoSaved', status: 200 },
			},
		});

		expect(body).toContain('Cadastrada');
		expect(body).toContain('src="foto"');
		expect(body).toContain('Incluir ou substituir foto');
		expect(body).toContain('Reenquadrar foto');
		expect(body).toContain('Remover foto');
		expect(body).toContain('Foto salva com sucesso!');
		expect(body).toContain('action="?/salvarFoto"');
		expect(body).toContain('action="?/removerFoto"');
	});

	it('announces a validation error without hiding the pending state', () => {
		const { body } = render(PhotoSection, {
			props: {
				hasPhoto: false,
				alt: 'Foto de Maria',
				form: { operation: 'photoSaved', errors: { foto: ['Arquivo inválido.'] } },
			},
		});

		expect(body).toContain('Pendente');
		expect(body).toContain('role="alert"');
		expect(body).toContain('Arquivo inválido.');
		expect(body).not.toContain('src="foto"');
	});

	it('announces each successful photo operation', () => {
		const reframed = render(PhotoSection, {
			props: { hasPhoto: true, alt: 'Foto de Maria', form: { operation: 'photoReframed', status: 200 } },
		});
		const removed = render(PhotoSection, {
			props: { hasPhoto: true, alt: 'Foto de Maria', form: { operation: 'photoRemoved', status: 200 } },
		});

		expect(reframed.body).toContain('Foto reenquadrada com sucesso!');
		expect(removed.body).toContain('Foto removida com sucesso!');
	});
});
