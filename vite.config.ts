import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		name: 'server',
		environment: 'node',
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		exclude: ['tests/**/*.svelte.{test,spec}.{js,ts}'],
		testTimeout: 10000,
	},
});
