import type { SheetFrameRole, SheetMeasurers, SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { composeSheetPages } from '#lib/server/pdf/sheet/pages.js';
import { groupBirthdays, type BirthdayListDocument, type BirthdayTextRole } from './content';
import { buildBirthdayBlocks } from './groups';

const BIRTHDAY_HEADING = 'Aniversariantes do mês';

export const layoutBirthdayList = (
	document: BirthdayListDocument,
	measurers: SheetMeasurers,
): SheetPageLayout<BirthdayTextRole | SheetFrameRole>[] => {
	const blocks = buildBirthdayBlocks(groupBirthdays(document), measurers);
	const frame = { heading: BIRTHDAY_HEADING, month: document.month, generatedOn: document.generatedOn };
	return composeSheetPages(frame, blocks, measurers);
};
