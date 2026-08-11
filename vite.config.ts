import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		environment: 'node',
		testTimeout: 10_000,
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: [
				// Declarações de tipos são apagadas em tempo de execução.
				'src/**/*.d.ts',
				// Arquivos de teste não são comportamento da aplicação em produção.
				'src/**/*.{test,spec,e2e}.{js,ts}',
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
				},
			},
		],
	},
});
