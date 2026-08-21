import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run dev', port: 5173 },
	testMatch: '**/*.e2e.{ts,js}',
	workers: 1,
});
