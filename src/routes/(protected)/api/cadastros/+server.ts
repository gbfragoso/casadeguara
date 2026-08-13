import { db } from '$lib/database/connection';
import { cadastros } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/');
	const id = url.searchParams.get('id') as string;
	const trabalhador = url.searchParams.get('trabalhador') as string;
	const desencarnado = url.searchParams.get('desencarnado') as string;
	const frequencia = url.searchParams.get('frequencia') as string;

	try {
		await db
			.update(cadastros)
			.set({
				trab: trabalhador ? trabalhador === 'true' : undefined,
				desencarnado: desencarnado ? desencarnado === 'true' : undefined,
				frequencia: frequencia ? frequencia === 'true' : undefined,
			})
			.where(eq(cadastros.idleitor, Number(id)));

		return new Response('Cadastro atualizado com sucesso');
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao atualizar o cadastro',
		});
	}
};
