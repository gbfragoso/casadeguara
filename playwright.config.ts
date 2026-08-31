import { defineConfig } from '@playwright/test';
import { assertTestDatabase } from './tests/support/database';

assertTestDatabase();

export default defineConfig({
	timeout: 30_000,
	forbidOnly: true,
	fullyParallel: true,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	trace: 'retain-on-failure',
	webServer: {
		command: 'npx vite dev --host 127.0.0.1',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: false,
		env: { ...process.env },
	},
	testMatch: '**/*.e2e.{ts,js}',
	use: { baseURL: 'http://127.0.0.1:5173' },
});
