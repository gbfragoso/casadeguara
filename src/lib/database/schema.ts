import { sql } from 'drizzle-orm';
import {
	boolean,
	date,
	foreignKey,
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
	dataCadastro: date('data_cadastro', { mode: 'date' }).default(sql`CURRENT_DATE`),
	texto: varchar({ length: 300 }).notNull(),
	username: varchar({ length: 30 }),
});

export const emprestimo = pgTable(
	'emprestimo',
	{
		idemp: serial().primaryKey().notNull(),
		leitor: smallint().notNull(),
		exemplar: smallint().notNull(),
		dataEmprestimo: date('data_emprestimo', { mode: 'date' }),
		dataDevolucao: date('data_devolucao', { mode: 'date' }),
		cobranca: timestamp({ mode: 'date' }),
		renovacoes: smallint().default(0),
		dataDevolvido: date('data_devolvido', { mode: 'date' }),
		userEmprestimo: smallint('user_emprestimo'),
		userDevolucao: smallint('user_devolucao'),
	},
	(table) => {
		return {
			fkExemplar: foreignKey({
				columns: [table.exemplar],
				foreignColumns: [exemplar.idexemplar],
				name: 'fk_exemplar',
			}).onDelete('cascade'),
			fkLeitor: foreignKey({
				columns: [table.leitor],
				foreignColumns: [leitor.idleitor],
				name: 'fk_leitor',
			}),
		};
	},
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
		dataCadastro: date('data_cadastro', { mode: 'date' }),
		trab: boolean().default(false),
		cidade: varchar(),
		incompleto: boolean(),
		status: boolean().default(true),
		aniversario: date({ mode: 'date' }),
		rg: varchar({ length: 12 }),
		cpf: varchar({ length: 15 }),
	},
	(table) => {
		return {
			uniqueLeitor: unique('unique_leitor').on(table.nome),
		};
	},
);

export const autor = pgTable('autor', {
	idautor: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }),
});

export const keyword = pgTable('keyword', {
	idkeyword: smallserial().primaryKey().notNull(),
	chave: varchar({ length: 30 }).notNull(),
});

export const editora = pgTable('editora', {
	ideditora: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }),
});

export const serie = pgTable('serie', {
	idserie: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }),
});

export const exemplar = pgTable(
	'exemplar',
	{
		idexemplar: smallserial().primaryKey().notNull(),
		livro: smallint().notNull(),
		numero: smallint().notNull(),
		status: varchar({ length: 15 }),
		dataCadastro: date('data_cadastro', { mode: 'date' }),
	},
	(table) => {
		return {
			fkLivro: foreignKey({
				columns: [table.livro],
				foreignColumns: [livro.idlivro],
				name: 'fk_livro',
			}),
		};
	},
);

export const saidas = pgTable('saidas', {
	idsaida: serial().primaryKey().notNull(),
	descricao: varchar({ length: 200 }).notNull(),
	valor: numeric().notNull(),
	dataSaida: date('data_saida', { mode: 'date' }).defaultNow().notNull(),
	userCadastro: smallint('user_cadastro'),
	userAlteracao: smallint('user_alteracao'),
});

export const user = pgTable(
	'User',
	{
		id: text().primaryKey().notNull(),
		passwordHash: varchar('password_hash', { length: 2000 }).notNull(),
		roles: varchar({ length: 20 }).notNull(),
		username: varchar({ length: 30 }).notNull(),
		name: varchar({ length: 255 }).notNull(),
	},
	(table) => {
		return {
			usernameKey: uniqueIndex('User_username_key').using('btree', table.username.asc().nullsLast()),
		};
	},
);

export const livro = pgTable(
	'livro',
	{
		idlivro: smallserial().primaryKey().notNull(),
		tombo: varchar({ length: 8 }).notNull(),
		titulo: varchar({ length: 80 }).notNull(),
		editora: integer(),
		dataCadastro: date('data_cadastro', { mode: 'date' }),
		serie: smallint(),
		ordem: smallint(),
	},
	(table) => {
		return {
			fkEditora: foreignKey({
				columns: [table.editora],
				foreignColumns: [editora.ideditora],
				name: 'fk_editora',
			}),
			fkSerie: foreignKey({
				columns: [table.serie],
				foreignColumns: [serie.idserie],
				name: 'fk_serie',
			}),
			tomboUnico: unique('tombo_unico').on(table.tombo),
		};
	},
);

export const entradas = pgTable(
	'entradas',
	{
		identrada: serial().primaryKey().notNull(),
		descricao: varchar({ length: 200 }).notNull(),
		valor: numeric().notNull(),
		dataEntrada: date('data_entrada', { mode: 'date' }).notNull(),
		dataRegistro: date('data_registro', { mode: 'date' }).defaultNow().notNull(),
		idcontribuinte: integer().notNull(),
		userCadastro: smallint('user_cadastro'),
		userAlteracao: smallint('user_alteracao'),
		uuid: varchar({ length: 36 }).notNull(),
	},
	(table) => {
		return {
			entradasIdcontribuinteLeitorIdleitorFk: foreignKey({
				columns: [table.idcontribuinte],
				foreignColumns: [leitor.idleitor],
				name: 'entradas_idcontribuinte_leitor_idleitor_fk',
			}),
		};
	},
);

export const frequencia = pgTable(
	'frequencia',
	{
		frequenciaid: serial().primaryKey().notNull(),
		trabalhador: integer().notNull(),
		dataPresenca: date('data_presenca', { mode: 'date' }).notNull(),
	},
	(table) => {
		return {
			frequenciaLeitorFk: foreignKey({
				columns: [table.trabalhador],
				foreignColumns: [leitor.idleitor],
				name: 'frequencia_leitor_fk',
			})
				.onUpdate('cascade')
				.onDelete('cascade'),
		};
	},
);

export const session = pgTable(
	'Session',
	{
		id: text().primaryKey().notNull(),
		userId: text().notNull(),
		expiresAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	},
	(table) => {
		return {
			sessionUserIdUserIdFk: foreignKey({
				columns: [table.userId],
				foreignColumns: [user.id],
				name: 'Session_userId_User_id_fk',
			})
				.onUpdate('cascade')
				.onDelete('cascade'),
		};
	},
);

export const autorHasLivro = pgTable(
	'autor_has_livro',
	{
		autor: integer().notNull(),
		livro: integer().notNull(),
	},
	(table) => {
		return {
			fkAutor: foreignKey({
				columns: [table.autor],
				foreignColumns: [autor.idautor],
				name: 'fk_autor',
			}).onDelete('cascade'),
			fkLivro: foreignKey({
				columns: [table.livro],
				foreignColumns: [livro.idlivro],
				name: 'fk_livro',
			}).onDelete('cascade'),
			pkAutorLivro: primaryKey({ columns: [table.autor, table.livro], name: 'pk_autor_livro' }),
		};
	},
);

export const livroHasKeyword = pgTable(
	'livro_has_keyword',
	{
		livro: integer().notNull(),
		keyword: integer().notNull(),
		referencia: varchar({ length: 100 }),
	},
	(table) => {
		return {
			fkKeyword: foreignKey({
				columns: [table.keyword],
				foreignColumns: [keyword.idkeyword],
				name: 'fk_keyword',
			}).onDelete('cascade'),
			fkLivro: foreignKey({
				columns: [table.livro],
				foreignColumns: [livro.idlivro],
				name: 'fk_livro',
			}).onDelete('cascade'),
			pkLivroKeyword: primaryKey({ columns: [table.livro, table.keyword], name: 'pk_livro_keyword' }),
		};
	},
);
