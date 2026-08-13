export const libraryUser = { id: 'library-user', roles: 'biblioteca' };
export const readerContext = { locals: { user: libraryUser }, params: { id: '4' } };

export const createReaderRequest = (values: Record<string, string> = {}) => {
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => formData.set(key, value));

	return new Request('http://localhost', { method: 'POST', body: formData });
};
