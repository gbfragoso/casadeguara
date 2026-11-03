import { expect, test } from './fixtures';
import { openModulePage, shellRegions } from './support/module-shell';

const AREAS_WITHOUT_USER_SCREENS = ['/biblioteca', '/secretaria', '/comunicacao/palestras'];
const REMOVED_USER_PATHS = ['biblioteca', 'secretaria', 'comunicacao'].flatMap((area) => [
	`/${area}/usuarios`,
	`/${area}/usuarios/novo`,
	`/${area}/usuarios/abc123`,
]);

test.describe('telas de usuários removidas dos módulos', () => {
	for (const path of AREAS_WITHOUT_USER_SCREENS) {
		test(`E2E-04 esconde Usuários do menu lateral da coordenação em ${path}`, async ({ page, e2e }) => {
			await openModulePage(page, e2e, path);

			const { sidebar } = shellRegions(page);

			await expect(sidebar.getByRole('link').first()).toBeAttached();
			await expect(sidebar.getByRole('link', { name: 'usuários' })).toHaveCount(0);
		});
	}

	for (const path of REMOVED_USER_PATHS) {
		test(`E2E-04 responde 404 no endereço antigo ${path}`, async ({ page, e2e }) => {
			await e2e.authenticate(page, 'fullAdmin');

			const response = await page.goto(path);

			expect(response?.status()).toBe(404);
		});
	}
});
