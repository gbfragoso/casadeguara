import { INSTITUTION_ADDRESS, INSTITUTION_NAME } from '#lib/brand/institution.js';
import { formatCalendarMonth, type CalendarMonth } from '#lib/utils/calendar-month.js';
import { formatCivilDate } from '#lib/utils/date.js';
import { type SheetElement, type SheetFrameRole, type SheetMeasurers, type SheetRuleElement } from './elements';
import { createSheetText, type TextPlacement } from './text';
import {
	CONTENT_LEFT,
	CONTENT_RIGHT,
	CONTENT_WIDTH,
	FILETE,
	FILETE_TOP,
	FOOTER_COLUMN_GAP,
	FOOTER_RULE_TOP,
	FOOTER_TEXT_TOP,
	FRAME_STYLES,
	HEADING_LINE_GAP,
	LOGO_SIZE,
	RULE_THICKNESS,
	TEXT_LEFT,
	TEXT_WIDTH,
	TOP_MARGIN,
} from './typography';

export type FooterPage = { generatedOn: string; pageNumber: number; pageCount: number };

const toUpperCase = (text: string) => text.toLocaleUpperCase('pt-BR');

const createFrameText = (role: SheetFrameRole, text: string, measurers: SheetMeasurers, placement: TextPlacement) =>
	createSheetText(role, text, FRAME_STYLES[role], measurers, placement);

const measureFrameText = (role: SheetFrameRole, text: string, measurers: SheetMeasurers) => {
	const { weight, size } = FRAME_STYLES[role];
	return Math.ceil(measurers[weight].widthOfTextAtSize(text, size));
};

const buildHeadingLine = (heading: string, month: CalendarMonth, measurers: SheetMeasurers, top: number) => {
	const headingText = toUpperCase(heading);
	const monthText = `— ${toUpperCase(formatCalendarMonth(month))}`;
	const availableWidth = TEXT_WIDTH - measureFrameText('mes', monthText, measurers);
	const headingWidth = Math.min(measureFrameText('cabecalho', `${headingText} `, measurers), availableWidth);
	const monthLeft = TEXT_LEFT + headingWidth;
	return [
		{ ...createFrameText('cabecalho', headingText, measurers, { x: TEXT_LEFT, width: headingWidth }), top },
		{ ...createFrameText('mes', monthText, measurers, { x: monthLeft, width: CONTENT_RIGHT - monthLeft }), top },
	];
};

export const buildSheetHeader = (
	heading: string,
	month: CalendarMonth,
	measurers: SheetMeasurers,
): SheetElement<SheetFrameRole>[] => {
	const institution = createFrameText('instituicao', toUpperCase(INSTITUTION_NAME), measurers, {
		x: TEXT_LEFT,
		width: TEXT_WIDTH,
	});
	const headingTop = TOP_MARGIN + FRAME_STYLES.instituicao.lineHeight + HEADING_LINE_GAP;
	return [
		{ kind: 'logo', x: CONTENT_LEFT, top: TOP_MARGIN, size: LOGO_SIZE },
		{ ...institution, top: TOP_MARGIN },
		...buildHeadingLine(heading, month, measurers, headingTop),
		{
			kind: 'rule',
			role: 'filete',
			x: CONTENT_LEFT,
			y: FILETE_TOP,
			width: FILETE.width,
			thickness: FILETE.thickness,
			color: 'accent',
		},
	];
};

export const buildBlockSeparator = (y: number): SheetRuleElement => ({
	kind: 'rule',
	role: 'separador',
	x: CONTENT_LEFT,
	y,
	width: CONTENT_WIDTH,
	thickness: RULE_THICKNESS,
	color: 'neutral300',
});

const describeGeneration = ({ generatedOn, pageNumber, pageCount }: FooterPage) => {
	const generation = `Gerado em ${formatCivilDate(generatedOn)}`;
	return pageCount > 1 ? `${generation} · Página ${pageNumber} de ${pageCount}` : generation;
};

export const buildSheetFooter = (page: FooterPage, measurers: SheetMeasurers): SheetElement<SheetFrameRole>[] => {
	const generation = describeGeneration(page);
	const generationWidth = Math.ceil(measurers.regular.widthOfTextAtSize(generation, FRAME_STYLES.geracao.size));
	const address = `${INSTITUTION_NAME} · ${INSTITUTION_ADDRESS}`;
	const addressWidth = CONTENT_WIDTH - generationWidth - FOOTER_COLUMN_GAP;
	const right = { x: CONTENT_RIGHT - generationWidth, width: generationWidth, align: 'end' } as const;
	return [
		{ ...buildBlockSeparator(FOOTER_RULE_TOP), role: 'rodape' },
		{
			...createFrameText('rodape', address, measurers, { x: CONTENT_LEFT, width: addressWidth }),
			top: FOOTER_TEXT_TOP,
		},
		{ ...createFrameText('geracao', generation, measurers, right), top: FOOTER_TEXT_TOP },
	];
};
