import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

import { listFiles } from './bulma-residue';

export const TOKEN_SOURCE = 'src/lib/styles/theme.css';

const MARKUP_EXTENSIONS = new Set(['.svelte', '.css']);
const COMPONENTS_ROOT = 'src/lib/components/';
// Hex colors not preceded by `&` (HTML entities) or a word character, and CSS color functions.
const COLOR_LITERAL = /(?<![&\w])#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/gi;

export type ColorLiteral = { file: string; line: number; excerpt: string };

const toPosix = (file: string) => file.replaceAll('\\', '/');

const isColorScanned = (file: string) => {
	if (file === TOKEN_SOURCE) return false;
	if (MARKUP_EXTENSIONS.has(extname(file))) return true;
	return file.startsWith(COMPONENTS_ROOT) && extname(file) === '.ts';
};

export const findColorLiterals = (file: string, source: string): ColorLiteral[] =>
	[...source.matchAll(COLOR_LITERAL)].map((match) => ({
		file,
		line: source.slice(0, match.index).split('\n').length,
		excerpt: match[0],
	}));

export const listColorScannedFiles = (root: string) => listFiles(root).map(toPosix).filter(isColorScanned);

export const findSourceColorLiterals = (root: string) =>
	listColorScannedFiles(root).flatMap((file) => findColorLiterals(file, readFileSync(file, 'utf8')));
