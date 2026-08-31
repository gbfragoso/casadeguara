import { load as dashboard } from '../../../src/routes/(protected)/biblioteca/+page.server';
import { load as author } from '../../../src/routes/(protected)/biblioteca/autores/+page.server';
import { load as newAuthor } from '../../../src/routes/(protected)/biblioteca/autores/novo/+page.server';
import { load as editAuthor } from '../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server';
import { load as collection } from '../../../src/routes/(protected)/biblioteca/colecoes/+page.server';
import { load as newCollection } from '../../../src/routes/(protected)/biblioteca/colecoes/novo/+page.server';
import { load as editCollection } from '../../../src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server';
import { load as publisher } from '../../../src/routes/(protected)/biblioteca/editoras/+page.server';
import { load as editPublisher } from '../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server';
import { load as keyword } from '../../../src/routes/(protected)/biblioteca/keywords/+page.server';
import { load as newKeyword } from '../../../src/routes/(protected)/biblioteca/keywords/novo/+page.server';
import { load as editKeyword } from '../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server';
import { load as reader } from '../../../src/routes/(protected)/biblioteca/leitores/+page.server';
import { load as newReader } from '../../../src/routes/(protected)/biblioteca/leitores/novo/+page.server';
import { load as editReader } from '../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server';
import { load as notice } from '../../../src/routes/(protected)/biblioteca/avisos/+page.server';
import { load as editNotice } from '../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server';

export const protectedBibliotecaLoads = [
	dashboard,
	author,
	newAuthor,
	editAuthor,
	collection,
	newCollection,
	editCollection,
	publisher,
	editPublisher,
	keyword,
	newKeyword,
	editKeyword,
	reader,
	newReader,
	editReader,
	notice,
	editNotice,
];

export const bibliotecaSimpleLoads = [
	dashboard,
	author,
	newAuthor,
	collection,
	newCollection,
	publisher,
	keyword,
	newKeyword,
	reader,
	newReader,
	notice,
];
