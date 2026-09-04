import { desc, sql } from 'drizzle-orm';
import {
	boolean,
	check,
	customType,
	date,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	smallint,
	smallserial,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

export const byteaColumn = customType<{ data: Uint8Array; driverData: Uint8Array }>({
	dataType: () => 'bytea',
});

export const cadastros = pgTable(
	'cadastros',
	{
		idleitor: serial().primaryKey().notNull(),
		nome: varchar({ length: 60 }).notNull(),
		email: varchar({ length: 60 }),
		telefone: varchar({ length: 12 }),
		celular: varchar({ length: 12 }),
		logradouro: varchar({ length: 80 }),
		bairro: varchar({ length: 30 }),
		complemento: varchar(),
		cep: varchar({ length: 11 }),
		dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
		userCadastro: varchar('user_cadastro', { length: 30 }),
		userAlteracao: varchar('user_alteracao', { length: 30 }),
		dataAlteracao: date('data_alteracao', { mode: 'date' }),
		trab: boolean().default(false),
		desencarnado: boolean().default(false),
		frequencia: boolean().default(false),
		amigoFraterno: boolean('amigo_fraterno').notNull().default(false),
		cidade: varchar(),
		incompleto: boolean(),
		status: boolean().default(true),
		aniversario: date({ mode: 'date' }),
		rg: varchar({ length: 12 }),
		cpf: varchar({ length: 15 }),
	},
	(table) => [unique('unique_leitor').on(table.nome)],
);

export const cadastroFotos = pgTable('cadastro_fotos', {
	cadastroId: integer('cadastro_id')
		.primaryKey()
		.notNull()
		.references(() => cadastros.idleitor, { onDelete: 'cascade' }),
	original: byteaColumn().notNull(),
	cartao: byteaColumn().notNull(),
});

export const tipoLancamento = pgEnum('tipo_lancamento', ['entrada', 'saida']);

export const lancamentos = pgTable(
	'lancamentos',
	{
		idlancamento: serial().primaryKey().notNull(),
		tipo: tipoLancamento().notNull(),
		descricao: varchar({ length: 200 }).notNull(),
		valor: numeric().notNull(),
		dataLancamento: date('data_lancamento', { mode: 'date' }).notNull(),
		idcontraparte: integer('idcontraparte').references(() => cadastros.idleitor, { onDelete: 'restrict' }),
		depositado: boolean(),
		uuidRecibo: uuid('uuid_recibo'),
		dataRegistro: date('data_registro', { mode: 'date' }),
		userCadastro: varchar('user_cadastro', { length: 30 }),
		userAlteracao: varchar('user_alteracao', { length: 30 }),
	},
	(table) => [
		check(
			'lancamentos_forma_tipo_ck',
			sql`(${table.tipo} = 'entrada' AND ${table.idcontraparte} IS NOT NULL AND ${table.depositado} IS NOT NULL AND ${table.uuidRecibo} IS NOT NULL) OR (${table.tipo} = 'saida' AND ${table.depositado} IS NULL AND ${table.uuidRecibo} IS NULL)`,
		),
		index('lancamentos_tipo_data_id_idx').on(table.tipo, desc(table.dataLancamento), desc(table.idlancamento)),
		index('lancamentos_contraparte_data_id_idx').on(
			table.idcontraparte,
			desc(table.dataLancamento),
			desc(table.idlancamento),
		),
		index('lancamentos_registro_id_idx').on(table.dataRegistro, table.idlancamento),
		index('lancamentos_caixa_idx')
			.on(table.dataLancamento, table.idlancamento)
			.where(sql`${table.tipo} = 'entrada' AND ${table.depositado} = false`),
		uniqueIndex('lancamentos_uuid_recibo_idx').on(table.uuidRecibo),
	],
);

export const estornos = pgTable(
	'estornos',
	{
		idlancamento: integer('idlancamento')
			.primaryKey()
			.notNull()
			.references(() => lancamentos.idlancamento, { onDelete: 'restrict' }),
		motivo: varchar({ length: 200 }).notNull(),
		userEstorno: varchar('user_estorno', { length: 30 }).notNull(),
		dataEstorno: date('data_estorno', { mode: 'date' }).defaultNow().notNull(),
	},
	(table) => [index('estornos_data_id_idx').on(desc(table.dataEstorno), desc(table.idlancamento))],
);

export const activeLancamentoPredicate = (idColumn = lancamentos.idlancamento) =>
	sql`NOT EXISTS (SELECT 1 FROM ${estornos} WHERE ${estornos.idlancamento} = ${idColumn})`;

export const autor = pgTable(
	'autor',
	{
		idautor: smallserial().primaryKey().notNull(),
		nome: varchar({ length: 60 }).notNull(),
		dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
	},
	(table) => [index('autor_nome_idx').on(table.nome)],
);

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

export const editora = pgTable(
	'editora',
	{
		ideditora: smallserial().primaryKey().notNull(),
		nome: varchar({ length: 60 }).notNull(),
		dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
	},
	(table) => [index('editora_nome_idx').on(table.nome)],
);

export const keyword = pgTable(
	'keyword',
	{
		idkeyword: smallserial().primaryKey().notNull(),
		chave: varchar({ length: 30 }).notNull(),
	},
	(table) => [index('keyword_chave_idx').on(table.chave)],
);

export const serie = pgTable('serie', {
	idserie: smallserial().primaryKey().notNull(),
	nome: varchar({ length: 60 }).notNull(),
	dataCadastro: date('data_cadastro', { mode: 'date' }).defaultNow(),
});

export const autorHasLivro = pgTable(
	'autor_has_livro',
	{ autor: integer().notNull(), livro: integer().notNull() },
	(table) => [primaryKey({ columns: [table.autor, table.livro], name: 'pk_autor_livro' })],
);

export const livroHasKeyword = pgTable(
	'livro_has_keyword',
	{ livro: integer().notNull(), keyword: integer().notNull(), referencia: varchar({ length: 100 }) },
	(table) => [primaryKey({ columns: [table.livro, table.keyword], name: 'pk_livro_keyword' })],
);

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

export const emprestimo = pgTable('emprestimo', {
	idemp: serial().primaryKey().notNull(),
	leitor: integer().notNull(),
	exemplar: smallint().notNull(),
	dataEmprestimo: date('data_emprestimo', { mode: 'date' }),
	dataDevolucao: date('data_devolucao', { mode: 'date' }),
	cobranca: timestamp({ mode: 'date' }),
	renovacoes: smallint().default(0),
	dataDevolvido: date('data_devolvido', { mode: 'date' }),
	userEmprestimo: varchar('user_emprestimo', { length: 30 }),
	userDevolucao: varchar('user_devolucao', { length: 30 }),
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
