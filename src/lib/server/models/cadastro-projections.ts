import { cadastroFotos, cadastros } from '$lib/database/schema';
import { sql } from 'drizzle-orm';

export const cadastroIdFields = { idleitor: cadastros.idleitor };

export const bibliotecaListFields = {
	idleitor: cadastros.idleitor,
	nome: cadastros.nome,
	trab: cadastros.trab,
	status: cadastros.status,
};

export const bibliotecaDetailFields = {
	nome: cadastros.nome,
	rg: cadastros.rg,
	cpf: cadastros.cpf,
	email: cadastros.email,
	celular: cadastros.celular,
	telefone: cadastros.telefone,
	logradouro: cadastros.logradouro,
	bairro: cadastros.bairro,
	complemento: cadastros.complemento,
	cidade: cadastros.cidade,
	cep: cadastros.cep,
	trab: cadastros.trab,
	status: cadastros.status,
};

export const secretariaListFields = {
	idleitor: cadastros.idleitor,
	nome: cadastros.nome,
	trab: cadastros.trab,
	frequencia: cadastros.frequencia,
	desencarnado: cadastros.desencarnado,
	amigoFraterno: cadastros.amigoFraterno,
};

export const secretariaDetailFields = {
	nome: cadastros.nome,
	rg: cadastros.rg,
	cpf: cadastros.cpf,
	email: cadastros.email,
	celular: cadastros.celular,
	telefone: cadastros.telefone,
	logradouro: cadastros.logradouro,
	bairro: cadastros.bairro,
	complemento: cadastros.complemento,
	cidade: cadastros.cidade,
	cep: cadastros.cep,
	aniversario: cadastros.aniversario,
	trab: cadastros.trab,
	hasPhoto: sql<boolean>`${cadastroFotos.cadastroId} is not null`,
};

export const tesourariaListFields = {
	idleitor: cadastros.idleitor,
	nome: cadastros.nome,
	telefone: cadastros.telefone,
	trab: cadastros.trab,
};

export const tesourariaDetailFields = {
	nome: cadastros.nome,
	telefone: cadastros.telefone,
	trab: cadastros.trab,
};
