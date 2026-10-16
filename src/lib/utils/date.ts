const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const formatCivilDate = (value: string | null | undefined): string => {
	if (!value) return '';
	const match = CIVIL_DATE_PATTERN.exec(value);
	if (!match) return value;
	const [, year, month, day] = match;
	return `${day}/${month}/${year}`;
};

const BAHIA_TIME_ZONE = 'America/Bahia';
const bahiaIsoDateFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: BAHIA_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

export const readBahiaCivilDate = (reference: Date): Date =>
	new Date(`${bahiaIsoDateFormatter.format(reference)}T00:00:00Z`);

export const addCivilDays = (civilDate: Date, days: number): Date => {
	const shifted = new Date(civilDate);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted;
};
