// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';
import { MEETING_ACTIVITY_MAX_LENGTH } from '#lib/validation/comunicacao/palestras.js';
import { MONDAY, readErrors, readInput, readMeetingActivities, renderNewTalk, submit } from './new-talk-card-support';
import { typeText } from './talk-fixtures';

describe('TU-30 NewTalkCard meeting activities', () => {
	it('prefills meeting activities with the default list, one per line', async () => {
		const { target } = await renderNewTalk();

		const field = readMeetingActivities(target);

		expect(field.value.split('\n')).toEqual(DEFAULT_MEETING_ACTIVITIES);
		expect(field.getAttribute('aria-describedby')).toBe('nova-palestra-reuniao-com-help');
		expect(target.querySelector('#nova-palestra-reuniao-com-help')?.textContent).toBe('Uma atividade por linha');
	});

	it('submits the edited meeting activities', async () => {
		const { target, context } = await renderNewTalk();
		const edited = DEFAULT_MEETING_ACTIVITIES.slice(1).join('\n');
		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);
		await typeText(readMeetingActivities(target), edited);

		await submit(target);

		await vi.waitFor(() =>
			expect(context.submit).toHaveBeenCalledWith('?/criar', expect.objectContaining({ reuniaoCom: edited })),
		);
	});

	it('shows a meeting activities validation error in the field', async () => {
		const { target, context } = await renderNewTalk();
		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);
		await typeText(readMeetingActivities(target), 'a'.repeat(MEETING_ACTIVITY_MAX_LENGTH + 1));

		await submit(target);

		expect(context.submit).not.toHaveBeenCalled();
		expect(readMeetingActivities(target).getAttribute('aria-invalid')).toBe('true');
		expect(readErrors(target, 'nova-palestra-reuniao-com')).toBe('Cada atividade deve ter até 32 caracteres.');
	});
});
