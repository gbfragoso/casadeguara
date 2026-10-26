import { vi } from 'vitest';

import type { PalestranteModel, SpeakerDetail } from '#lib/server/models/palestrante.js';

export const VOLUNTEER = 'comunicacao';
export const COORDINATOR = 'comunicacao:admin';
export const SPEAKER_ID = 4;

export const SPEAKER: SpeakerDetail = {
	id: SPEAKER_ID,
	nome: 'Carmélia Amorim',
	temFoto: false,
	importado: false,
	fotoVersao: null,
};

export const createFakeSpeakers = () => ({
	list: vi.fn<PalestranteModel['list']>(async () => []),
	get: vi.fn<PalestranteModel['get']>(async () => SPEAKER),
	create: vi.fn<PalestranteModel['create']>(async () => ({ id: SPEAKER_ID })),
	rename: vi.fn<PalestranteModel['rename']>(async () => true),
	remove: vi.fn<PalestranteModel['remove']>(async () => ({ status: 'removed' })),
	searchImportCandidates: vi.fn<PalestranteModel['searchImportCandidates']>(async () => []),
	importFromCadastro: vi.fn<PalestranteModel['importFromCadastro']>(async () => ({
		status: 'created',
		palestranteId: SPEAKER_ID,
	})),
	getPhoto: vi.fn<PalestranteModel['getPhoto']>(async () => null),
	replacePhoto: vi.fn<PalestranteModel['replacePhoto']>(async () => true),
	reframePhoto: vi.fn<PalestranteModel['reframePhoto']>(async () => 'updated'),
	removePhoto: vi.fn<PalestranteModel['removePhoto']>(async () => true),
});
