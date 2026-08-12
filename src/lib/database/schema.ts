import {
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
	smallserial,
	date,
	serial,
	smallint,
	numeric,
	integer,
	boolean,
	unique,
	check,
	uuid,
	char,
	primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const session = pgTable('Session', {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const user = pgTable(
	'User',
	{
		id: varchar({ length: 30 }).primaryKey().notNull(),
		passwordHash: varchar('password_hash', { length: 2000 }).notNull(),
		roles: varchar({ length: 50 }).notNull(),
		username: varchar({ length: 30 }).notNull(),
		name: varchar({ length: 255 }).notNull(),
	},
	(table) => [uniqueIndex('User_username_key').using('btree', table.username.asc().nullsLast().op('text_ops'))],
);

export const autor = pgTable(
	'autor',
	{
		idautor: smallserial().primaryKey().notNull(),
		nome: varchar({ length: 60 }).notNull(),
		dataCadastro: date('data_cadastro').defaultNow(),
	},
);

export const aviso = pgTable('aviso', {
	idaviso: smallserial().primaryKey().notNull(),
	dataCadastro: date('data_cadastro').defaultNow(),
	texto: varchar({ length: 300 }).notNull(),
	username: varchar({ length: 30 }),
});

export const editora = pgTable('editora', {
	ideditora: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro').defaultNow(),
});

export const emprestimo = pgTable('emprestimo', {
	idemp: serial().primaryKey().notNull(),
	leitor: smallint().notNull(),
	exemplar: smallint().notNull(),
	dataEmprestimo: date('data_emprestimo'),
	dataDevolucao: date('data_devolucao'),
	cobranca: timestamp({ mode: 'string' }),
	renovacoes: smallint().default(0),
	dataDevolvido: date('data_devolvido'),
	userEmprestimo: varchar('user_emprestimo', { length: 30 }),
	userDevolucao: varchar('user_devolucao', { length: 30 }),
});

export const entradas = pgTable('entradas', {
	identrada: serial().primaryKey().notNull(),
	descricao: varchar({ length: 200 }).notNull(),
	valor: numeric().notNull(),
	dataEntrada: date('data_entrada').notNull(),
	idcontribuinte: integer().notNull(),
	userCadastro: varchar('user_cadastro', { length: 30 }),
	userAlteracao: varchar('user_alteracao', { length: 30 }),
	uuid: varchar({ length: 36 }).notNull(),
	dataRegistro: date('data_registro').defaultNow().notNull(),
	depositado: boolean().default(false),
	motivoEstorno: varchar('motivo_estorno', { length: 200 }),
	userEstorno: varchar('user_estorno', { length: 30 }),
	dataEstorno: date('data_estorno'),
});

export const exemplar = pgTable('exemplar', {
	idexemplar: smallserial().primaryKey().notNull(),
	livro: smallint().notNull(),
	numero: smallint().notNull(),
	status: varchar({ length: 15 }),
	dataCadastro: date('data_cadastro').defaultNow(),
});

export const frequencia = pgTable('frequencia', {
	frequenciaid: serial().primaryKey().notNull(),
	trabalhador: integer().notNull(),
	dataPresenca: date('data_presenca').notNull(),
});

export const keyword = pgTable('keyword', {
	idkeyword: smallserial().primaryKey().notNull(),
	chave: varchar({ length: 30 }).notNull(),
});

export const livro = pgTable(
	'livro',
	{
		idlivro: smallserial().primaryKey().notNull(),
		tombo: varchar({ length: 8 }).notNull(),
		titulo: varchar({ length: 80 }).notNull(),
		editora: integer(),
		dataCadastro: date('data_cadastro').defaultNow(),
		serie: smallint(),
		ordem: smallint(),
	},
	(table) => [unique('tombo_unico').on(table.tombo)],
);

export const lancamentos = pgTable(
	'lancamentos',
	{
		idlancamento: serial().primaryKey().notNull(),
		uuid: uuid().notNull(),
		tipo: char({ length: 1 }).notNull(),
		descricao: varchar({ length: 200 }).notNull(),
		valor: numeric({ precision: 15, scale: 2 }).notNull(),
		dataLancamento: date('data_lancamento').notNull(),
		dataRegistro: date('data_registro').defaultNow().notNull(),
		dataEstorno: date('data_estorno'),
		userCadastro: varchar('user_cadastro', { length: 30 }),
		userAlteracao: varchar('user_alteracao', { length: 30 }),
		userEstorno: varchar('user_estorno', { length: 30 }),
		motivoEstorno: varchar('motivo_estorno', { length: 200 }),
	},
	(table) => [
		unique('lancamentos_uuid_unique').on(table.uuid),
		check('lancamentos_tipo_check', sql`tipo = ANY (ARRAY['E'::bpchar, 'S'::bpchar])`),
		check('lancamentos_valor_check', sql`valor > (0)::numeric`),
	],
);

export const leitor = pgTable(
	'leitor',
	{
		idleitor: smallserial().primaryKey().notNull(),
		nome: varchar({ length: 60 }).notNull(),
		email: varchar({ length: 60 }),
		telefone: varchar({ length: 12 }),
		celular: varchar({ length: 12 }),
		logradouro: varchar({ length: 80 }),
		bairro: varchar({ length: 30 }),
		complemento: varchar(),
		cep: varchar({ length: 11 }),
		dataCadastro: date('data_cadastro').defaultNow(),
		trab: boolean().default(false),
		cidade: varchar(),
		incompleto: boolean(),
		status: boolean().default(true),
		aniversario: date(),
		rg: varchar({ length: 12 }),
		cpf: varchar({ length: 15 }),
		desencarnado: boolean().default(false),
		frequencia: boolean().default(false),
		userCadastro: varchar('user_cadastro', { length: 30 }),
		userAlteracao: varchar('user_alteracao', { length: 30 }),
		dataAlteracao: date('data_alteracao'),
	},
	(table) => [unique('unique_leitor').on(table.nome)],
);

export const saidas = pgTable('saidas', {
	idsaida: serial().primaryKey().notNull(),
	descricao: varchar({ length: 200 }).notNull(),
	valor: numeric().notNull(),
	dataSaida: date('data_saida').defaultNow().notNull(),
	userCadastro: varchar('user_cadastro', { length: 30 }),
	userAlteracao: varchar('user_alteracao', { length: 30 }),
});

export const serie = pgTable('serie', {
	idserie: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro').defaultNow(),
});

export const autorHasLivro = pgTable(
	'autor_has_livro',
	{
		autor: integer().notNull(),
		livro: integer().notNull(),
	},
	(table) => [primaryKey({ columns: [table.autor, table.livro], name: 'pk_autor_livro' })],
);

export const livroHasKeyword = pgTable(
	'livro_has_keyword',
	{
		livro: integer().notNull(),
		keyword: integer().notNull(),
		referencia: varchar({ length: 100 }),
	},
	(table) => [primaryKey({ columns: [table.livro, table.keyword], name: 'pk_livro_keyword' })],
);
