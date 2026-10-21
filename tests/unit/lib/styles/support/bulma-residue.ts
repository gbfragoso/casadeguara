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

const BULMA_VARIABLE = /--bulma-[\w-]*/g;
const BULMA_MODIFIER = /^(?:is|has|are)-[^:]+$/;
const BULMA_COMPONENT_CLASSES = new Set([
	'box',
	'breadcrumb',
	'button',
	'buttons',
	'card',
	'checkbox',
	'column',
	'columns',
	'content',
	'control',
	'delete',
	'dropdown',
	'field',
	'file',
	'footer',
	'hero',
	'icon',
	'input',
	'label',
	'level',
	'media',
	'menu',
	'message',
	'modal',
	'navbar',
	'notification',
	'pagination',
	'panel',
	'progress',
	'radio',
	'section',
	'select',
	'subtitle',
	'tabs',
	'tag',
	'tags',
	'textarea',
	'title',
]);
// Captures static `class` attributes, `class={…}` expressions with one nested brace level and `classList` call arguments.
const CLASS_ATTRIBUTE = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^{}]*\})*)\})/g;
const CLASS_LIST_CALL = /\bclassList\.\w+\(([^)]*)\)/g;
const CLASS_DIRECTIVE = /\bclass:([\w-]+)/g;
// String literals that are not operands of an equality comparison, such as `type === 'file'`.
const STRING_LITERAL = /(?<![!=]=\s*)(["'`])((?:\\.|(?!\1)[^\\])*)\1(?!\s*[!=]=)/g;
const INTERPOLATION = /\{[^{}]*\}/g;

const literalText = (expression: string) => [...expression.matchAll(STRING_LITERAL)].map((match) => match[2]).join(' ');

const classTextOf = (match: RegExpMatchArray) => {
	const [, doubleQuoted, singleQuoted, expression] = match;
	if (expression !== undefined) return literalText(expression);
	return (doubleQuoted ?? singleQuoted ?? '').replace(INTERPOLATION, literalText);
};

const classTexts = (source: string) =>
	[
		...[...source.matchAll(CLASS_ATTRIBUTE)].map((match) => ({ index: match.index, text: classTextOf(match) })),
		...[...source.matchAll(CLASS_LIST_CALL)].map((match) => ({ index: match.index, text: literalText(match[1]) })),
		...[...source.matchAll(CLASS_DIRECTIVE)].map((match) => ({ index: match.index, text: match[1] })),
	].toSorted((first, second) => first.index - second.index);

const isBulmaClass = (token: string) => BULMA_MODIFIER.test(token) || BULMA_COMPONENT_CLASSES.has(token);

export const findBulmaVariables = (file: string, source: string) => findMatches(file, source, BULMA_VARIABLE);

export const findBulmaClasses = (file: string, source: string): ResidueViolation[] =>
	classTexts(source).flatMap(({ index, text }) =>
		text
			.split(/\s+/)
			.filter(isBulmaClass)
			.map((token) => ({ file, line: lineAt(source, index), excerpt: token })),
	);
