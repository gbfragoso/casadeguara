import type { ArtElement, ArtTextBlock } from '#lib/server/image/talk-art/elements.js';

export type Box = { left: number; top: number; right: number; bottom: number };

const PIN_TIP_RATIO = 1.7;

const circleBox = (cx: number, cy: number, radius: number): Box => ({
	left: cx - radius,
	top: cy - radius,
	right: cx + radius,
	bottom: cy + radius,
});

const textBox = (block: ArtTextBlock): Box => {
	const left = block.anchor === 'middle' ? block.x - block.width / 2 : block.x;
	return {
		left,
		top: block.top,
		right: left + block.width,
		bottom: block.top + block.lines.length * block.lineHeight,
	};
};

export const boundsOf = (element: ArtElement): Box => {
	switch (element.kind) {
		case 'text':
			return textBox(element);
		case 'rect':
			return {
				left: element.x,
				top: element.y,
				right: element.x + element.width,
				bottom: element.y + element.height,
			};
		case 'dots':
			return {
				left: element.x - element.radius,
				top: element.y - element.radius,
				right: element.x + (element.columns - 1) * element.spacing + element.radius,
				bottom: element.y + (element.rows - 1) * element.spacing + element.radius,
			};
		case 'pin':
			return {
				...circleBox(element.cx, element.cy, element.radius),
				bottom: element.cy + PIN_TIP_RATIO * element.radius,
			};
		default:
			return circleBox(element.cx, element.cy, element.radius);
	}
};

export const intersects = (first: Box, second: Box) =>
	first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom;

export const listVerticalGaps = (boxes: Box[]) => {
	const sorted = [...boxes].sort((first, second) => first.top - second.top);
	return sorted.slice(1).reduce(
		({ bottom, gaps }, box) => ({
			bottom: Math.max(bottom, box.bottom),
			gaps: box.top > bottom ? [...gaps, box.top - bottom] : gaps,
		}),
		{ bottom: sorted[0].bottom, gaps: [] as number[] },
	).gaps;
};
