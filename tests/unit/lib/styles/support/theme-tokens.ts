import { readFileSync } from 'node:fs';

import { readRgbChannels } from '../../../../support/contrast';

export type TokenMap = Readonly<Record<string, string>>;
export type ThemeTokens = { light: TokenMap; dark: TokenMap; darkOverrides: TokenMap };

export const THEME_STYLESHEET = 'src/lib/styles/theme.css';

const DECLARATION = /(--[\w-]+)\s*:\s*([^;]+);/g;
const VARIABLE_REFERENCE = /var\((--[\w-]+)\)/g;
const LIGHT_BLOCK_MARKER = '@theme static';
const DARK_BLOCK_MARKER = '@variant dark';
const DEGREES_PER_SEXTANT = 60;
const SEXTANTS_PER_TURN = 6;
const FULL_TURN_DEGREES = 360;
const GREEN_SEXTANT_OFFSET = 2;
const BLUE_SEXTANT_OFFSET = 4;

const readDeclarations = (block: string): TokenMap =>
	Object.fromEntries([...block.matchAll(DECLARATION)].map(([, name, value]) => [name, value.trim()]));

const findClosingBrace = (source: string, openingBrace: number) => {
	let depth = 0;
	for (let index = openingBrace; index < source.length; index += 1) {
		if (source[index] === '{') depth += 1;
		if (source[index] === '}') depth -= 1;
		if (depth === 0) return index;
	}
	throw new Error('Unclosed block in the theme stylesheet.');
};

const readBlockBody = (source: string, marker: string) => {
	const markerIndex = source.indexOf(marker);
	if (markerIndex < 0) throw new Error(`Block ${marker} not found in the theme stylesheet.`);
	const openingBrace = source.indexOf('{', markerIndex);
	return source.slice(openingBrace + 1, findClosingBrace(source, openingBrace));
};

export const parseThemeTokens = (source: string): ThemeTokens => {
	const light = readDeclarations(readBlockBody(source, LIGHT_BLOCK_MARKER));
	const darkOverrides = readDeclarations(readBlockBody(source, DARK_BLOCK_MARKER));
	return { light, dark: { ...light, ...darkOverrides }, darkOverrides };
};

export const readThemeTokens = () => parseThemeTokens(readFileSync(THEME_STYLESHEET, 'utf8'));

export const listReferencedTokens = (value: string) => [...value.matchAll(VARIABLE_REFERENCE)].map(([, name]) => name);

export const resolveToken = (tokens: TokenMap, name: string): string => {
	const value = tokens[name];
	if (value === undefined) throw new Error(`Token ${name} is not declared.`);
	const [reference, ...extraReferences] = listReferencedTokens(value);
	if (!reference) return value;
	if (extraReferences.length > 0) throw new Error(`Token ${name} is not a single color: ${value}.`);
	return resolveToken(tokens, reference);
};

export const resolveColor = (tokens: TokenMap, role: string) => resolveToken(tokens, `--color-${role}`);

const readHueSextant = (red: number, green: number, blue: number, max: number, delta: number) => {
	if (max === red) return ((green - blue) / delta) % SEXTANTS_PER_TURN;
	if (max === green) return (blue - red) / delta + GREEN_SEXTANT_OFFSET;
	return (red - green) / delta + BLUE_SEXTANT_OFFSET;
};

export const readHue = (hex: string) => {
	const [red, green, blue] = readRgbChannels(hex);
	const max = Math.max(red, green, blue);
	const delta = max - Math.min(red, green, blue);
	if (delta === 0) return 0;
	const sextant = readHueSextant(red, green, blue, max, delta);
	return (sextant * DEGREES_PER_SEXTANT + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;
};

export const measureHueDistance = (first: string, second: string) => {
	const distance = Math.abs(readHue(first) - readHue(second));
	return Math.min(distance, FULL_TURN_DEGREES - distance);
};
