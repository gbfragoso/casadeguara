import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/');
	const id = url.searchParams.get('id') as string;
	const trab = url.searchParams.get('trabalhador') as string;

	try {
		await db
			.update(leitor)
			.set({ trab: trab === 'true' })
			.where(eq(leitor.idleitor, Number(id)));

		return new Response('Cadastro atualizado com sucesso');
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao atualizar o cadastro',
		});
	}
};
