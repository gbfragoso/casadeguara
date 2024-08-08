import { pgTable, smallint, integer, varchar, smallserial, date, char, text, boolean, foreignKey, unique, serial, timestamp, uniqueIndex, numeric, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const acervo = pgTable("acervo", {
	idexemplar: smallint("idexemplar"),
	numero: smallint("numero"),
	tombo: integer("tombo"),
	titulo: varchar("titulo", { length: 80 }),
	status: varchar("status", { length: 15 }),
});

export const aviso = pgTable("aviso", {
	idaviso: smallserial("idaviso").primaryKey().notNull(),
	data_cadastro: date("data_cadastro").default(sql`CURRENT_DATE`),
	texto: varchar("texto", { length: 300 }).notNull(),
});

export const configuracao = pgTable("configuracao", {
	idconf: smallserial("idconf").primaryKey().notNull(),
	chave: char("chave", { length: 128 }).notNull(),
	duracao_emprestimo: smallint("duracao_emprestimo"),
	duracao_renovacao: smallint("duracao_renovacao"),
	limite_emprestimo: smallint("limite_emprestimo"),
	limite_renovacao: smallint("limite_renovacao"),
	intervalo_emprestimo: smallint("intervalo_emprestimo"),
	cobranca: text("cobranca"),
});

export const usuario = pgTable("usuario", {
	idusuario: smallserial("idusuario").primaryKey().notNull(),
	nome: varchar("nome", { length: 50 }),
	login: varchar("login", { length: 20 }).notNull(),
	senha: char("senha", { length: 128 }).notNull(),
	tipo: varchar("tipo", { length: 15 }),
	data_cadastro: date("data_cadastro"),
	status: boolean("status").default(true),
});

export const vw_cobrancas = pgTable("vw_cobrancas", {
	leitor: varchar("leitor", { length: 60 }),
	email: varchar("email", { length: 60 }),
	livros: text("livros"),
});

export const autor = pgTable("autor", {
	idautor: smallserial("idautor").primaryKey().notNull(),
	nome: varchar("nome", { length: 60 }).notNull(),
	data_cadastro: date("data_cadastro"),
});

export const editora = pgTable("editora", {
	ideditora: smallserial("ideditora").primaryKey().notNull(),
	nome: varchar("nome", { length: 60 }).notNull(),
	data_cadastro: date("data_cadastro"),
});

export const livro = pgTable("livro", {
	idlivro: smallserial("idlivro").primaryKey().notNull(),
	tombo: varchar("tombo", { length: 8 }).notNull(),
	titulo: varchar("titulo", { length: 80 }).notNull(),
	editora: integer("editora").references(() => editora.ideditora),
	data_cadastro: date("data_cadastro"),
	serie: smallint("serie").references(() => serie.idserie),
	ordem: smallint("ordem"),
},
(table) => {
	return {
		tombo_unico: unique("tombo_unico").on(table.tombo),
	}
});

export const emprestimo = pgTable("emprestimo", {
	idemp: serial("idemp").primaryKey().notNull(),
	leitor: smallint("leitor").notNull().references(() => leitor.idleitor),
	exemplar: smallint("exemplar").notNull().references(() => exemplar.idexemplar, { onDelete: "cascade" } ),
	data_emprestimo: date("data_emprestimo"),
	data_devolucao: date("data_devolucao"),
	cobranca: timestamp("cobranca", { mode: 'string' }),
	renovacoes: smallint("renovacoes").default(0),
	user_emprestimo: smallint("user_emprestimo"),
	user_devolucao: smallint("user_devolucao"),
	data_devolvido: date("data_devolvido"),
});

export const exemplar = pgTable("exemplar", {
	idexemplar: smallserial("idexemplar").primaryKey().notNull(),
	livro: smallint("livro").notNull().references(() => livro.idlivro, { onDelete: "cascade" } ),
	numero: smallint("numero").notNull(),
	status: varchar("status", { length: 15 }),
	data_cadastro: date("data_cadastro"),
});

export const keyword = pgTable("keyword", {
	idkeyword: smallserial("idkeyword").primaryKey().notNull(),
	chave: varchar("chave", { length: 30 }).notNull(),
});

export const leitor = pgTable("leitor", {
	idleitor: smallserial("idleitor").primaryKey().notNull(),
	nome: varchar("nome", { length: 60 }).notNull(),
	email: varchar("email", { length: 60 }),
	telefone: varchar("telefone", { length: 12 }),
	celular: varchar("celular", { length: 12 }),
	logradouro: varchar("logradouro", { length: 80 }),
	bairro: varchar("bairro", { length: 30 }),
	complemento: varchar("complemento"),
	cep: varchar("cep", { length: 11 }),
	sexo: varchar("sexo", { length: 10 }),
	data_cadastro: date("data_cadastro"),
	trab: boolean("trab").default(false),
	cidade: varchar("cidade"),
	paciente: boolean("paciente"),
	incompleto: boolean("incompleto"),
	status: boolean("status").default(true),
	aniversario: char("aniversario", { length: 5 }),
	rg: varchar("rg", { length: 12 }),
	cpf: varchar("cpf", { length: 15 }),
},
(table) => {
	return {
		unique_leitor: unique("unique_leitor").on(table.nome),
	}
});

export const acesso = pgTable("acesso", {
	idacesso: smallserial("idacesso").primaryKey().notNull(),
	conteudo: varchar("conteudo", { length: 40 }),
});

export const serie = pgTable("serie", {
	idserie: smallserial("idserie").primaryKey().notNull(),
	nome: varchar("nome", { length: 60 }).notNull(),
	data_cadastro: date("data_cadastro"),
});

export const contribuinte = pgTable("contribuinte", {
	idcontribuinte: smallserial("idcontribuinte").primaryKey().notNull(),
	nome: varchar("nome", { length: 200 }).notNull(),
	trabalhador: boolean("trabalhador").notNull(),
});

export const Session = pgTable("Session", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId").notNull().references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	expiresAt: timestamp("expiresAt", { precision: 3, mode: 'date' }).notNull(),
});

