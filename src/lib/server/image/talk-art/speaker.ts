import { createTextBlock, createUniformBlocks, toTextItem, type ArtMeasurers } from './blocks';
import {
	ART_SIZE,
	SAFE_MARGIN,
	stackItems,
	translateElement,
	type ArtElement,
	type ArtSection,
	type ArtTextBlock,
	type StackItem,
} from './elements';
import type { TalkArtContent } from './content';

const CARD = {
	left: SAFE_MARGIN,
	width: ART_SIZE - 2 * SAFE_MARGIN,
	horizontalPadding: 32,
	verticalPadding: 24,
	radius: 28,
	stripeWidth: 10,
};
const PHOTO_RADIUS = 112;
const RING_WIDTH = 8;
const LOGO_PADDING = 8;
const OUTER_RADIUS = PHOTO_RADIUS + RING_WIDTH;
const PHOTO_CENTER_X = CARD.left + CARD.stripeWidth + CARD.horizontalPadding + OUTER_RADIUS;
const COLUMN_LEFT = PHOTO_CENTER_X + OUTER_RADIUS + 32;
const COLUMN_WIDTH = CARD.left + CARD.width - CARD.horizontalPadding - COLUMN_LEFT;
const BULLET_RADIUS = 5;
const BULLET_INDENT = 24;
const NAME_GAP = 4;
const MEETING_GAP = 16;
const LABEL_GAP = 8;
const SPEAKER_LABEL = 'Palestrante:';
const MEETING_LABEL = 'Reunião com:';

const columnPlacement = { x: COLUMN_LEFT, width: COLUMN_WIDTH, background: 'cartao' } as const;

const buildCard = (height: number): ArtElement[] => [
	{ kind: 'rect', x: CARD.left, y: 0, width: CARD.width, height, radius: CARD.radius, fill: 'cartao' },
	{
		kind: 'rect',
		x: CARD.left,
		y: CARD.radius,
		width: CARD.stripeWidth,
		height: height - 2 * CARD.radius,
		radius: 0,
		fill: 'destaque',
	},
];

const buildPortrait = (hasPhoto: boolean, centerY: number): ArtElement[] => {
	const ring: ArtElement = {
		kind: 'circle',
		cx: PHOTO_CENTER_X,
		cy: centerY,
		radius: OUTER_RADIUS,
		fill: 'destaque',
	};
	if (hasPhoto)
		return [ring, { kind: 'picture', source: 'photo', cx: PHOTO_CENTER_X, cy: centerY, radius: PHOTO_RADIUS }];
	return [
		ring,
		{ kind: 'circle', cx: PHOTO_CENTER_X, cy: centerY, radius: PHOTO_RADIUS, fill: 'selo' },
		{ kind: 'picture', source: 'logo', cx: PHOTO_CENTER_X, cy: centerY, radius: PHOTO_RADIUS - LOGO_PADDING },
	];
};

const toActivityItem = (block: ArtTextBlock): StackItem => ({
	elements: [
		{
			kind: 'circle',
			cx: COLUMN_LEFT + BULLET_RADIUS,
			cy: block.lineHeight / 2,
			radius: BULLET_RADIUS,
			fill: 'destaque',
		},
		block,
	],
	height: block.lineHeight,
	gapBefore: 0,
});

const buildMeetingItems = (activities: string[], measurers: ArtMeasurers): StackItem[] => {
	if (activities.length === 0) return [];
	const label = createTextBlock('rotuloReuniao', MEETING_LABEL, measurers, columnPlacement);
	const blocks = createUniformBlocks('atividade', activities, measurers, {
		...columnPlacement,
		x: COLUMN_LEFT + BULLET_INDENT,
		width: COLUMN_WIDTH - BULLET_INDENT,
	});
	const [first, ...rest] = blocks.map(toActivityItem);
	return [toTextItem(label, MEETING_GAP), { ...first, gapBefore: LABEL_GAP }, ...rest];
};

const buildColumn = ({ palestrante, atividades }: TalkArtContent, measurers: ArtMeasurers) =>
	stackItems([
		toTextItem(createTextBlock('rotuloPalestrante', SPEAKER_LABEL, measurers, columnPlacement)),
		toTextItem(createTextBlock('palestrante', palestrante, measurers, columnPlacement), NAME_GAP),
		...buildMeetingItems(atividades, measurers),
	]);

export const buildSpeakerSection = (content: TalkArtContent, measurers: ArtMeasurers): ArtSection => {
	const column = buildColumn(content, measurers);
	const contentHeight = Math.max(2 * OUTER_RADIUS, column.height);
	const height = contentHeight + 2 * CARD.verticalPadding;
	const columnTop = CARD.verticalPadding + (contentHeight - column.height) / 2;
	return {
		elements: [
			...buildCard(height),
			...buildPortrait(content.foto !== null, height / 2),
			...column.elements.map((element) => translateElement(element, columnTop)),
		],
		height,
	};
};
