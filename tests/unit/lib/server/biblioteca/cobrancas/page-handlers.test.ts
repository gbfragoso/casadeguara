import { isRedirect } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { overdueLoans, registerChargeWhere } = vi.hoisted(() => ({
	overdueLoans: [{ idemp: 7, leitor: 'João Conceição', titulo: 'Nosso Lar' }],
	registerChargeWhere: vi.fn(async () => undefined),
}));

vi.mock('#lib/server/database/connection.js', () => {
	const overdueLoansQuery = {
		from: () => overdueLoansQuery,
		innerJoin: () => overdueLoansQuery,
		where: () => overdueLoansQuery,
		orderBy: async () => overdueLoans,
	};

	return {
		db: {
			select: () => overdueLoansQuery,
			update: () => ({ set: () => ({ where: registerChargeWhere }) }),
		},
	};
});

const { createBibliotecaCobrancasHandlers } = await import('#lib/server/biblioteca/cobrancas/page-handlers.js');

const createChargeRequest = (contact: Record<string, string>) => {
	const form = new FormData();
	form.set('id', '7');
	form.set('titulo', 'Nosso Lar');
	form.set('leitor', 'João Conceição');
	form.set('prazo', '01/10/2026');
	Object.entries(contact).forEach(([name, value]) => form.set(name, value));

	return {
		request: new Request('http://localhost/biblioteca/cobrancas', { method: 'POST', body: form }),
		locals: createLocals('biblioteca,biblioteca:admin'),
	};
};

const createLocals = (roles: string | null) => ({
	user: roles ? { id: 'user-1', username: 'bibliotecaria', name: 'Bibliotecária', roles } : null,
	session: null,
});

const captureRedirect = async (handler: Promise<unknown>) => {
	const thrown = await handler.catch((reason: unknown) => reason);
	if (!isRedirect(thrown)) throw new Error('Expected the handler to redirect', { cause: thrown });

	return thrown;
};

afterEach(() => {
	registerChargeWhere.mockClear();
});

describe('createBibliotecaCobrancasHandlers', () => {
	it('redirects an anonymous visitor to the home page', async () => {
		const { load } = createBibliotecaCobrancasHandlers();

		const redirect = await captureRedirect(load({ locals: createLocals(null) }));

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it('redirects a library user without administrative access', async () => {
		const { load } = createBibliotecaCobrancasHandlers();

		const redirect = await captureRedirect(load({ locals: createLocals('biblioteca') }));

		expect(redirect).toMatchObject({ status: 302, location: '/biblioteca' });
	});

	it('lists overdue loans for a library administrator', async () => {
		const { load } = createBibliotecaCobrancasHandlers();

		const result = await load({ locals: createLocals('biblioteca,biblioteca:admin') });

		await expect(result.emprestimos).resolves.toEqual(overdueLoans);
	});

	it.each([
		['an anonymous visitor', null, 302],
		['a library user without administrative access', 'biblioteca', 401],
	])('refuses to register a charge for %s', async (_visitor, roles, status) => {
		const { actions } = createBibliotecaCobrancasHandlers();
		const event = { ...createChargeRequest({ telefone: '5579999999999' }), locals: createLocals(roles) };

		const thrown = await actions.whatsapp(event).catch((reason: unknown) => reason);

		expect(thrown).toMatchObject({ status });
		expect(event.request.bodyUsed).toBe(false);
		expect(registerChargeWhere).not.toHaveBeenCalled();
	});

	it('registers the charge before contacting the reader', async () => {
		const { actions } = createBibliotecaCobrancasHandlers();

		await captureRedirect(actions.whatsapp(createChargeRequest({ telefone: '5579999999999' })));

		expect(registerChargeWhere).toHaveBeenCalledOnce();
	});

	it('redirects to WhatsApp with the encoded overdue notice', async () => {
		const { actions } = createBibliotecaCobrancasHandlers();
		const message =
			'Estimado(a) João Conceição, o prazo para devolução do livro Nosso Lar expirou em 01/10/2026, ' +
			'se possível dirigir-se à biblioteca para regularização. Atenciosamente, Clébio Fragoso';

		const redirect = await captureRedirect(actions.whatsapp(createChargeRequest({ telefone: '5579999999999' })));

		expect(redirect).toMatchObject({
			status: 302,
			location: `https://wa.me/5579999999999?text=${encodeURIComponent(message)}`,
		});
	});

	it('redirects to the mail client with encoded subject and body', async () => {
		const { actions } = createBibliotecaCobrancasHandlers();
		const body =
			'Estimado(a) João Conceição,\r\n\r\nO prazo para devolução do livro Nosso Lar expirou em 01/10/2026, ' +
			'se possível dirigir-se à biblioteca para regularização.\r\n\r\nAtenciosamente, Clébio Fragoso';

		const redirect = await captureRedirect(actions.email(createChargeRequest({ email: 'leitor@example.com' })));

		expect(redirect).toMatchObject({
			status: 302,
			location:
				'mailto:leitor@example.com?subject=' +
				encodeURIComponent('Prazo para devolução expirado') +
				`&body=${encodeURIComponent(body)}`,
		});
	});
});
