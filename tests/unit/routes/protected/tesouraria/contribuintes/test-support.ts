export const tesourariaUser = { id: 'tesouraria-user', roles: 'tesouraria:admin' };

export const tesourariaContext = {
	locals: { user: tesourariaUser },
	params: { id: '4' },
};

export const contributorDetail = {
	nome: 'MARIA',
	telefone: '7133333333',
	trab: true,
	cpf: '12345678909',
	status: true,
	userCadastro: 'private',
};

export const createTesourariaRequest = (entries: Record<string, string>) => {
	const formData = new FormData();
	Object.entries(entries).forEach(([key, value]) => formData.set(key, value));

	return new Request('http://localhost', { method: 'POST', body: formData });
};
