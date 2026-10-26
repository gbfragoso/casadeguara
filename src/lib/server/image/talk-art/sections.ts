import { createTextBlock, measureTextHeight, toTextItem, type ArtMeasurers } from './blocks';
import {
	ART_SIZE,
	CONTENT_LEFT,
	CONTENT_RIGHT,
	CONTENT_WIDTH,
	SAFE_MARGIN,
	stackItems,
	translateElement,
	type ArtElement,
	type ArtSection,
} from './elements';
import type { TalkArtContent } from './content';

const INSTITUTION_NAME = 'Grupo Espírita Casa de Guará';
const LOGO_SEAL_RADIUS = 44;
const LOGO_PADDING = 4;
const INSTITUTION_LEFT = CONTENT_LEFT + 2 * LOGO_SEAL_RADIUS + 20;
const INSTITUTION_WIDTH = 440;
const DATE_SEAL = { width: 180, height: 160, radius: 24, textInset: 12 };
const DATE_SEAL_LEFT = CONTENT_RIGHT - DATE_SEAL.width;
const DATE_SEAL_GAP = 24;
const SCHEDULE_TOP = 2 * LOGO_SEAL_RADIUS + 16;
const HEADER_DOTS = { x: 652, y: 12, columns: 8, rows: 3, spacing: 20, radius: 3 };
const REFERENCE_GAP = 12;
const CORNER_CIRCLE_RADIUS = 220;
export const FOOTER_HEIGHT = 120;
const FOOTER_TOP = ART_SIZE - FOOTER_HEIGHT;
const FOOTER_SAFE_BOTTOM = ART_SIZE - SAFE_MARGIN;
const PIN_RADIUS = 14;
const LOCATION_LEFT = CONTENT_LEFT + 2 * PIN_RADIUS + 16;

export const buildBackground = (): ArtElement[] => [
	{ kind: 'rect', x: 0, y: 0, width: ART_SIZE, height: ART_SIZE, radius: 0, fill: 'fundo' },
	{ kind: 'circle', cx: ART_SIZE, cy: 0, radius: CORNER_CIRCLE_RADIUS, fill: 'forma' },
];

const buildIdentification = (measurers: ArtMeasurers): ArtElement[] => {
	const name = createTextBlock('instituicao', INSTITUTION_NAME, measurers, {
		x: INSTITUTION_LEFT,
		width: INSTITUTION_WIDTH,
		background: 'fundo',
	});
	return [
		{
			kind: 'circle',
			cx: CONTENT_LEFT + LOGO_SEAL_RADIUS,
			cy: LOGO_SEAL_RADIUS,
			radius: LOGO_SEAL_RADIUS,
			fill: 'selo',
		},
		{
			kind: 'picture',
			source: 'logo',
			cx: CONTENT_LEFT + LOGO_SEAL_RADIUS,
			cy: LOGO_SEAL_RADIUS,
			radius: LOGO_SEAL_RADIUS - LOGO_PADDING,
		},
		translateElement(name, LOGO_SEAL_RADIUS - measureTextHeight(name) / 2),
	];
};

const buildDateSeal = ({ dia, mes }: TalkArtContent, measurers: ArtMeasurers): ArtElement[] => {
	const placement = {
		x: DATE_SEAL_LEFT + DATE_SEAL.width / 2,
		width: DATE_SEAL.width - 2 * DATE_SEAL.textInset,
		background: 'faixa',
		anchor: 'middle',
	} as const;
	const seal = stackItems([
		toTextItem(createTextBlock('dia', dia, measurers, placement)),
		toTextItem(createTextBlock('mes', mes, measurers, placement)),
	]);
	const { width, height, radius } = DATE_SEAL;
	return [
		{ kind: 'rect', x: DATE_SEAL_LEFT, y: 0, width, height, radius, fill: 'faixa' },
		...seal.elements.map((element) => translateElement(element, (height - seal.height) / 2)),
	];
};

export const buildHeader = (content: TalkArtContent, measurers: ArtMeasurers): ArtSection => {
	const schedule = createTextBlock('destaque', content.destaque, measurers, {
		x: CONTENT_LEFT,
		width: DATE_SEAL_LEFT - DATE_SEAL_GAP - CONTENT_LEFT,
		background: 'fundo',
	});
	return {
		elements: [
			{ kind: 'dots', ...HEADER_DOTS, fill: 'pontos' },
			...buildIdentification(measurers),
			...buildDateSeal(content, measurers),
			translateElement(schedule, SCHEDULE_TOP),
		],
		height: DATE_SEAL.height,
	};
};

export const buildTitleGroup = ({ titulo, referencia }: TalkArtContent, measurers: ArtMeasurers): ArtSection => {
	const placement = { x: CONTENT_LEFT, width: CONTENT_WIDTH, background: 'fundo' } as const;
	const title = toTextItem(createTextBlock('titulo', titulo, measurers, placement));
	if (!referencia) return stackItems([title]);
	return stackItems([
		title,
		toTextItem(createTextBlock('referencia', referencia, measurers, placement), REFERENCE_GAP),
	]);
};

export const buildFooter = (local: string, measurers: ArtMeasurers): ArtElement[] => {
	const location = createTextBlock('local', local, measurers, {
		x: LOCATION_LEFT,
		width: CONTENT_RIGHT - LOCATION_LEFT,
		background: 'faixa',
	});
	const height = measureTextHeight(location);
	const top = Math.min(FOOTER_TOP + (FOOTER_HEIGHT - height) / 2, FOOTER_SAFE_BOTTOM - height);
	return [
		{ kind: 'rect', x: 0, y: FOOTER_TOP, width: ART_SIZE, height: FOOTER_HEIGHT, radius: 0, fill: 'faixa' },
		{
			kind: 'pin',
			cx: CONTENT_LEFT + PIN_RADIUS,
			cy: top + height / 2,
			radius: PIN_RADIUS,
			fill: 'destaque',
			hole: 'faixa',
		},
		translateElement(location, top),
	];
};
