import { hash } from 'argon2';
import { randomUUID } from 'node:crypto';

import { createPhoto } from '../../amigo-fraterno-support';
import type { SeedSql } from './sql';
import type { SeedCalendar } from './calendar';

export type BaselineRole = 'admin' | 'reader';
export type BaselineUser = { id: string; email: string; password: string };
type Person = {
	nome: string;
	trab: boolean;
	desencarnado: boolean;
	aniversario: string;
	email: string | null;
	celular: string | null;
};

export const BIRTHDAY_MONTH = '03';
export const AUTOCOMPLETE_PREFIX = 'Mar';
const ATTENDANCES_PER_WORKER = 2;
const ATTENDING_WORKERS = 3;

function person(nome: string, trab: boolean, aniversario: string, email: string | null, celular: string | null) {
	return { nome, trab, desencarnado: false, aniversario, email, celular };
}

const PEOPLE: readonly Person[] = [
	person('Ana Beatriz Fictícia', true, '1980-03-05', 'ana.beatriz@exemplo.dev', '73900000001'),
	person('Bruno Carvalho Fictício', true, '1975-03-18', 'bruno.carvalho@exemplo.dev', '73900000002'),
	person('Carla Duarte Fictícia', true, '1990-07-22', null, null),
	{ ...person('Elisa Farias Fictícia', true, '1950-03-27', null, null), desencarnado: true },
	person('Marina Fontes Fictícia', false, '1985-03-09', 'marina.fontes@exemplo.dev', '73900000005'),
	person('Mário Gusmão Fictício', false, '1992-11-30', null, '73900000006'),
];

const USERS = {
	admin: {
		id: 'linha-de-base-admin',
		email: 'admin@linhadebase.dev',
		name: 'Helena Administradora Fictícia',
		roles: 'biblioteca:admin,secretaria:admin,tesouraria:admin',
	},
	reader: {
		id: 'linha-de-base-leitura',
		email: 'leitura@linhadebase.dev',
		name: 'Igor Leitura Fictício',
		roles: 'biblioteca,secretaria,tesouraria',
	},
} as const;

export const insertPeople = async (database: SeedSql) => {
	const ids: number[] = [];
	for (const entry of PEOPLE) {
		const [row] = await database<{ idleitor: number }[]>`
			insert into cadastros (nome, trab, desencarnado, aniversario, email, celular, logradouro, bairro, cidade, cep)
			values (${entry.nome}, ${entry.trab}, ${entry.desencarnado}, ${entry.aniversario}, ${entry.email},
				${entry.celular}, 'Rua das Acácias, 10', 'Centro', 'Itabuna', '45600000')
			returning idleitor
		`;
		ids.push(row.idleitor);
	}
	return ids;
};

export const insertPhoto = async (database: SeedSql, cadastroId: number) => {
	const photo = await createPhoto();
	await database`insert into cadastro_fotos (cadastro_id, original, cartao) values (${cadastroId}, ${photo}, ${photo})`;
};

export const insertAttendances = async (database: SeedSql, workerIds: number[], calendar: SeedCalendar) => {
	const rows = workerIds
		.slice(0, ATTENDING_WORKERS)
		.flatMap((trabalhador) =>
			Array.from({ length: ATTENDANCES_PER_WORKER }, () => ({ trabalhador, data_presenca: calendar.monthStart })),
		);
	await database`insert into frequencia ${database(rows, 'trabalhador', 'data_presenca')}`;
};

export const insertUsers = async (database: SeedSql): Promise<Record<BaselineRole, BaselineUser>> => {
	const password = randomUUID();
	const passwordHash = await hash(password);
	for (const user of Object.values(USERS)) {
		await database`
			insert into "User" (id, username, name, password_hash, roles)
			values (${user.id}, ${user.email}, ${user.name}, ${passwordHash}, ${user.roles})
		`;
	}
	return {
		admin: { id: USERS.admin.id, email: USERS.admin.email, password },
		reader: { id: USERS.reader.id, email: USERS.reader.email, password },
	};
};
