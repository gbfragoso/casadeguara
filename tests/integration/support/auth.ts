import type { TestUser } from './request-event';

export const secretariaUser: TestUser = {
	id: 'integration-secretaria',
	username: 'secretaria',
	name: 'Secretaria',
	roles: 'secretaria',
};

export const secretariaAdminUser: TestUser = {
	...secretariaUser,
	roles: 'secretaria:admin',
};

export const bibliotecaUser: TestUser = {
	id: 'integration-biblioteca',
	username: 'biblioteca',
	name: 'Biblioteca',
	roles: 'biblioteca',
};

export const tesourariaUser: TestUser = {
	id: 'integration-tesouraria',
	username: 'tesouraria',
	name: 'Tesouraria',
	roles: 'tesouraria',
};
