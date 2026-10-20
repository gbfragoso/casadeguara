import { readdir } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { captureFileName, captureScreen } from './capture';
import { capturesDirectory, EVIDENCE_LABEL } from './evidence';
import { EXPECTED_CAPTURE_COUNT, REPRESENTATIVE_SCREENS } from './screens';
import { runInState } from './screen-session';
import { readBaselineSeed } from './seed/state';
import { captureViewports } from './viewports';

const expectedCaptureFiles = () =>
	REPRESENTATIVE_SCREENS.flatMap((screen) =>
		screen.states.flatMap((state) =>
			captureViewports(screen, state).map((viewport) =>
				captureFileName({ screenId: screen.id, stateId: state.id }, viewport),
			),
		),
	).sort();

test.describe('capturas da matriz representativa', () => {
	test.describe.configure({ mode: 'default' });
	test.skip(EVIDENCE_LABEL !== 'linha-de-base', 'Os protótipos da proposta são capturados pelo E2E-LB03.');

	for (const screen of REPRESENTATIVE_SCREENS) {
		test(`captura ${screen.id}`, async ({ browser }) => {
			const seed = await readBaselineSeed();

			for (const state of screen.states) {
				const viewports = captureViewports(screen, state);
				await runInState(browser, { screen, state, seed }, viewports[0], async (page) => {
					for (const viewport of viewports) {
						await captureScreen(page, { screenId: screen.id, stateId: state.id }, viewport, EVIDENCE_LABEL);
					}
				});
			}
		});
	}

	test('E2E-LB01 — gera as capturas da matriz', async () => {
		const expected = expectedCaptureFiles();

		const files = (await readdir(capturesDirectory(EVIDENCE_LABEL))).filter((file) => file.endsWith('.png')).sort();

		expect(expected).toHaveLength(EXPECTED_CAPTURE_COUNT);
		expect(files).toEqual(expected);
	});
});
