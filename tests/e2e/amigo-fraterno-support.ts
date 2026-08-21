import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';

import { sql } from './cadastros-database';

export const createName = (suffix: string) => `AMF ${suffix} ${randomUUID().slice(0, 8)}`;

export const createParticipant = async (name: string, hasPhoto = false) => {
	const photo = hasPhoto ? await readFile('tests/fixtures/amigo-fraterno-photo.jpeg') : null;
	const [cadastro] = await sql<{ idleitor: number }[]>`
		insert into cadastros (nome, trab, desencarnado, amigo_fraterno, foto)
		values (${name}, true, false, false, ${photo})
		returning idleitor
	`;
	if (!cadastro) throw new Error('Cadastro do Amigo Fraterno não foi criado.');
	return cadastro.idleitor;
};

export const setAmigoFraterno = (id: number, value: boolean) =>
	sql`update cadastros set amigo_fraterno = ${value} where idleitor = ${id}`;

export const setWorker = (id: number, value: boolean) =>
	sql`update cadastros set trab = ${value} where idleitor = ${id}`;

export const setDisincarnated = (id: number, value: boolean) =>
	sql`update cadastros set desencarnado = ${value} where idleitor = ${id}`;

export const deleteParticipants = (names: string[]) => sql`delete from cadastros where nome = any(${names})`;

export const getPdfPageCount = async (bytes: Uint8Array) => {
	const document = await PDFDocument.load(bytes);
	return document.getPageCount();
};
