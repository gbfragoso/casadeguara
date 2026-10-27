import { PageSizes, PDFDocument } from 'pdf-lib';

import { formatProgramMonth } from '#lib/talks/program/months.js';
import { embedProgramAssets } from './assets';
import type { TalkProgramDocument } from './content';
import { layoutTalkProgram } from './layout';
import { drawProgramPage } from './renderer';

export type GeneratedProgram = { bytes: Uint8Array; pageCount: number };

const PROGRAM_AUTHOR = 'Grupo Espírita Casa de Guará';
const PROGRAM_LANGUAGE = 'pt-BR';

export const generateTalkProgramPdf = async (program: TalkProgramDocument): Promise<GeneratedProgram> => {
	const document = await PDFDocument.create();
	document.setTitle(`Programação de palestras — ${formatProgramMonth(program.month)}`, {
		showInWindowTitleBar: true,
	});
	document.setAuthor(PROGRAM_AUTHOR);
	document.setLanguage(PROGRAM_LANGUAGE);
	const assets = await embedProgramAssets(document);
	const pages = layoutTalkProgram(program, assets.fonts);
	pages.forEach((layout) => drawProgramPage(document.addPage(PageSizes.A4), layout, assets));
	return { bytes: await document.save(), pageCount: pages.length };
};
