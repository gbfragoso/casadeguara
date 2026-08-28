export function cpf(value: string | null | undefined) {
	const digits = value?.replace(/\D/g, '');

	return digits ? `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}` : null;
}

export function rg(value: string | null | undefined) {
	const digits = value?.replace(/\D/g, '');

	return digits ? `${digits.slice(0, 2)}.***.***-${digits.slice(-2)}` : null;
}
