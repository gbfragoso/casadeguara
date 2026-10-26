import type { ArtFonts } from '#lib/server/image/text/fonts.js';
import { createTextMeasurer, toTextPath } from '#lib/server/image/text/shaper.js';
import {
	ART_SIZE,
	type ArtElement,
	type ArtPicture,
	type ArtShape,
	type ArtTextBlock,
	type TalkArtLayout,
} from './elements';
import { ART_PALETTE } from './palette';

export type ArtPictures = { logo: Uint8Array; photo: Uint8Array | null };

const PNG_SIGNATURE_BYTE = 0x89;
const PIN_TIP_RATIO = 1.7;
const PIN_HOLE_RATIO = 0.4;

const renderTextBlock = (block: ArtTextBlock, fonts: ArtFonts) => {
	const font = fonts[block.weight];
	const measurer = createTextMeasurer(font);
	const capHeight = (font.capHeight * block.size) / font.unitsPerEm;
	const path = block.lines
		.map((line, index) => {
			const lineWidth = measurer.widthOfTextAtSize(line, block.size);
			const x = block.anchor === 'middle' ? block.x - lineWidth / 2 : block.x;
			const baseline = block.top + index * block.lineHeight + (block.lineHeight + capHeight) / 2;
			return toTextPath(font, line, block.size, { x, baseline });
		})
		.join('');
	return `<path d="${path}" fill="${ART_PALETTE[block.color]}"/>`;
};

const renderDots = (shape: Extract<ArtShape, { kind: 'dots' }>) =>
	Array.from({ length: shape.rows * shape.columns }, (_, index) => {
		const cx = shape.x + (index % shape.columns) * shape.spacing;
		const cy = shape.y + Math.floor(index / shape.columns) * shape.spacing;
		return `<circle cx="${cx}" cy="${cy}" r="${shape.radius}" fill="${ART_PALETTE[shape.fill]}"/>`;
	}).join('');

const renderPin = ({ cx, cy, radius, fill, hole }: Extract<ArtShape, { kind: 'pin' }>) =>
	`<path d="M${cx - radius} ${cy}A${radius} ${radius} 0 1 1 ${cx + radius} ${cy}L${cx} ${cy + PIN_TIP_RATIO * radius}Z" ` +
	`fill="${ART_PALETTE[fill]}"/><circle cx="${cx}" cy="${cy}" r="${radius * PIN_HOLE_RATIO}" fill="${ART_PALETTE[hole]}"/>`;

const renderShape = (shape: ArtShape) => {
	switch (shape.kind) {
		case 'rect':
			return (
				`<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" ` +
				`rx="${shape.radius}" fill="${ART_PALETTE[shape.fill]}"/>`
			);
		case 'circle':
			return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.radius}" fill="${ART_PALETTE[shape.fill]}"/>`;
		case 'dots':
			return renderDots(shape);
		default:
			return renderPin(shape);
	}
};

const toDataUri = (bytes: Uint8Array) => {
	const mimeType = bytes[0] === PNG_SIGNATURE_BYTE ? 'image/png' : 'image/jpeg';
	return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
};

const renderPicture = (picture: ArtPicture, index: number, pictures: ArtPictures) => {
	const { cx, cy, radius, source } = picture;
	const side = source === 'photo' ? 2 * radius : Math.SQRT2 * radius;
	const clipId = `recorte-${index}`;
	return (
		`<clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${radius}"/></clipPath>` +
		`<image href="${toDataUri(pictures[source] ?? pictures.logo)}" x="${cx - side / 2}" y="${cy - side / 2}" ` +
		`width="${side}" height="${side}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
	);
};

const renderElement = (element: ArtElement, index: number, fonts: ArtFonts, pictures: ArtPictures) => {
	if (element.kind === 'text') return renderTextBlock(element, fonts);
	if (element.kind === 'picture') return renderPicture(element, index, pictures);
	return renderShape(element);
};

export const renderTalkArtSvg = (layout: TalkArtLayout, fonts: ArtFonts, pictures: ArtPictures): string =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${ART_SIZE}" height="${ART_SIZE}" ` +
	`viewBox="0 0 ${ART_SIZE} ${ART_SIZE}">` +
	layout.elements.map((element, index) => renderElement(element, index, fonts, pictures)).join('') +
	'</svg>';
