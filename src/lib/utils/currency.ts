export function moeda(moeda: number) {
	return new Number(moeda).toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

const BRL_DECIMAL_PATTERN = /^([+-]?)(\d+)(?:\.(\d+))?$/;
const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const MINIMUM_FRACTION_DIGITS = 2;

const groupIntegerDigits = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatBrlDecimal = (value: string): string => {
	const match = BRL_DECIMAL_PATTERN.exec(value);
	if (!match) throw new RangeError('Value must be a decimal string.');

	const [, sign, integerDigits, fractionDigits = ''] = match;
	const normalizedInteger = integerDigits.replace(/^0+(?=\d)/, '');
	const formattedInteger = groupIntegerDigits(normalizedInteger);
	const formattedFraction = fractionDigits.padEnd(MINIMUM_FRACTION_DIGITS, '0');
	return `${sign === '-' ? '-' : ''}R$ ${formattedInteger},${formattedFraction}`;
};

export const formatMonthLabel = (value: string): string => {
	const match = MONTH_KEY_PATTERN.exec(value);
	if (!match) throw new RangeError('Value must be a YYYY-MM month key.');

	const [, year, month] = match;
	return `${month}/${year}`;
};
