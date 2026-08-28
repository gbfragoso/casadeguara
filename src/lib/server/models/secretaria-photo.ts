import { db } from '$lib/server/database/connection';

import type { CadastroDatabase } from './cadastro-database';
import { getCardPhoto, getSourcePhoto } from './cadastro-photo-read';
import { reframeSecretariaPhoto } from './cadastro-photo-reframe';
import { removeSecretariaPhoto, replaceSecretariaPhoto } from './cadastro-photo-write';

export class SecretariaPhotoModel {
	constructor(private readonly database: CadastroDatabase) {}

	getCard(id: number) {
		return getCardPhoto(this.database, id);
	}

	getSource(id: number) {
		return getSourcePhoto(this.database, id);
	}

	replace(id: number, source: Uint8Array, card: Uint8Array, actorId: string) {
		return replaceSecretariaPhoto(this.database, id, source, card, actorId);
	}

	reframe(id: number, expectedSource: Uint8Array, card: Uint8Array, actorId: string) {
		return reframeSecretariaPhoto(this.database, id, expectedSource, card, actorId);
	}

	remove(id: number, actorId: string) {
		return removeSecretariaPhoto(this.database, id, actorId);
	}
}

export const secretariaPhotoModel = new SecretariaPhotoModel(db);
