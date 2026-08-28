import { db } from '$lib/server/database/connection';

import { createBiblioteca, updateBiblioteca } from './cadastro-biblioteca';
import type { CadastroDatabase } from './cadastro-database';
import type {
	BibliotecaCreateData,
	BibliotecaUpdateData,
	SecretariaCreateData,
	SecretariaFlagData,
	SecretariaUpdateData,
	TesourariaCreateData,
	TesourariaUpdateData,
} from './cadastro-inputs';
import {
	fetchBiblioteca,
	fetchSecretaria,
	fetchTesouraria,
	getBiblioteca,
	getSecretaria,
	getTesouraria,
} from './cadastro-reader';
import { createSecretaria, updateSecretaria, updateSecretariaFlag } from './cadastro-secretaria';
import { createTesouraria, updateTesouraria } from './cadastro-tesouraria';

export class CadastroModel {
	constructor(private readonly database: CadastroDatabase) {}

	fetchBiblioteca(name: string) {
		return fetchBiblioteca(this.database, name);
	}

	getBiblioteca(id: number) {
		return getBiblioteca(this.database, id);
	}

	createBiblioteca(input: BibliotecaCreateData, userCadastro: string) {
		return createBiblioteca(this.database, input, userCadastro);
	}

	updateBiblioteca(id: number, input: BibliotecaUpdateData, userAlteracao: string) {
		return updateBiblioteca(this.database, id, input, userAlteracao);
	}

	fetchSecretaria(name: string, workersOnly: boolean) {
		return fetchSecretaria(this.database, name, workersOnly);
	}

	getSecretaria(id: number) {
		return getSecretaria(this.database, id);
	}

	createSecretaria(input: SecretariaCreateData, userCadastro: string) {
		return createSecretaria(this.database, input, userCadastro);
	}

	updateSecretaria(id: number, input: SecretariaUpdateData, userAlteracao: string) {
		return updateSecretaria(this.database, id, input, userAlteracao);
	}

	updateSecretariaFlag(id: number, flag: SecretariaFlagData, userAlteracao: string) {
		return updateSecretariaFlag(this.database, id, flag, userAlteracao);
	}

	fetchTesouraria(name: string) {
		return fetchTesouraria(this.database, name);
	}

	getTesouraria(id: number) {
		return getTesouraria(this.database, id);
	}

	createTesouraria(input: TesourariaCreateData, userCadastro: string) {
		return createTesouraria(this.database, input, userCadastro);
	}

	updateTesouraria(id: number, input: TesourariaUpdateData, userAlteracao: string) {
		return updateTesouraria(this.database, id, input, userAlteracao);
	}
}

export const cadastroModel = new CadastroModel(db);
