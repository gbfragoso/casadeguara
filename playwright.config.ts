import { defineConfig } from '@playwright/test';
import { assertTestDatabase } from './tests/support/database';

assertTestDatabase();

const webServerEnv = Object.fromEntries(
	Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
);

export default defineConfig({
	timeout: 30_000,
	forbidOnly: true,
	fullyParallel: true,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	webServer: {
		command: 'npx vite dev --host 127.0.0.1',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: false,
		env: webServerEnv,
	},
	testMatch: '**/*.e2e.{ts,js}',
	use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
});
