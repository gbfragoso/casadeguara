// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import TalkProgramAction from '#lib/components/talks/TalkProgramAction.svelte';
import { renderComponent } from '../support/render-component.js';

describe('TalkProgramAction', () => {
	it('opens the program dialog of the current months', async () => {
		const target = await renderComponent(TalkProgramAction, { hoje: '2026-10-27' });

		const action = [...target.querySelectorAll('button')].find(
			(button) => button.textContent?.trim() === 'Programação do mês',
		);
		const dialog = document.getElementById(action?.getAttribute('popovertarget') ?? '');
		expect(dialog?.getAttribute('role')).toBe('dialog');
		expect(dialog?.textContent).toContain('Novembro de 2026');
	});
});
