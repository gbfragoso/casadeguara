import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
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
		const aniversario = form.get('aniversario') as string;
		const trab = Boolean(form.get('trab'));

		try {
			await db.insert(leitor).values({
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
				aniversario: aniversario ? new Date(aniversario) : undefined,
			});
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, { message: 'Falha ao cadastrar um novo trabalhador' });
		}
	},
} satisfies Actions;
