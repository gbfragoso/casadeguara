import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

export const FORBIDDEN_PACKAGES = ['bulma', 'sass', 'sass-embedded'];

const SASS_EXTENSIONS = new Set(['.scss', '.sass']);
const SCANNED_EXTENSIONS = new Set(['.svelte', '.ts', '.js', '.css', '.html']);
const SASS_STYLE_BLOCK = /<style\b[^>]*\blang\s*=\s*["'](?:scss|sass)["']/g;
// Module specifiers mentioning bulma after Sass/CSS at-rules, ESM imports (static, `from` or dynamic) and require().
const BULMA_IMPORT =
	/(?:@use|@import|@forward|\bfrom|\bimport|\brequire)\s*(?:\(\s*)?(?:url\(\s*)?["'][^"']*\bbulma\b[^"']*["']/g;

export interface ResidueViolation {
	file: string;
	line: number;
	excerpt: string;
}

type PackageManifest = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

export const findForbiddenPackages = (manifest: PackageManifest) => {
	const declared = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
	return declared.filter((name) => FORBIDDEN_PACKAGES.includes(name));
};

export const isSassStylesheet = (file: string) => SASS_EXTENSIONS.has(extname(file));

const lineAt = (source: string, index: number) => source.slice(0, index).split('\n').length;

const findMatches = (file: string, source: string, pattern: RegExp): ResidueViolation[] =>
	[...source.matchAll(pattern)].map((match) => ({ file, line: lineAt(source, match.index), excerpt: match[0] }));

export const findSassStyleBlocks = (file: string, source: string) => findMatches(file, source, SASS_STYLE_BLOCK);

export const findBulmaImports = (file: string, source: string) => findMatches(file, source, BULMA_IMPORT);

export const listFiles = (root: string) =>
	readdirSync(root, { recursive: true, encoding: 'utf8' }).map((relativePath) => join(root, relativePath));

export const readScannedSources = (files: readonly string[]) =>
	files
		.filter((file) => SCANNED_EXTENSIONS.has(extname(file)))
		.map((file) => ({ file, source: readFileSync(file, 'utf8') }));
