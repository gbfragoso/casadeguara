import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
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
	idaviso: smallserial('idaviso').primaryKey().notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).default(sql`CURRENT_DATE`),
	texto: varchar('texto', { length: 300 }).notNull(),
	username: varchar('username', { length: 30 }),
});

export const keyword = pgTable('keyword', {
	idkeyword: smallserial('idkeyword').primaryKey().notNull(),
	chave: varchar('chave', { length: 30 }).notNull(),
});

export const exemplar = pgTable(
	'exemplar',
	{
		idexemplar: smallserial('idexemplar').primaryKey().notNull(),
		livro: smallint('livro').notNull(),
		numero: smallint('numero').notNull(),
		status: varchar('status', { length: 15 }),
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

export const livro = pgTable(
	'livro',
	{
		idlivro: smallserial('idlivro').primaryKey().notNull(),
		tombo: varchar('tombo', { length: 8 }).notNull(),
		titulo: varchar('titulo', { length: 80 }).notNull(),
		editora: integer('editora'),
		dataCadastro: date('data_cadastro'),
		serie: smallint('serie'),
		ordem: smallint('ordem'),
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

export const autor = pgTable('autor', {
	idautor: smallserial('idautor').primaryKey().notNull(),
	nome: varchar('nome', { length: 60 }).notNull(),
	dataCadastro: date('data_cadastro'),
});

export const configuracao = pgTable('configuracao', {
	idconf: smallserial('idconf').primaryKey().notNull(),
	chave: char('chave', { length: 128 }).notNull(),
	duracaoEmprestimo: smallint('duracao_emprestimo'),
	duracaoRenovacao: smallint('duracao_renovacao'),
	limiteEmprestimo: smallint('limite_emprestimo'),
	limiteRenovacao: smallint('limite_renovacao'),
	intervaloEmprestimo: smallint('intervalo_emprestimo'),
	cobranca: text('cobranca'),
});

export const serie = pgTable('serie', {
	idserie: smallserial('idserie').primaryKey().notNull(),
	nome: varchar('nome', { length: 60 }).notNull(),
	dataCadastro: date('data_cadastro'),
});

export const emprestimo = pgTable(
	'emprestimo',
	{
		idemp: serial('idemp').primaryKey().notNull(),
		leitor: smallint('leitor').notNull(),
		exemplar: smallint('exemplar').notNull(),
		dataEmprestimo: date('data_emprestimo', { mode: 'date' }),
		dataDevolucao: date('data_devolucao', { mode: 'date' }),
		cobranca: timestamp('cobranca', { mode: 'string' }),
		renovacoes: smallint('renovacoes').default(0),
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

export const editora = pgTable('editora', {
	ideditora: smallserial('ideditora').primaryKey().notNull(),
	nome: varchar('nome', { length: 60 }).notNull(),
	dataCadastro: date('data_cadastro'),
});

export const usuario = pgTable('usuario', {
	idusuario: smallserial('idusuario').primaryKey().notNull(),
	nome: varchar('nome', { length: 50 }),
	login: varchar('login', { length: 20 }).notNull(),
	senha: char('senha', { length: 128 }).notNull(),
	tipo: varchar('tipo', { length: 15 }),
	dataCadastro: date('data_cadastro'),
	status: boolean('status').default(true),
});

export const leitor = pgTable(
	'leitor',
	{
		idleitor: smallserial('idleitor').primaryKey().notNull(),
		nome: varchar('nome', { length: 60 }).notNull(),
		email: varchar('email', { length: 60 }),
		telefone: varchar('telefone', { length: 12 }),
		celular: varchar('celular', { length: 12 }),
		logradouro: varchar('logradouro', { length: 80 }),
		bairro: varchar('bairro', { length: 30 }),
		complemento: varchar('complemento'),
		cep: varchar('cep', { length: 11 }),
		sexo: varchar('sexo', { length: 10 }),
		dataCadastro: date('data_cadastro'),
		trab: boolean('trab').default(false),
		cidade: varchar('cidade'),
		paciente: boolean('paciente'),
		incompleto: boolean('incompleto'),
		status: boolean('status').default(true),
		aniversario: date('aniversario', { mode: 'date' }),
		rg: varchar('rg', { length: 12 }),
		cpf: varchar('cpf', { length: 15 }),
	},
	(table) => {
		return {
			uniqueLeitor: unique('unique_leitor').on(table.nome),
		};
	},
);

export const acesso = pgTable('acesso', {
	idacesso: smallserial('idacesso').primaryKey().notNull(),
	conteudo: varchar('conteudo', { length: 40 }),
});

export const livroHasKeyword = pgTable(
	'livro_has_keyword',
	{
		livro: integer('livro').notNull(),
		keyword: integer('keyword').notNull(),
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

export const autorHasLivro = pgTable(
	'autor_has_livro',
	{
		autor: integer('autor').notNull(),
		livro: integer('livro').notNull(),
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

export const usuarioHasAcesso = pgTable(
	'usuario_has_acesso',
	{
		usuario: integer('usuario').notNull(),
		acesso: integer('acesso').notNull(),
	},
	(table) => {
		return {
			fkAcesso: foreignKey({
				columns: [table.acesso],
				foreignColumns: [acesso.idacesso],
				name: 'fk_acesso',
			}).onUpdate('cascade'),
			fkUsuario: foreignKey({
				columns: [table.usuario],
				foreignColumns: [usuario.idusuario],
				name: 'fk_usuario',
			}).onDelete('cascade'),
			pkUsuarioAcesso: primaryKey({ columns: [table.usuario, table.acesso], name: 'pk_usuario_acesso' }),
		};
	},
);

export const Session = pgTable('Session', {
	id: text('id').primaryKey().notNull(),
	userId: text('userId')
		.notNull()
		.references(() => User.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
});

export const User = pgTable(
	'User',
	{
		id: text('id').primaryKey().notNull(),
		password_hash: varchar('password_hash', { length: 2000 }).notNull(),
		roles: varchar('roles', { length: 20 }).notNull(),
		username: varchar('username', { length: 30 }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
	},
	(table) => {
		return {
			username_key: uniqueIndex('User_username_key').using('btree', table.username),
		};
	},
);

export const entradas = pgTable('entradas', {
	identrada: serial('identrada').primaryKey().notNull(),
	descricao: varchar('descricao', { length: 200 }).notNull(),
	valor: numeric('valor').notNull(),
	data_entrada: date('data_entrada', { mode: 'date' }).defaultNow().notNull(),
	idcontribuinte: integer('idcontribuinte')
		.notNull()
		.references(() => leitor.idleitor),
	user_cadastro: smallint('user_cadastro'),
	user_alteracao: smallint('user_alteracao'),
});

export const saidas = pgTable('saidas', {
	idsaida: serial('idsaida').primaryKey().notNull(),
	descricao: varchar('descricao', { length: 200 }).notNull(),
	valor: numeric('valor').notNull(),
	data_saida: date('data_saida', { mode: 'date' }).defaultNow().notNull(),
	user_cadastro: smallint('user_cadastro'),
	user_alteracao: smallint('user_alteracao'),
});
