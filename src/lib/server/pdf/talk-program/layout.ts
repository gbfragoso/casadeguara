import type { SheetFrameRole, SheetMeasurers, SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { composeSheetPages } from '#lib/server/pdf/sheet/pages.js';
import { toProgramEntryContent, type TalkProgramDocument } from './content';
import { buildEntry } from './entries';
import type { ProgramEntryRole } from './typography';

const PROGRAM_HEADING = 'Programação de palestras';

export const layoutTalkProgram = (
	document: TalkProgramDocument,
	measurers: SheetMeasurers,
): SheetPageLayout<ProgramEntryRole | SheetFrameRole>[] => {
	const entries = document.talks.map((talk) => buildEntry(toProgramEntryContent(talk), measurers));
	const frame = { heading: PROGRAM_HEADING, month: document.month, generatedOn: document.generatedOn };
	return composeSheetPages(frame, entries, measurers);
};
