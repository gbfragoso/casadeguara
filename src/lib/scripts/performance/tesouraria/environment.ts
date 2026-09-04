import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { captureBuildEnvironment } from './bundle';

export function captureClientEnvironment(chromiumVersion: string) {
	const npmVersion = process.env.npm_config_user_agent?.match(/npm\/([^\s]+)/)?.[1] ?? 'unknown';
	const playwrightPackage = JSON.parse(
		readFileSync(resolve('node_modules/@playwright/test/package.json'), 'utf8'),
	) as { version: string };
	return {
		...captureBuildEnvironment(),
		npm: npmVersion,
		playwright: playwrightPackage.version,
		chromium: chromiumVersion,
	};
}
