import { relations } from 'drizzle-orm/relations';
import {
	exemplar,
	emprestimo,
	leitor,
	livro,
	editora,
	serie,
	user,
	session,
	entradas,
	frequencia,
	autor,
	autorHasLivro,
	keyword,
	livroHasKeyword,
	acesso,
	usuarioHasAcesso,
	usuario,
} from './schema';

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
	entradas: many(entradas),
	frequencias: many(frequencia),
}));

export const livroRelations = relations(livro, ({ one, many }) => ({
	exemplars: many(exemplar),
	editora: one(editora, {
		fields: [livro.editora],
		references: [editora.ideditora],
	}),
	serie: one(serie, {
		fields: [livro.serie],
		references: [serie.idserie],
	}),
	autorHasLivros: many(autorHasLivro),
	livroHasKeywords: many(livroHasKeyword),
}));

export const editoraRelations = relations(editora, ({ many }) => ({
	livros: many(livro),
}));

export const serieRelations = relations(serie, ({ many }) => ({
	livros: many(livro),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
}));

export const entradasRelations = relations(entradas, ({ one }) => ({
	leitor: one(leitor, {
		fields: [entradas.idcontribuinte],
		references: [leitor.idleitor],
	}),
}));

export const frequenciaRelations = relations(frequencia, ({ one }) => ({
	leitor: one(leitor, {
		fields: [frequencia.trabalhador],
		references: [leitor.idleitor],
	}),
}));

export const autorHasLivroRelations = relations(autorHasLivro, ({ one }) => ({
	autor: one(autor, {
		fields: [autorHasLivro.autor],
		references: [autor.idautor],
	}),
	livro: one(livro, {
		fields: [autorHasLivro.livro],
		references: [livro.idlivro],
	}),
}));

export const autorRelations = relations(autor, ({ many }) => ({
	autorHasLivros: many(autorHasLivro),
}));

export const livroHasKeywordRelations = relations(livroHasKeyword, ({ one }) => ({
	keyword: one(keyword, {
		fields: [livroHasKeyword.keyword],
		references: [keyword.idkeyword],
	}),
	livro: one(livro, {
		fields: [livroHasKeyword.livro],
		references: [livro.idlivro],
	}),
}));

export const keywordRelations = relations(keyword, ({ many }) => ({
	livroHasKeywords: many(livroHasKeyword),
}));

export const usuarioHasAcessoRelations = relations(usuarioHasAcesso, ({ one }) => ({
	acesso: one(acesso, {
		fields: [usuarioHasAcesso.acesso],
		references: [acesso.idacesso],
	}),
	usuario: one(usuario, {
		fields: [usuarioHasAcesso.usuario],
		references: [usuario.idusuario],
	}),
}));

export const acessoRelations = relations(acesso, ({ many }) => ({
	usuarioHasAcessos: many(usuarioHasAcesso),
}));

export const usuarioRelations = relations(usuario, ({ many }) => ({
	usuarioHasAcessos: many(usuarioHasAcesso),
}));
