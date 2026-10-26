// @vitest-environment happy-dom
import { flushSync, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/palestrantes/[id=integer]/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

const SPEAKER_INSTRUCTIONS =
	'Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá na foto do palestrante.';

const speaker = { id: 4, nome: 'Carmélia Amorim', temFoto: true, importado: true, fotoVersao: 'v1' };

const renderSpeaker = (isAdmin: boolean, form: ComponentProps<typeof Page>['form'] = null) =>
	renderComponent(Page, { data: { palestrante: speaker, isAdmin }, form });

const readAspectRatio = (element: Element | null) =>
	Number(/aspect-ratio:\s*([\d.]+)/.exec(element?.getAttribute('style') ?? '')?.[1]);

const findButton = (target: HTMLElement, label: string) =>
	[...target.querySelectorAll('button')].find((button) => button.textContent?.trim() === label);

describe('speaker page', () => {
	it('CA-27 shows the square photo and reframes it in a square editor', async () => {
		const target = await renderSpeaker(false);

		target.querySelector<HTMLButtonElement>('#reenquadrar-foto')?.click();
		flushSync();

		const photo = target.querySelector('img[alt="Foto de Carmélia Amorim"]');
		const frame = target.querySelector('[aria-label="Área de enquadramento da foto"]');
		expect(photo?.getAttribute('src')).toBe('/comunicacao/palestrantes/4/foto?versao=v1');
		expect(readAspectRatio(photo)).toBe(1);
		expect(readAspectRatio(frame)).toBe(1);
		expect(target.querySelector('#photo-cropper-instructions')?.textContent).toBe(SPEAKER_INSTRUCTIONS);
	});

	it('CA-04 hides the deletion from the volunteer', async () => {
		const target = await renderSpeaker(false);

		expect(findButton(target, 'Excluir palestrante')).toBeUndefined();
		expect(target.querySelector('form[action="?/excluir"]')).toBeNull();
	});

	it('CA-04 offers the deletion with confirmation to the coordination', async () => {
		const target = await renderSpeaker(true);

		const dialog = target.querySelector('[role="dialog"]');
		expect(findButton(target, 'Excluir palestrante')?.getAttribute('popovertarget')).toBe(dialog?.id);
		expect(dialog?.textContent).toContain('Confirma a exclusão do palestrante “Carmélia Amorim”?');
	});

	it('explains why a speaker in use was not deleted', async () => {
		const mensagem = 'Este palestrante está em 3 palestras e não pode ser excluído.';

		const target = await renderSpeaker(true, { mensagem });

		expect(target.querySelector('[role="alert"]')?.textContent?.trim()).toBe(mensagem);
	});

	it('edits the name and marks an imported speaker', async () => {
		const target = await renderSpeaker(false);

		expect(target.querySelector<HTMLInputElement>('input[name="nome"]')?.value).toBe('Carmélia Amorim');
		expect(target.textContent).toContain('Importado do cadastro');
	});

	it('shows the name error next to the field', async () => {
		const target = await renderSpeaker(false, {
			values: { nome: 'Paulo' },
			errors: { nome: ['Já existe um palestrante com esse nome.'] },
		});

		expect(target.querySelector('#nome-errors')?.textContent).toContain('Já existe um palestrante com esse nome.');
		expect(target.querySelector('input[name="nome"]')?.getAttribute('aria-invalid')).toBe('true');
	});

	it('confirms a saved name', async () => {
		const target = await renderSpeaker(false, { status: 200 });

		expect(target.querySelector('[role="status"]')?.textContent?.trim()).toBe('Nome salvo com sucesso!');
	});
});
