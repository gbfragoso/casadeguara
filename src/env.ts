import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	POSTGRES_URL: {
		schema: (value) => {
			if (!value) throw new Error('POSTGRES_URL is not set');
			return value;
		},
	},
	NODE_ENV: {
		schema: (value) => value,
	},
});
