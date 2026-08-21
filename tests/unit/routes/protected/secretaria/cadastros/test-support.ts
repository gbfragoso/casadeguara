export const secretariaUser = { id: 'secretaria-user', roles: 'secretaria:admin' };

export const secretariaContext = {
	locals: { user: secretariaUser },
	params: { id: '4' },
};

export const secretariaDetail = {
	nome: 'MARIA',
	rg: '123456789',
	cpf: '12345678909',
	email: null,
	celular: null,
	telefone: null,
	logradouro: null,
	bairro: null,
	complemento: null,
	cidade: null,
	cep: null,
	aniversario: new Date('2024-02-29T00:00:00.000Z'),
	trab: false,
	hasPhoto: false,
	userCadastro: 'private',
};

export const createSecretariaRequest = (entries: Record<string, string>) => {
	const formData = new FormData();
	Object.entries(entries).forEach(([key, value]) => formData.set(key, value));

	return new Request('http://localhost', { method: 'POST', body: formData });
};
