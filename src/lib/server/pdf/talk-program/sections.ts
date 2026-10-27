import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { formatProgramMonth, type ProgramMonth } from '#lib/talks/program/months.js';
import { formatCivilDate } from '#lib/utils/date.js';
import {
	stackTexts,
	translateBlock,
	type ProgramElement,
	type ProgramMeasurers,
	type ProgramRuleElement,
} from './elements';
import { createTextElement } from './entries';
import {
	CONTENT_LEFT,
	CONTENT_RIGHT,
	CONTENT_WIDTH,
	FILETE,
	FILETE_TOP,
	FOOTER_COLUMN_GAP,
	FOOTER_RULE_TOP,
	FOOTER_TEXT_TOP,
	HEADER_HEIGHT,
	HEADING_LINE_GAP,
	LOGO_SIZE,
	RULE_THICKNESS,
	TEXT_LEFT,
	TEXT_STYLES,
	TEXT_WIDTH,
	TOP_MARGIN,
} from './typography';

const INSTITUTION_NAME = 'Grupo Espírita Casa de Guará';
const PROGRAM_HEADING = 'Programação de palestras';

export type FooterPage = { generatedOn: string; pageNumber: number; pageCount: number };

const toUpperCase = (text: string) => text.toLocaleUpperCase('pt-BR');

const centerInHeader = (height: number) => TOP_MARGIN + (HEADER_HEIGHT - height) / 2;

export const buildHeader = (month: ProgramMonth, measurers: ProgramMeasurers): ProgramElement[] => {
	const placement = { x: TEXT_LEFT, width: TEXT_WIDTH };
	const heading = stackTexts(
		[
			createTextElement('instituicao', toUpperCase(INSTITUTION_NAME), measurers, placement),
			createTextElement('cabecalho', PROGRAM_HEADING, measurers, placement),
			createTextElement('mes', toUpperCase(formatProgramMonth(month)), measurers, placement),
		].map((element) => ({ element, gapBefore: HEADING_LINE_GAP })),
	);
	return [
		{ kind: 'logo', x: CONTENT_LEFT, top: centerInHeader(LOGO_SIZE), size: LOGO_SIZE },
		...translateBlock(heading, centerInHeader(heading.height)),
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

export const buildEntrySeparator = (y: number): ProgramRuleElement => ({
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

export const buildFooter = (page: FooterPage, measurers: ProgramMeasurers): ProgramElement[] => {
	const generation = describeGeneration(page);
	const generationWidth = Math.ceil(measurers.regular.widthOfTextAtSize(generation, TEXT_STYLES.geracao.size));
	const address = `${INSTITUTION_NAME} · ${DEFAULT_TALK_LOCATION}`;
	const addressWidth = CONTENT_WIDTH - generationWidth - FOOTER_COLUMN_GAP;
	const right = { x: CONTENT_RIGHT - generationWidth, width: generationWidth, align: 'end' } as const;
	return [
		{ ...buildEntrySeparator(FOOTER_RULE_TOP), role: 'rodape' },
		{
			...createTextElement('rodape', address, measurers, { x: CONTENT_LEFT, width: addressWidth }),
			top: FOOTER_TEXT_TOP,
		},
		{ ...createTextElement('geracao', generation, measurers, right), top: FOOTER_TEXT_TOP },
	];
};
