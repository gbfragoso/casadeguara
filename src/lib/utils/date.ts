const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const formatCivilDate = (value: string | null | undefined): string => {
	if (!value) return '';
	const match = CIVIL_DATE_PATTERN.exec(value);
	if (!match) return value;
	const [, year, month, day] = match;
	return `${day}/${month}/${year}`;
};
