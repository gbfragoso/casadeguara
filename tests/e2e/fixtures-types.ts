import type { Page } from '@playwright/test';

import type { CadastroSnapshot, TestDatabase, TestUsers } from './cadastros-database';
import type { CadastroFixture } from './cadastros-fixture';
import type { NoticeFixture } from './avisos-support';
import type { PhotoSize } from './amigo-fraterno-support';
import type { BookSnapshot, LivroCatalog } from './livros-database';
import type { LancamentoSeed } from './lancamentos-fixture';
import type { LancamentoSnapshot, ReversalSnapshot } from './lancamentos-database';

export type Participant = { id: number; name: string };
export type E2EData = {
	token: string;
	database: TestDatabase;
	users: TestUsers;
	authenticate: (page: Page, role?: keyof TestUsers) => Promise<void>;
	createCadastro: () => CadastroFixture;
	createParticipant: (suffix: string, hasPhoto?: boolean, photoSize?: PhotoSize) => Promise<Participant>;
	readCadastro: (name: string) => Promise<CadastroSnapshot>;
	createNotices: () => Promise<string[]>;
	createNotice: () => Promise<NoticeFixture>;
	countNotices: (text: string) => Promise<number>;
	deleteCadastro: (name: string) => Promise<void>;
	setAmigoFraterno: (id: number, value: boolean) => Promise<void>;
	setWorker: (id: number, value: boolean) => Promise<void>;
	setDisincarnated: (id: number, value: boolean) => Promise<void>;
	advanceCadastroSequence: (value: number) => Promise<void>;
	restoreCadastroSequence: () => Promise<void>;
	createBookCatalog: () => Promise<LivroCatalog>;
	countBooksByTitle: (titulo: string) => Promise<number>;
	readBookByTitle: (titulo: string) => Promise<BookSnapshot | null>;
	createLancamento: (seed: LancamentoSeed) => Promise<LancamentoSnapshot>;
	createLancamentos: (seeds: LancamentoSeed[]) => Promise<LancamentoSnapshot[]>;
	readLancamento: (id: number) => Promise<LancamentoSnapshot>;
	readLancamentoByDescription: (description: string) => Promise<LancamentoSnapshot>;
	readReversal: (id: number) => Promise<ReversalSnapshot | null>;
};
export type FixtureResources = { data: E2EData; cleanup: () => Promise<void> };
