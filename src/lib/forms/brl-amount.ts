export type BrlAmountState = {
	digits: string;
	displayValue: string;
	canonicalValue: string;
};

const EMPTY_DISPLAY_VALUE = '0,00';
const CANONICAL_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;

const normalizeDigits = (value: string) => {
	const digits = value.replace(/\D/g, '');
	if (!digits) return '';
	return digits.replace(/^0+(?=\d)/, '');
};

const createStateFromDigits = (digits: string): BrlAmountState => {
	const normalizedDigits = normalizeDigits(digits);
	if (!normalizedDigits) return { digits: '', displayValue: EMPTY_DISPLAY_VALUE, canonicalValue: '' };

	const integerDigits = normalizedDigits.length > 2 ? normalizedDigits.slice(0, -2) : '0';
	const fractionDigits = normalizedDigits.length > 2 ? normalizedDigits.slice(-2) : normalizedDigits.padStart(2, '0');
	const displayValue = `${integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${fractionDigits}`;
	const canonicalValue = `${integerDigits}.${fractionDigits}`;
	return { digits: normalizedDigits, displayValue, canonicalValue };
};

const createInvalidState = (value: string): BrlAmountState => ({
	digits: '',
	displayValue: value,
	canonicalValue: value,
});

export const createBrlAmountState = (value: string): BrlAmountState => {
	if (value === '') return createStateFromDigits('');
	const match = CANONICAL_PATTERN.exec(value);
	if (!match) return createInvalidState(value);

	const integerDigits = match[1];
	const fractionDigits = (match[2] ?? '').padEnd(2, '0');
	return createStateFromDigits(`${integerDigits}${fractionDigits}`);
};

const removeDeletedDigits = (current: BrlAmountState, editedText: string) => {
	const removedText = current.displayValue.slice(editedText.length);
	const removedDigits = removedText.replace(/\D/g, '');
	if (!removedDigits) return current.digits;
	return current.digits.slice(0, Math.max(0, current.digits.length - removedDigits.length));
};

export const updateBrlAmountState = (current: BrlAmountState, editedText: string): BrlAmountState => {
	if (editedText === current.displayValue) return current;
	if (editedText === '') return createStateFromDigits('');

	if (editedText.startsWith(current.displayValue)) {
		const appendedDigits = editedText.slice(current.displayValue.length).replace(/\D/g, '');
		return appendedDigits ? createStateFromDigits(`${current.digits}${appendedDigits}`) : current;
	}

	if (current.displayValue.startsWith(editedText)) {
		return createStateFromDigits(removeDeletedDigits(current, editedText));
	}

	const editedDigits = editedText.replace(/\D/g, '');
	if (!editedDigits) return current;
	return createStateFromDigits(editedDigits);
};
