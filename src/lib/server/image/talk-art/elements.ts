import type { FontWeight } from '#lib/server/image/text/fonts.js';
import type { ArtColor } from './palette';

export const ART_SIZE = 1080;
export const SAFE_MARGIN = 48;
export const CONTENT_LEFT = 72;
export const CONTENT_RIGHT = ART_SIZE - CONTENT_LEFT;
export const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;

export type ArtTextRole =
	| 'instituicao'
	| 'dia'
	| 'mes'
	| 'destaque'
	| 'titulo'
	| 'referencia'
	| 'rotuloPalestrante'
	| 'palestrante'
	| 'rotuloReuniao'
	| 'atividade'
	| 'local';

export type ArtTextBlock = {
	kind: 'text';
	role: ArtTextRole;
	lines: string[];
	x: number;
	top: number;
	size: number;
	lineHeight: number;
	weight: FontWeight;
	color: ArtColor;
	background: ArtColor;
	anchor: 'start' | 'middle';
	width: number;
};

export type ArtShape =
	| { kind: 'rect'; x: number; y: number; width: number; height: number; radius: number; fill: ArtColor }
	| { kind: 'circle'; cx: number; cy: number; radius: number; fill: ArtColor }
	| {
			kind: 'dots';
			x: number;
			y: number;
			columns: number;
			rows: number;
			spacing: number;
			radius: number;
			fill: ArtColor;
	  }
	| { kind: 'pin'; cx: number; cy: number; radius: number; fill: ArtColor; hole: ArtColor };

export type ArtPictureSource = 'logo' | 'photo';

export type ArtPicture = { kind: 'picture'; source: ArtPictureSource; cx: number; cy: number; radius: number };

export type ArtElement = ArtTextBlock | ArtShape | ArtPicture;

export type TalkArtLayout = { elements: ArtElement[] };

export type ArtSection = { elements: ArtElement[]; height: number };

export type StackItem = ArtSection & { gapBefore: number };

export const translateElement = (element: ArtElement, offset: number): ArtElement => {
	switch (element.kind) {
		case 'text':
			return { ...element, top: element.top + offset };
		case 'rect':
		case 'dots':
			return { ...element, y: element.y + offset };
		default:
			return { ...element, cy: element.cy + offset };
	}
};

export const stackItems = (items: StackItem[]): ArtSection =>
	items.reduce<ArtSection>(
		(stack, item) => {
			const top = stack.elements.length === 0 ? 0 : stack.height + item.gapBefore;
			const elements = item.elements.map((element) => translateElement(element, top));
			return { elements: [...stack.elements, ...elements], height: top + item.height };
		},
		{ elements: [], height: 0 },
	);
