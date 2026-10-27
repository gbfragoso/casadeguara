import { toProgramEntryContent, type TalkProgramDocument } from './content';
import { translateBlock, type ProgramElement, type ProgramMeasurers, type ProgramPageLayout } from './elements';
import { buildEntry, type EntryLayout } from './entries';
import { paginateEntries } from './pagination';
import { buildEntrySeparator, buildFooter, buildHeader } from './sections';
import { BODY_HEIGHT, BODY_TOP } from './typography';

export type { ProgramMeasurers } from './elements';

type PlacedEntries = { top: number; elements: ProgramElement[] };

const placeEntries = (entries: EntryLayout[]) =>
	entries.reduce<PlacedEntries>(
		({ top, elements }, entry, index) => ({
			top: top + entry.height,
			elements: [...elements, ...(index > 0 ? [buildEntrySeparator(top)] : []), ...translateBlock(entry, top)],
		}),
		{ top: BODY_TOP, elements: [] },
	).elements;

export const layoutTalkProgram = (document: TalkProgramDocument, measurers: ProgramMeasurers): ProgramPageLayout[] => {
	const header = buildHeader(document.month, measurers);
	const entries = document.talks.map((talk) => buildEntry(toProgramEntryContent(talk), measurers));
	const pages = paginateEntries(entries, BODY_HEIGHT);
	return pages.map((entriesOfPage, index) => ({
		elements: [
			...header,
			...placeEntries(entriesOfPage),
			...buildFooter(
				{ generatedOn: document.generatedOn, pageNumber: index + 1, pageCount: pages.length },
				measurers,
			),
		],
	}));
};
