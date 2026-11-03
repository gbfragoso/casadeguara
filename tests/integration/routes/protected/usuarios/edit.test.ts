import { hash, verify } from 'argon2';
import { describe, expect, it } from 'vitest';

import { withUsers } from '../../../lib/server/models/user-test-support';
import { invoke } from '../../../support/request-event';
import { actions } from '../../../../../src/routes/(protected)/usuarios/[id=alphanumeric]/+page.server';
import {
	SUPERUSER,
	createAccountForm,
	createPostEvent,
	readStoredUser,
	settle,
	signedInAs,
	storePasswordHash,
	type AccountForm,
} from './support';

const OLD_PASSWORD = 'senha-antiga';
const NEW_PASSWORD = 'senha-nova';

const editUser = async (id: string, fields: AccountForm, editor = SUPERUSER) => {
	const { username } = await readStoredUser(id);
	const event = createPostEvent(editor, createAccountForm({ username, ...fields }), { id });

	return settle(() => invoke(actions.default, event));
};

describe('TI-05 duplicate login on edition', () => {
	it('refuses the login of another user without changing either row', async () => {
		await withUsers(['secretaria', 'secretaria'], async ([firstId, secondId]) => {
			const first = await readStoredUser(firstId);
			const second = await readStoredUser(secondId);

			const outcome = await editUser(secondId, { username: first.username, 'access-secretaria': 'volunteer' });

			expect(outcome).toMatchObject({
				status: 400,
				data: { errors: { username: ['Já existe um usuário com este login.'] } },
			});
			expect([await readStoredUser(firstId), await readStoredUser(secondId)]).toEqual([first, second]);
		});
	});
});

describe('TI-06 password on edition', () => {
	it('keeps the stored hash when the password is blank', async () => {
		await withUsers(['secretaria'], async ([id]) => {
			await storePasswordHash(id, await hash(OLD_PASSWORD));

			const outcome = await editUser(id, { 'access-secretaria': 'volunteer' });
			const { passwordHash } = await readStoredUser(id);

			expect(outcome).toEqual({ status: 200 });
			expect(await verify(passwordHash, OLD_PASSWORD)).toBe(true);
		});
	});

	it('accepts only the new password after it is changed', async () => {
		await withUsers(['secretaria'], async ([id]) => {
			await storePasswordHash(id, await hash(OLD_PASSWORD));

			await editUser(id, { password: NEW_PASSWORD, 'access-secretaria': 'volunteer' });
			const { passwordHash } = await readStoredUser(id);
			const accepted = [await verify(passwordHash, OLD_PASSWORD), await verify(passwordHash, NEW_PASSWORD)];

			expect(accepted).toEqual([false, true]);
		});
	});
});

describe('TI-07 promotion to coordination', () => {
	it('replaces the volunteer role and keeps the unknown role', async () => {
		await withUsers(['biblioteca,legado'], async ([id]) => {
			await editUser(id, { 'access-biblioteca': 'coordination' });

			expect((await readStoredUser(id)).roles).toBe('biblioteca:admin,legado');
		});
	});
});

describe('TI-09 own superuser role', () => {
	it('refuses its removal and keeps the stored roles', async () => {
		await withUsers(['superuser'], async ([id]) => {
			const outcome = await editUser(id, { 'access-secretaria': 'volunteer' }, signedInAs(id));

			expect(outcome).toMatchObject({
				status: 400,
				data: { errors: { superuser: ['Você não pode retirar a sua própria role de superusuário.'] } },
			});
			expect((await readStoredUser(id)).roles).toBe('superuser');
		});
	});
});
