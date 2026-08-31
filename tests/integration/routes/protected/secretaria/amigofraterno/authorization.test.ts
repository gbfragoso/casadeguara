import { describe, expect, it } from 'vitest';

import { POST } from '../../../../../../src/routes/(protected)/api/cadastros/+server';
import { GET as getPhoto } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server';
import { GET as getOriginalPhoto } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/original/+server';
import { load as loadAmigoFraterno } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';
import { GET as getPdf } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/+server';
import { createRawCadastro, createTestName, deleteCadastro } from '../../../../lib/server/models/cadastro/test-support';
import { secretariaPhotoModel } from '$lib/server/models/secretaria-photo';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { bibliotecaUser, secretariaUser } from '../../../../support/auth';

const createFlagRequest = (id: number) =>
	new Request('http://localhost/api/cadastros', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ id, field: 'amigoFraterno', value: true }),
	});

describe('TI-06 protected route exports', () => {
	it('authorizes secretaria exports and rejects anonymous or foreign users', async () => {
		const created = await createRawCadastro(createTestName('route-auth'));
		try {
			await secretariaPhotoModel.replace(created.idleitor, Uint8Array.of(1), Uint8Array.of(2), secretariaUser.id);
			const allowed = await invoke(
				POST,
				createRequestEvent({
					locals: { user: secretariaUser, session: null },
					request: createFlagRequest(created.idleitor),
				}),
			);
			const rejected = await invoke(
				POST,
				createRequestEvent({
					locals: { user: bibliotecaUser, session: null },
					request: createFlagRequest(created.idleitor),
				}),
			);
			const photo = await invoke(
				getPhoto,
				createRequestEvent({
					locals: { user: secretariaUser, session: null },
					params: { id: `${created.idleitor}` },
				}),
			);
			const original = await invoke(
				getOriginalPhoto,
				createRequestEvent({
					locals: { user: secretariaUser, session: null },
					params: { id: `${created.idleitor}` },
				}),
			);
			const page = invoke(
				loadAmigoFraterno,
				createRequestEvent({ locals: { user: bibliotecaUser, session: null } }),
			);
			const pdf = await invoke(
				getPdf,
				createRequestEvent({
					locals: { user: null, session: null },
					url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
				}),
			);

			expect(allowed.status).toBe(200);
			expect(rejected.status).toBe(401);
			expect(photo.status).toBe(200);
			expect(await photo.bytes()).toEqual(Uint8Array.of(2));
			expect(original.status).toBe(200);
			expect(await original.bytes()).toEqual(Uint8Array.of(1));
			await expect(page).rejects.toMatchObject({ status: 401 });
			expect(pdf.status).toBe(401);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
