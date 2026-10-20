import { readdir } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { captureFileName, captureScreen } from './capture';
import { capturesDirectory, EVIDENCE_LABEL } from './evidence';
import { PROPOSAL_PROTOTYPES, prototypeId, prototypesDirectory, prototypeUrl, readProposalVersion } from './proposal';
import type { CaptureViewport } from './types';
import { prototypeViewports } from './viewports';

const BASELINE_LABEL = 'linha-de-base';
const COUNTERPART_VIEWPORT: CaptureViewport = { width: 390, height: 844, scheme: 'light', media: 'screen' };

const pngFiles = async (directory: string) => (await readdir(directory)).filter((file) => file.endsWith('.png')).sort();

const expectedCaptureFiles = () =>
	PROPOSAL_PROTOTYPES.flatMap((prototype) =>
		prototypeViewports(prototype.print ?? false).map((viewport) => captureFileName(prototype, viewport)),
	).sort();

test.describe('capturas dos protótipos da proposta', () => {
	test.describe.configure({ mode: 'default' });
	test.skip(EVIDENCE_LABEL !== 'proposta', 'Os protótipos só são capturados com o rótulo proposta.');

	for (const prototype of PROPOSAL_PROTOTYPES) {
		test(`captura o protótipo ${prototypeId(prototype)}`, async ({ page }) => {
			const url = prototypeUrl(readProposalVersion(process.env.PROPOSTA), prototype);

			for (const viewport of prototypeViewports(prototype.print ?? false)) {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto(url);
				await captureScreen(page, prototype, viewport, EVIDENCE_LABEL);
			}
		});
	}

	test('E2E-LB03 — captura os protótipos da proposta', async () => {
		const version = readProposalVersion(process.env.PROPOSTA);
		const prototypeFiles = (await readdir(prototypesDirectory(version))).filter((file) => file.endsWith('.html'));

		const captures = await pngFiles(capturesDirectory(EVIDENCE_LABEL));

		expect(prototypeFiles.sort()).toEqual(
			PROPOSAL_PROTOTYPES.map((prototype) => `${prototypeId(prototype)}.html`).sort(),
		);
		expect(captures).toEqual(expectedCaptureFiles());
	});

	test('nomeia cada protótipo como a tela correspondente da linha de base', async () => {
		const baselineCaptures = new Set(await pngFiles(capturesDirectory(BASELINE_LABEL)));
		const counterparts = PROPOSAL_PROTOTYPES.filter((prototype) => prototype.baseline);

		const missing = counterparts.filter(
			(prototype) => !baselineCaptures.has(captureFileName(prototype, COUNTERPART_VIEWPORT)),
		);

		expect(counterparts.length).toBeGreaterThan(0);
		expect(missing).toEqual([]);
	});
});
