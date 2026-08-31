import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

import type { TestDatabase } from './cadastros-database';

export const createName = (suffix: string) => `AMF ${suffix} ${randomUUID().slice(0, 8)}`;

export type PhotoSize = { width: number; height: number };

export const createPhoto = async (photoSize?: PhotoSize) => {
	if (!photoSize) return readFile('tests/fixtures/amigo-fraterno-photo.jpeg');
	return sharp({
		create: {
			width: photoSize.width,
			height: photoSize.height,
			channels: 3,
			background: { r: photoSize.width % 255, g: photoSize.height % 255, b: 80 },
		},
	})
		.jpeg()
		.toBuffer();
};

export const createParticipant = async (
	database: TestDatabase,
	name: string,
	hasPhoto = false,
	photoSize?: PhotoSize,
) => {
	const [cadastro] = await database<{ idleitor: number }[]>`
		insert into cadastros (nome, trab, desencarnado, amigo_fraterno)
		values (${name}, true, false, false)
		returning idleitor
	`;
	if (!cadastro) throw new Error('Cadastro do Amigo Fraterno não foi criado.');
	if (hasPhoto) {
		const photo = await createPhoto(photoSize);
		await database`
			insert into cadastro_fotos (cadastro_id, original, cartao)
			values (${cadastro.idleitor}, ${photo}, ${photo})
		`;
	}
	return cadastro.idleitor;
};

export const setAmigoFraterno = (database: TestDatabase, id: number, value: boolean) =>
	database`update cadastros set amigo_fraterno = ${value} where idleitor = ${id}`;

export const setWorker = (database: TestDatabase, id: number, value: boolean) =>
	database`update cadastros set trab = ${value} where idleitor = ${id}`;

export const setDisincarnated = (database: TestDatabase, id: number, value: boolean) =>
	database`update cadastros set desencarnado = ${value} where idleitor = ${id}`;

export const deleteParticipants = (database: TestDatabase, names: string[]) =>
	database`delete from cadastros where nome = any(${names})`;

export const getPdfPageCount = async (bytes: Uint8Array) => {
	const document = await PDFDocument.load(bytes);
	return document.getPageCount();
};
