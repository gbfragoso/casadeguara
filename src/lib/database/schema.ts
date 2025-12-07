import {
	boolean,
	date,
	integer,
	numeric,
	pgTable,
	primaryKey,
	serial,
	smallint,
	smallserial,
	text,
	timestamp,
	unique,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

export const aviso = pgTable('aviso', {
	idaviso: smallserial().primaryKey().notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
	texto: varchar({ length: 300 }).notNull(),
	username: varchar({ length: 30 }),
});

export const frequencia = pgTable('frequencia', {
	frequenciaid: serial().primaryKey().notNull(),
	trabalhador: integer().notNull(),
	dataPresenca: date('data_presenca', { mode: 'date' }).notNull(),
});

export const entradas = pgTable('entradas', {
	identrada: serial().primaryKey().notNull(),
	descricao: varchar({ length: 200 }).notNull(),
	valor: numeric().notNull(),
	dataEntrada: date('data_entrada', { mode: 'date' }).notNull(),
	idcontribuinte: integer().notNull(),
	userCadastro: varchar('user_cadastro', { length: 30 }),
	userAlteracao: varchar('user_alteracao', { length: 30 }),
	motivoEstorno: varchar('motivo_estorno', { length: 200 }),
	userEstorno: varchar('user_estorno', { length: 30 }),
	dataEstorno: date('data_estorno', { mode: 'date' }),
	uuid: varchar({ length: 36 }).notNull(),
	dataRegistro: date('data_registro', { mode: 'date' }).defaultNow().notNull(),
	depositado: boolean().default(false),
});

export const autor = pgTable('autor', {
	idautor: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
});

export const livro = pgTable(
	'livro',
	{
		idlivro: smallserial().primaryKey().notNull(),
		tombo: varchar({ length: 8 }).notNull(),
		titulo: varchar({ length: 80 }).notNull(),
		editora: integer(),
		dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
		serie: smallint(),
		ordem: smallint(),
	},
	(table) => [unique('tombo_unico').on(table.tombo)],
);

export const exemplar = pgTable('exemplar', {
	idexemplar: smallserial().primaryKey().notNull(),
	livro: smallint().notNull(),
	numero: smallint().notNull(),
	status: varchar({ length: 15 }),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
});

export const emprestimo = pgTable('emprestimo', {
	idemp: serial().primaryKey().notNull(),
	leitor: smallint().notNull(),
	exemplar: smallint().notNull(),
	dataEmprestimo: date('data_emprestimo', { mode: 'date' }),
	dataDevolucao: date('data_devolucao', { mode: 'date' }),
	cobranca: timestamp({ mode: 'date' }),
	renovacoes: smallint().default(0),
	dataDevolvido: date('data_devolvido', { mode: 'date' }),
	userEmprestimo: varchar('user_emprestimo', { length: 30 }),
	userDevolucao: varchar('user_devolucao', { length: 30 }),
});

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
		dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
		trab: boolean().default(false),
		desencarnado: boolean().default(false),
		frequencia: boolean().default(false),
		cidade: varchar(),
		incompleto: boolean(),
		status: boolean().default(true),
		aniversario: date({ mode: 'date' }),
		rg: varchar({ length: 12 }),
		cpf: varchar({ length: 15 }),
	},
	(table) => [unique('unique_leitor').on(table.nome)],
);

export const editora = pgTable('editora', {
	ideditora: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
});

export const keyword = pgTable('keyword', {
	idkeyword: smallserial().primaryKey().notNull(),
	chave: varchar({ length: 30 }).notNull(),
});

export const saidas = pgTable('saidas', {
	idsaida: serial().primaryKey().notNull(),
	descricao: varchar({ length: 200 }).notNull(),
	valor: numeric().notNull(),
	dataSaida: date('data_saida', { mode: 'date' }).defaultNow().notNull(),
	userCadastro: varchar('user_cadastro', { length: 30 }),
	userAlteracao: varchar('user_alteracao', { length: 30 }),
});

export const serie = pgTable('serie', {
	idserie: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
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

export const session = pgTable('Session', {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
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
