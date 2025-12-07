import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import validator from 'validator';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, request }) => {
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
		const trab = Boolean(form.get('trab'));
		const status = Boolean(form.get('status'));

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

		if (rg && (!validator.isNumeric(rg) || rg.length > 11)) {
			return {
				status: 400,
				field: 'rg',
				message: 'RG inválido',
			};
		}

		if (cpf && (!validator.isNumeric(cpf) || cpf.length > 11)) {
			return {
				status: 400,
				field: 'cpf',
				message: 'CPF inválido',
			};
		}

		try {
			await db.insert(leitor).values({
				nome: nome.toUpperCase(),
				rg: rg ? rg.replace(/\D/g, '') : undefined,
				cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
				email: email ? email : undefined,
				celular: celular ? celular : undefined,
				telefone: telefone ? telefone : undefined,
				logradouro: logradouro ? logradouro : undefined,
				bairro: bairro ? bairro : undefined,
				complemento: complemento ? complemento : undefined,
				cidade: cidade ? cidade : undefined,
				cep: cep ? cep : undefined,
				trab: trab ? trab : undefined,
				status: status ? status : undefined,
				userCadastro: locals.user?.id,
			});
			return { status: 201 };
		} catch (err) {
			console.error(err);
			if (err instanceof Error && err.message.includes('duplicate key value violates')) {
				return {
					status: 400,
					field: 'nome',
					message: 'Já existe um cadastro com nome idêntico, favor consultar',
				};
			}
			return error(500, { message: 'Falha ao criar um novo leitor' });
		}
	},
} satisfies Actions;
