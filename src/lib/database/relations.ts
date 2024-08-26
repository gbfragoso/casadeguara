import { relations } from 'drizzle-orm/relations';
import {
	editora,
	livro,
	serie,
	exemplar,
	emprestimo,
	leitor,
	User,
	Session,
	contribuinte,
	entradas,
	autor,
	autor_has_livro,
	keyword,
	livro_has_keyword,
	acesso,
	usuario_has_acesso,
	usuario,
	reserva,
} from './schema';

export const livroRelations = relations(livro, ({ one, many }) => ({
	editora: one(editora, {
		fields: [livro.editora],
		references: [editora.ideditora],
	}),
	serie: one(serie, {
		fields: [livro.serie],
		references: [serie.idserie],
	}),
	exemplars: many(exemplar),
	autor_has_livros: many(autor_has_livro),
	livro_has_keywords: many(livro_has_keyword),
}));

export const editoraRelations = relations(editora, ({ many }) => ({
	livros: many(livro),
}));

export const serieRelations = relations(serie, ({ many }) => ({
	livros: many(livro),
}));

export const emprestimoRelations = relations(emprestimo, ({ one }) => ({
	exemplar: one(exemplar, {
		fields: [emprestimo.exemplar],
		references: [exemplar.idexemplar],
	}),
	leitor: one(leitor, {
		fields: [emprestimo.leitor],
		references: [leitor.idleitor],
	}),
}));

export const exemplarRelations = relations(exemplar, ({ one, many }) => ({
	emprestimos: many(emprestimo),
	livro: one(livro, {
		fields: [exemplar.livro],
		references: [livro.idlivro],
	}),
}));

export const leitorRelations = relations(leitor, ({ many }) => ({
	emprestimos: many(emprestimo),
	reservas: many(reserva),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
	User: one(User, {
		fields: [Session.userId],
		references: [User.id],
	}),
}));

export const UserRelations = relations(User, ({ many }) => ({
	Sessions: many(Session),
}));

export const entradasRelations = relations(entradas, ({ one }) => ({
	contribuinte: one(contribuinte, {
		fields: [entradas.idcontribuinte],
		references: [contribuinte.idcontribuinte],
	}),
}));

export const contribuinteRelations = relations(contribuinte, ({ many }) => ({
	entradas: many(entradas),
}));

export const autor_has_livroRelations = relations(autor_has_livro, ({ one }) => ({
	autor: one(autor, {
		fields: [autor_has_livro.autor],
		references: [autor.idautor],
	}),
	livro: one(livro, {
		fields: [autor_has_livro.livro],
		references: [livro.idlivro],
	}),
}));

export const autorRelations = relations(autor, ({ many }) => ({
	autor_has_livros: many(autor_has_livro),
}));

export const livro_has_keywordRelations = relations(livro_has_keyword, ({ one }) => ({
	keyword: one(keyword, {
		fields: [livro_has_keyword.keyword],
		references: [keyword.idkeyword],
	}),
	livro: one(livro, {
		fields: [livro_has_keyword.livro],
		references: [livro.idlivro],
	}),
}));

export const keywordRelations = relations(keyword, ({ many }) => ({
	livro_has_keywords: many(livro_has_keyword),
}));

export const usuario_has_acessoRelations = relations(usuario_has_acesso, ({ one }) => ({
	acesso: one(acesso, {
		fields: [usuario_has_acesso.acesso],
		references: [acesso.idacesso],
	}),
	usuario: one(usuario, {
		fields: [usuario_has_acesso.usuario],
		references: [usuario.idusuario],
	}),
}));

export const acessoRelations = relations(acesso, ({ many }) => ({
	usuario_has_acessos: many(usuario_has_acesso),
}));

export const usuarioRelations = relations(usuario, ({ many }) => ({
	usuario_has_acessos: many(usuario_has_acesso),
}));

export const reservaRelations = relations(reserva, ({ one }) => ({
	leitor: one(leitor, {
		fields: [reserva.leitor],
		references: [leitor.idleitor],
	}),
}));
