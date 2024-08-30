import { relations } from 'drizzle-orm/relations';
import {
	livro,
	exemplar,
	editora,
	serie,
	emprestimo,
	leitor,
	keyword,
	livroHasKeyword,
	autor,
	autorHasLivro,
	acesso,
	usuarioHasAcesso,
	usuario,
} from './schema';

export const exemplarRelations = relations(exemplar, ({ one, many }) => ({
	livro: one(livro, {
		fields: [exemplar.livro],
		references: [livro.idlivro],
	}),
	emprestimos: many(emprestimo),
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
	livroHasKeywords: many(livroHasKeyword),
	autorHasLivros: many(autorHasLivro),
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

export const leitorRelations = relations(leitor, ({ many }) => ({
	emprestimos: many(emprestimo),
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
