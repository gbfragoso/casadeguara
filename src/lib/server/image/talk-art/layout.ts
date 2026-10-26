import { TalkArtOverflowError, type ArtMeasurers } from './blocks';
import type { TalkArtContent } from './content';
import { ART_SIZE, SAFE_MARGIN, translateElement, type ArtSection, type TalkArtLayout } from './elements';
import { buildBackground, buildFooter, buildHeader, buildTitleGroup, FOOTER_HEIGHT } from './sections';
import { buildSpeakerSection } from './speaker';

export const MAX_SECTION_GAP = 72;
export const MIN_SECTION_GAP = 24;

const distributeSections = (sections: ArtSection[], regionBottom: number) => {
	const contentHeight = sections.reduce((total, section) => total + section.height, 0);
	const leftover = regionBottom - SAFE_MARGIN - contentHeight;
	const gap = Math.min(MAX_SECTION_GAP, leftover / sections.length);
	if (gap < MIN_SECTION_GAP) throw new TalkArtOverflowError('secoes');
	const firstTop = SAFE_MARGIN + (leftover - gap * sections.length) / 2;
	return sections.reduce<{ top: number; elements: ArtSection['elements'] }>(
		({ top, elements }, section) => ({
			top: top + section.height + gap,
			elements: [...elements, ...section.elements.map((element) => translateElement(element, top))],
		}),
		{ top: firstTop, elements: [] },
	).elements;
};

export const layoutTalkArt = (content: TalkArtContent, measurers: ArtMeasurers): TalkArtLayout => {
	const sections = [
		buildHeader(content, measurers),
		buildTitleGroup(content, measurers),
		buildSpeakerSection(content, measurers),
	];
	const footer = content.local ? buildFooter(content.local, measurers) : [];
	const regionBottom = content.local ? ART_SIZE - FOOTER_HEIGHT : ART_SIZE - SAFE_MARGIN;
	return { elements: [...buildBackground(), ...distributeSections(sections, regionBottom), ...footer] };
};
