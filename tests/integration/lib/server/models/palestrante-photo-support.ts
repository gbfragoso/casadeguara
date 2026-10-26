import { db } from '#lib/server/database/connection.js';
import { cadastroFotos, cadastros, palestranteFotos, palestrantes } from '#lib/server/database/schema.js';
import { eq, like } from 'drizzle-orm';
import sharp from 'sharp';

import { TEST_ACTOR_ID } from './palestra-test-support';

const LANDSCAPE = { width: 900, height: 500 };

export const createJpeg = (background = { r: 120, g: 60, b: 30 }) =>
	sharp({ create: { ...LANDSCAPE, channels: 3, background } })
		.jpeg()
		.toBuffer()
		.then((buffer) => new Uint8Array(buffer));

export const readImageSize = async (photo: Uint8Array) => {
	const { width, height } = await sharp(photo).metadata();
	return { width, height };
};

type CadastroSeed = { nome: string; desencarnado?: boolean; photo?: Uint8Array };

export const insertCadastro = async ({ nome, desencarnado = false, photo }: CadastroSeed) => {
	const [created] = await db
		.insert(cadastros)
		.values({ nome, desencarnado, userCadastro: TEST_ACTOR_ID })
		.returning({ id: cadastros.idleitor });
	if (photo) await db.insert(cadastroFotos).values({ cadastroId: created.id, original: photo, cartao: photo });
	return created.id;
};

export const readCadastroState = async (id: number) => {
	const [row] = await db
		.select({ cadastro: cadastros, foto: cadastroFotos })
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.where(eq(cadastros.idleitor, id));
	return row;
};

export const readSpeakerRow = async (id: number) =>
	(await db.select().from(palestrantes).where(eq(palestrantes.id, id))).at(0);

export const readSpeakerPhotos = async (id: number) =>
	(await db.select().from(palestranteFotos).where(eq(palestranteFotos.palestranteId, id))).at(0);

export const requireSpeakerPhotos = async (id: number) => {
	const photos = await readSpeakerPhotos(id);
	if (!photos) throw new Error(`Palestrante ${id} sem foto.`);
	return photos;
};

export const deleteCadastrosBy = (token: string) => db.delete(cadastros).where(like(cadastros.nome, `%${token}%`));
