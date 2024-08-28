import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select()
			.from(leitor)
			.where(eq(leitor.idleitor, Number(params.id)));
		if (!resultado) {
			throw fail(404, {
				message: 'Leitor não encontrado',
			});
		}
		return { leitor: resultado[0] };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao recuperar os dados do leitor',
		});
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do leitor é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do leitor não pode conter somente números',
			};
		}

		const rg = form.get('rg') as string;
		const cpf = form.get('cpf') as string;
		const email = form.get('email') as string;
		const celular = form.get('celular') as string;
		const telefone = form.get('telefone') as string;
		const logradouro = form.get('logradouro') as string;
		const bairro = form.get('bairro') as string;
		const complemento = form.get('complemento') as string;
		const cidade = form.get('cidade') as string;
		const cep = form.get('cep') as string;
		const trab = Boolean(form.get('trab'));
		const status = Boolean(form.get('status'));

		try {
			await db
				.update(leitor)
				.set({
					nome: nome.toUpperCase(),
					rg,
					cpf,
					email,
					celular,
					telefone,
					logradouro,
					bairro,
					complemento,
					cidade,
					cep,
					trab,
					status,
				})
				.where(eq(leitor.idleitor, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao atualizar os dados do leitor',
			});
		}
	},
};
