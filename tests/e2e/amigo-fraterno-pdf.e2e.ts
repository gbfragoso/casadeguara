import { test, expect, waitForHydration } from './fixtures';

import { getPdfPageCount } from './amigo-fraterno-support';

const photoSizes = [
	{ width: 1200, height: 400 },
	{ width: 400, height: 1200 },
	{ width: 700, height: 700 },
] as const;

const createEligibleParticipants = async (e2e: import('./fixtures').E2EData, count: number) => {
	return Promise.all(
		Array.from({ length: count }, async (_, index) => {
			const participant = await e2e.createParticipant(
				`pdf-${index}`,
				index < photoSizes.length,
				photoSizes[index],
			);
			await e2e.setAmigoFraterno(participant.id, true);
			return participant;
		}),
	);
};

test('E2E-13 downloads a paginated PDF with varied and missing photos', async ({ page, e2e }) => {
	await createEligibleParticipants(e2e, 7);
	await e2e.authenticate(page);
	await page.goto('/secretaria/amigofraterno');
	await waitForHydration(page);
	await page.getByLabel('Data do próximo sorteio').fill('2026-11-22');
	const responsePromise = page.waitForResponse(
		(response) => new URL(response.url()).pathname === '/secretaria/amigofraterno/pdf',
	);
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Baixar cartões em PDF' }).click();
	const response = await responsePromise;
	expect(response.ok()).toBe(true);
	const download = await downloadPromise;
	const stream = await download.createReadStream();
	if (!stream) throw new Error('Download do PDF não foi iniciado.');
	const chunks: Buffer[] = [];
	for await (const chunk of stream) chunks.push(chunk);
	expect(await getPdfPageCount(Buffer.concat(chunks))).toBe(2);
});

test('E2E-14 requires a valid draw date before generating the PDF', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('data-invalida');
	await e2e.setAmigoFraterno(participant.id, true);
	await e2e.authenticate(page);
	await page.goto('/secretaria/amigofraterno');
	await waitForHydration(page);
	await expect(page.getByLabel('Data do próximo sorteio')).toHaveAttribute('required', '');
	const response = await page.request.get('/secretaria/amigofraterno/pdf?nextDrawDate=2026-02-29');
	expect(response.status()).toBe(400);
});
