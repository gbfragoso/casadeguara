export interface AutocompleteOption {
	value: string;
	label: string;
}

export const normalizeSearch = (text: string) =>
	text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');

export const indexOptions = (options: AutocompleteOption[]) =>
	options.map((option) => ({ ...option, search: normalizeSearch(option.label) }));

export const filterOptions = (options: ReturnType<typeof indexOptions>, query: string) => {
	const search = normalizeSearch(query);
	return options.filter((option) => option.search.includes(search));
};
