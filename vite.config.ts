import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import type { ViteDevServer } from 'vite';

function treasuryChartProofPlugin() {
	return {
		name: 'treasury-chart-proof-fixture',
		apply: 'serve' as const,
		configureServer(server: ViteDevServer) {
			if (process.env.NODE_ENV !== 'test') return;
			const entry = `/@fs/${resolve('tests/e2e/chart-proof/main.ts').replaceAll('\\', '/')}`;
			server.middlewares.use('/__test/tesouraria-chart', (request, response, next) => {
				if (request.method !== 'GET' || (request.url !== '/' && request.url !== '')) return next();
				response.statusCode = 200;
				response.setHeader('content-type', 'text/html');
				response.end(
					`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Chart proof</title></head><body><main id="proof-target"></main><script type="module" src="${entry}"></script></body></html>`,
				);
			});
		},
	};
}

export default defineConfig({
	plugins: [sveltekit(), treasuryChartProofPlugin()],
	server: {
		hmr: process.env.NODE_ENV !== 'test',
		fs: { allow: [resolve('.')] },
	},
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true,
			},
		},
	},
	resolve: {
		conditions: process.env.VITEST ? ['browser'] : undefined,
	},

	test: {
		environment: 'node',
		testTimeout: 10_000,
		coverage: {
			provider: 'v8',
			include: [],
			exclude: [
				// Declarações de tipos são apagadas em tempo de execução.
				'src/**/*.d.ts',
				// Arquivos de teste não são comportamento da aplicação em produção.
				'src/**/*.{test,spec,e2e}.{js,ts}',
				// Scripts de suporte ao desenvolvimento não são comportamento da aplicação em produção.
				'src/lib/scripts/**/*.js',
			],
			thresholds: {
				perFile: true,
				lines: 80,
				branches: 80,
				functions: 80,
				statements: 80,
			},
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
				},
			},
			{
				extends: true,
				test: {
					name: 'integration',
					include: ['tests/integration/**/*.{test,spec}.{js,ts}'],
					setupFiles: ['tests/integration/setup.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'performance',
					include: [
						'src/lib/scripts/performance/books/**/*.performance.test.ts',
						'src/lib/scripts/performance/tesouraria/**/*.performance.test.ts',
					],
					setupFiles: ['tests/integration/setup.ts'],
					testTimeout: 120_000,
				},
			},
		],
	},
});
