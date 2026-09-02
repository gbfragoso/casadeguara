import profileDump from './profile.json';

export type Histogram = ReadonlyArray<{ value: number; occurrences: number }>;
export type HistogramOrder = 'ascending' | 'descending';

export const profile = profileDump;

export function expandHistogram(histogram: Histogram, order: HistogramOrder = 'ascending') {
	const direction = order === 'ascending' ? 1 : -1;
	return [...histogram]
		.sort((left, right) => direction * (left.value - right.value))
		.flatMap(({ value, occurrences }) => Array.from({ length: occurrences }, () => value));
}

export function histogramTotal(histogram: Histogram) {
	return histogram.reduce((total, item) => total + item.value * item.occurrences, 0);
}

export function entityIdWithDegree(histogram: Histogram, degree: number) {
	const entityIndex = expandHistogram(histogram, 'descending').findIndex((value) => value === degree);
	if (entityIndex < 0) throw new Error(`Profile has no entity with degree ${degree}.`);
	return entityIndex + 1;
}
