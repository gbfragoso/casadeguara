const CPF_BASE_DIGITS = '123456789';

const calculateCpfDigit = (digits: string, weight: number) => {
	const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
	const result = (sum * 10) % 11;

	return result === 10 ? 0 : result;
};

const createCpf = () => {
	const firstDigit = calculateCpfDigit(CPF_BASE_DIGITS, 10);
	const firstTenDigits = `${CPF_BASE_DIGITS}${firstDigit}`;

	return `${firstTenDigits}${calculateCpfDigit(firstTenDigits, 11)}`;
};

const createRg = (token: string) =>
	[...token]
		.map((character) => (character.charCodeAt(0) % 10).toString())
		.join('')
		.slice(0, 8);

export type CadastroFixture = {
	name: string;
	rg: string;
	cpf: string;
	email: string;
	updatedEmail: string;
	cellphone: string;
	updatedCellphone: string;
	phone: string;
	updatedPhone: string;
	street: string;
	district: string;
	complement: string;
	city: string;
	postalCode: string;
	birthday: string;
};

export const createCadastroFixture = (token: string): CadastroFixture => ({
	name: `E2E ${token.toUpperCase()}`,
	rg: createRg(token),
	cpf: createCpf(),
	email: `biblioteca-${token}@test.invalid`,
	updatedEmail: `secretaria-${token}@test.invalid`,
	cellphone: '71987654321',
	updatedCellphone: '71976543210',
	phone: '7133333333',
	updatedPhone: '7132222222',
	street: 'Rua do Teste',
	district: 'Centro',
	complement: 'Casa 1',
	city: 'Salvador',
	postalCode: '40000000',
	birthday: '2000-01-02',
});
