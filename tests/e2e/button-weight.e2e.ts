import { expect, test } from './fixtures';
import { openModulePage } from './support/module-shell';

const BOLD_WEIGHT = '700';

test('exibe em negrito os botões de ação marcados como bold', async ({ page, e2e }) => {
	await openModulePage(page, e2e, '/biblioteca/livros');

	const search = page.getByRole('button', { name: 'Pesquisar' });

	await expect(search).toHaveCSS('font-weight', BOLD_WEIGHT);
});