export const User = pgTable("User", {
	id: text("id").primaryKey().notNull(),
	password_hash: varchar("password_hash", { length: 2000 }).notNull(),
	roles: varchar("roles", { length: 20 }).notNull(),
	username: varchar("username", { length: 30 }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
},
(table) => {
	return {
		username_key: uniqueIndex("User_username_key").using("btree", table.username),
	}
});

export const entradas = pgTable("entradas", {
	identrada: serial("identrada").primaryKey().notNull(),
	descricao: varchar("descricao", { length: 200 }).notNull(),
	valor: numeric("valor").notNull(),
	data_entrada: date("data_entrada", { mode: 'date' }).defaultNow().notNull(),
	idcontribuinte: integer("idcontribuinte").notNull().references(() => leitor.idleitor),
	user_cadastro: smallint("user_cadastro"),
	user_alteracao: smallint("user_alteracao"),
});

export const saidas = pgTable("saidas", {
	idsaida: serial("idsaida").primaryKey().notNull(),
	descricao: varchar("descricao", { length: 200 }).notNull(),
	valor: numeric("valor").notNull(),
	data_saida: date("data_saida").defaultNow().notNull(),
	user_cadastro: smallint("user_cadastro"),
	user_alteracao: smallint("user_alteracao"),
});

export const autor_has_livro = pgTable("autor_has_livro", {
	autor: integer("autor").notNull().references(() => autor.idautor, { onDelete: "cascade" } ),
	livro: integer("livro").notNull().references(() => livro.idlivro, { onDelete: "cascade" } ),
},
(table) => {
	return {
		pk_autor_livro: primaryKey({ columns: [table.autor, table.livro], name: "pk_autor_livro"}),
	}
});

export const livro_has_keyword = pgTable("livro_has_keyword", {
	livro: integer("livro").notNull().references(() => livro.idlivro, { onDelete: "cascade" } ),
	keyword: integer("keyword").notNull().references(() => keyword.idkeyword, { onDelete: "cascade" } ),
},
(table) => {
	return {
		pk_livro_keyword: primaryKey({ columns: [table.livro, table.keyword], name: "pk_livro_keyword"}),
	}
});

export const usuario_has_acesso = pgTable("usuario_has_acesso", {
	usuario: integer("usuario").notNull().references(() => usuario.idusuario, { onDelete: "cascade" } ),
	acesso: integer("acesso").notNull().references(() => acesso.idacesso, { onUpdate: "cascade" } ),
},
(table) => {
	return {
		pk_usuario_acesso: primaryKey({ columns: [table.usuario, table.acesso], name: "pk_usuario_acesso"}),
	}
});

export const reserva = pgTable("reserva", {
	leitor: integer("leitor").notNull().references(() => leitor.idleitor),
	livro: integer("livro").notNull(),
	data_expira: timestamp("data_expira", { mode: 'string' }),
},
(table) => {
	return {
		pk_leitor_exemplar: primaryKey({ columns: [table.leitor, table.livro], name: "pk_leitor_exemplar"}),
	}
});