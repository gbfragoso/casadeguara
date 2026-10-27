import type { TextMeasurer } from '#lib/image/text/fit.js';
import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { ProgramColor } from './palette';

export type ProgramMeasurers = Record<FontWeight, TextMeasurer>;

export type ProgramTextRole =
	| 'dia'
	| 'diaSemana'
	| 'horario'
	| 'titulo'
	| 'observacao'
	| 'palestrante'
	| 'local'
	| 'instituicao'
	| 'cabecalho'
	| 'mes'
	| 'rodape'
	| 'geracao';

export type ProgramTextElement = {
	kind: 'text';
	role: ProgramTextRole;
	lines: string[];
	x: number;
	top: number;
	width: number;
	size: number;
	lineHeight: number;
	weight: FontWeight;
	color: ProgramColor;
	align: 'start' | 'center' | 'end';
};

export type ProgramRuleElement = {
	kind: 'rule';
	role: 'filete' | 'separador' | 'rodape';
	x: number;
	y: number;
	width: number;
	thickness: number;
	color: ProgramColor;
};

export type ProgramLogoElement = { kind: 'logo'; x: number; top: number; size: number };

export type ProgramElement = ProgramTextElement | ProgramRuleElement | ProgramLogoElement;

export type ProgramPageLayout = { elements: ProgramElement[] };

export type ProgramBlock = { elements: ProgramTextElement[]; height: number };

export type StackedText = { element: ProgramTextElement; gapBefore: number };

export const measureTextHeight = (element: ProgramTextElement) => element.lines.length * element.lineHeight;

export const translateBlock = (block: ProgramBlock, offset: number): ProgramTextElement[] =>
	block.elements.map((element) => ({ ...element, top: element.top + offset }));

export const stackTexts = (items: StackedText[]): ProgramBlock =>
	items.reduce<ProgramBlock>(
		(stack, { element, gapBefore }) => {
			const top = stack.elements.length === 0 ? 0 : stack.height + gapBefore;
			return { elements: [...stack.elements, { ...element, top }], height: top + measureTextHeight(element) };
		},
		{ elements: [], height: 0 },
	);
