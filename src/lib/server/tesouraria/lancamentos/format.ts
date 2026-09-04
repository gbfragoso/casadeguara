const DATE_PART_LENGTH = 10;

export const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

export const currentDate = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const formatDate = (value: Date | string | null | undefined) => {
	if (value === null || value === undefined) return null;
	if (typeof value === 'string') return value.slice(0, DATE_PART_LENGTH);
	return value.toISOString().slice(0, DATE_PART_LENGTH);
};
