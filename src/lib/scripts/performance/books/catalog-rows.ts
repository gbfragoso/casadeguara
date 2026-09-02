import { authorName, bookTitle, collectionName, keywordName, publisherName } from './labels';
import { expandHistogram, profile, type Histogram } from './profile';

const BOOK_DATE = new Date(`${profile.dateRange.firstBook}T00:00:00Z`);

function createAssignments(histogram: Histogram, total: number) {
	const assigned = expandHistogram(histogram, 'descending').flatMap((count, index) =>
		Array.from({ length: count }, () => index + 1),
	);
	return Array.from({ length: total }, (_, index) => assigned[index]);
}

function createAccessions() {
	return profile.histograms.accessionLength.flatMap(({ value: length, occurrences }) => {
		const firstValue = length === 1 ? 1 : 10 ** (length - 1);
		return Array.from({ length: occurrences }, (_, index) => String(firstValue + index));
	});
}

export function createCatalogRows() {
	const publishers = Array.from({ length: profile.cardinalities.publishers }, (_, index) => ({
		ideditora: index + 1,
		nome: publisherName(index + 1),
	}));
	const collections = Array.from({ length: profile.cardinalities.collections }, (_, index) => ({
		idserie: index + 1,
		nome: collectionName(index + 1),
	}));
	const authors = Array.from({ length: profile.cardinalities.authors }, (_, index) => ({
		idautor: index + 1,
		nome: authorName(index + 1),
	}));
	const keywords = Array.from({ length: profile.cardinalities.keywords }, (_, index) => ({
		idkeyword: index + 1,
		chave: keywordName(index + 1),
	}));
	return { publishers, collections, authors, keywords, books: createBooks() };
}

function createBooks() {
	const count = profile.cardinalities.books;
	const publishers = createAssignments(profile.histograms.booksPerPublisher, count);
	const collections = createAssignments(profile.histograms.booksPerCollection, count);
	const orders = expandHistogram(profile.histograms.ordersWithinCollection);
	const accessions = createAccessions();
	return Array.from({ length: count }, (_, index) => ({
		idlivro: index + 1,
		tombo: accessions[index],
		titulo: bookTitle(index + 1),
		editora: publishers[index],
		serie: collections[index],
		ordem: collections[index] ? orders[index] || null : null,
		dataCadastro: BOOK_DATE,
	}));
}
