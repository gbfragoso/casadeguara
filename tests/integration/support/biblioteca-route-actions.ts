import { actions as author } from '../../../src/routes/(protected)/biblioteca/autores/+page.server';
import { actions as newAuthor } from '../../../src/routes/(protected)/biblioteca/autores/novo/+page.server';
import { actions as editAuthor } from '../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server';
import { actions as collection } from '../../../src/routes/(protected)/biblioteca/colecoes/+page.server';
import { actions as newCollection } from '../../../src/routes/(protected)/biblioteca/colecoes/novo/+page.server';
import { actions as editCollection } from '../../../src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server';
import { actions as publisher } from '../../../src/routes/(protected)/biblioteca/editoras/+page.server';
import { actions as newPublisher } from '../../../src/routes/(protected)/biblioteca/editoras/novo/+page.server';
import { actions as editPublisher } from '../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server';
import { actions as keyword } from '../../../src/routes/(protected)/biblioteca/keywords/+page.server';
import { actions as newKeyword } from '../../../src/routes/(protected)/biblioteca/keywords/novo/+page.server';
import { actions as editKeyword } from '../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server';
import { actions as reader } from '../../../src/routes/(protected)/biblioteca/leitores/+page.server';
import { actions as newReader } from '../../../src/routes/(protected)/biblioteca/leitores/novo/+page.server';
import { actions as editReader } from '../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server';
import { actions as notice } from '../../../src/routes/(protected)/biblioteca/avisos/+page.server';
import { actions as editNotice } from '../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server';
import { actions as bookList } from '../../../src/routes/(protected)/biblioteca/livros/+page.server';
import { actions as bookCreate } from '../../../src/routes/(protected)/biblioteca/livros/novo/+page.server';

export const protectedBibliotecaActions = [
	author.default,
	newAuthor.default,
	editAuthor.default,
	collection.default,
	newCollection.default,
	editCollection.default,
	publisher.default,
	newPublisher.default,
	editPublisher.default,
	keyword.default,
	newKeyword.default,
	editKeyword.default,
	reader.default,
	newReader.default,
	editReader.default,
	notice.default,
	editNotice.default,
	bookList.pesquisar,
	bookList.excluir,
	bookCreate.default,
];

export const bibliotecaListActions = [
	author.default,
	collection.default,
	publisher.default,
	keyword.default,
	reader.default,
];

export const bibliotecaCreateActions = [
	newAuthor.default,
	newCollection.default,
	newPublisher.default,
	newKeyword.default,
	newReader.default,
];

export const bibliotecaEditActions = [
	editAuthor.default,
	editCollection.default,
	editPublisher.default,
	editKeyword.default,
	editReader.default,
	editNotice.default,
];
