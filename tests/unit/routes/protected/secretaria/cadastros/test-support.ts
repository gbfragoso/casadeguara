export const secretariaUser = { id: 'secretaria-user', roles: 'secretaria:admin' };

export const secretariaContext = {
	locals: { user: secretariaUser },
	params: { id: '4' },
};

export const createSecretariaRequest = (entries: Record<string, string>) => {
	const formData = new FormData();
	Object.entries(entries).forEach(([key, value]) => formData.set(key, value));

	return new Request('http://localhost', { method: 'POST', body: formData });
};
