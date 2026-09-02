import { signIn } from './cadastros-browser';
import {
	advanceCadastroSequence,
	closeDatabase,
	createDatabase,
	createTestUsers,
	deleteCadastro,
	deleteTestUsers,
	readCadastro,
	restoreCadastroSequence,
} from './cadastros-database';
import { createCadastroFixture } from './cadastros-fixture';
import {
	createName,
	createParticipant as insertParticipant,
	deleteParticipants,
	setAmigoFraterno,
	setDisincarnated,
	setWorker,
} from './amigo-fraterno-support';
import { countNotices, createNoticeFixture, createNoticeFixtures, deleteNotices } from './avisos-support';
import { countBooksByTitle, createBookCatalog, deleteBookCatalog, readBookByTitle } from './livros-database';
import type { E2EData, FixtureResources } from './fixtures-types';

const destinations = {
	owner: '**/sistemas',
	wrongRole: '**/biblioteca',
	tesouraria: '**/tesouraria',
	admin: '**/sistemas',
} as const;
const createToken = () => randomUUID().replaceAll('-', '').slice(0, 12);

const cleanupResources = async (
	database: Parameters<typeof closeDatabase>[0],
	token: string,
	users: E2EData['users'],
	names: Set<string>,
) => {
	const failures: unknown[] = [];
	for (const operation of [
		() => deleteBookCatalog(database, token),
		() => deleteParticipants(database, [...names]),
		() => deleteNotices(database, token),
		() => deleteTestUsers(database, users),
	]) {
		try {
			await operation();
		} catch (error) {
			failures.push(error);
		}
	}
	await closeDatabase(database);
	if (failures.length > 0) throw new AggregateError(failures, 'A limpeza da fixture E2E falhou.');
};

export const createFixtureResources = async (): Promise<FixtureResources> => {
	const token = createToken();
	const database = createDatabase();
	const users = await createTestUsers(database, token);
	const names = new Set<string>();
	const data: E2EData = {
		token,
		database,
		users,
		authenticate: (page, role = 'owner') =>
			signIn(page, users[role].email, users[role].password, destinations[role]),
		createCadastro: () => {
			const value = createCadastroFixture(token);
			names.add(value.name);
			return value;
		},
		createParticipant: async (suffix, hasPhoto, photoSize) => {
			const name = createName(`${suffix}-${token}`);
			names.add(name);
			return { name, id: await insertParticipant(database, name, hasPhoto, photoSize) };
		},
		readCadastro: (name) => readCadastro(database, name),
		createNotices: () => createNoticeFixtures(database, token),
		createNotice: () => createNoticeFixture(database, token),
		countNotices: (text) => countNotices(database, text),
		deleteCadastro: async (name) => {
			await deleteCadastro(database, name);
		},
		setAmigoFraterno: async (id, value) => {
			await setAmigoFraterno(database, id, value);
		},
		setWorker: async (id, value) => {
			await setWorker(database, id, value);
		},
		setDisincarnated: async (id, value) => {
			await setDisincarnated(database, id, value);
		},
		advanceCadastroSequence: async (value) => {
			await advanceCadastroSequence(database, value);
		},
		restoreCadastroSequence: async () => {
			await restoreCadastroSequence(database);
		},
		createBookCatalog: async () => createBookCatalog(database, token),
		countBooksByTitle: (titulo) => countBooksByTitle(database, titulo),
		readBookByTitle: (titulo) => readBookByTitle(database, titulo),
	};
	return { data, cleanup: () => cleanupResources(database, token, users, names) };
};
import { randomUUID } from 'node:crypto';
