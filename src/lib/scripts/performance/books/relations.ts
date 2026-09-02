import { entityIdWithDegree, expandHistogram, profile } from './profile';

type DegreeNode = { id: number; remaining: number };

function createNodes(degrees: number[]): DegreeNode[] {
	return degrees.map((remaining, index) => ({ id: index + 1, remaining }));
}

function takeHighest(nodes: DegreeNode[], count: number) {
	nodes.sort((left, right) => right.remaining - left.remaining || left.id - right.id);
	const selected = nodes.slice(0, count);
	if (selected.some(({ remaining }) => remaining < 1)) throw new Error('Profile relation degrees are incompatible.');
	selected.forEach((node) => (node.remaining -= 1));
	return selected;
}

function createPairs(leftDegrees: number[], rightDegrees: number[]) {
	const rightNodes = createNodes(rightDegrees);
	const leftNodes = createNodes(leftDegrees).sort(
		(left, right) => right.remaining - left.remaining || left.id - right.id,
	);
	const pairs = leftNodes.flatMap((left) =>
		takeHighest(rightNodes, left.remaining).map((right) => [left.id, right.id]),
	);
	if (rightNodes.some(({ remaining }) => remaining !== 0)) throw new Error('Profile relation totals do not match.');
	return pairs;
}

export function createBookAuthorRows() {
	const books = expandHistogram(profile.histograms.authorsPerBook, 'descending');
	const authors = expandHistogram(profile.histograms.booksPerAuthor, 'descending');
	const validRows = createPairs(books, authors).map(([livro, autor]) => ({ livro, autor }));
	const orphanAuthor = entityIdWithDegree(profile.histograms.booksPerAuthor, 35);
	const orphanRows = Array.from({ length: profile.orphans.bookAuthorsMissingBook }, (_, index) => ({
		livro: profile.cardinalities.books + index + 1,
		autor: orphanAuthor,
	}));
	return [...validRows, ...orphanRows];
}

export function createBookKeywordRows() {
	const books = expandHistogram(profile.histograms.keywordsPerBook, 'descending');
	const keywords = expandHistogram(profile.histograms.booksPerKeyword, 'descending');
	return createPairs(books, keywords).map(([livro, keyword]) => ({ livro, keyword, referencia: null }));
}

export function createCopyRows() {
	const counts = expandHistogram(profile.histograms.copiesPerBook, 'descending');
	const statuses = profile.copyStatuses.flatMap(({ value, occurrences }) =>
		Array.from({ length: occurrences }, () => value),
	);
	let copyId = 0;
	return counts.flatMap((count, bookIndex) =>
		Array.from({ length: count }, (_, copyIndex) => {
			copyId += 1;
			return { idexemplar: copyId, livro: bookIndex + 1, numero: copyIndex + 1, status: statuses[copyId - 1] };
		}),
	);
}
