import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import { DuplicatePalestranteNameError } from '#lib/server/models/palestrante-error.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import { speakerSchema } from '#lib/validation/comunicacao/palestrantes.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { flattenError } from 'zod';

type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User } };
type ActionContext = LoadContext & { request: Request };

export const SPEAKERS_PATH = '/comunicacao/palestrantes';

export const readSpeakerName = async (request: Request) => {
	const nome = (await request.formData()).get('nome');
	const parsed = speakerSchema.safeParse({ nome });
	return { nome: typeof nome === 'string' ? nome : '', parsed };
};

export const rejectSpeakerName = (nome: string, messages: string[]) =>
	fail(400, { values: { nome }, errors: { nome: messages } });

const createSpeaker = async (speakers: Pick<PalestranteModel, 'create'>, nome: string, actorId: string) => {
	try {
		return await speakers.create(nome, actorId);
	} catch (cause) {
		if (cause instanceof DuplicatePalestranteNameError) return cause;
		console.error('comunicacao.palestrantes.falha', { operacao: 'criar', error: cause });
		error(500, 'Falha ao cadastrar o palestrante.');
	}
};

export const createSpeakerCreateHandlers = ({ speakers }: { speakers: Pick<PalestranteModel, 'create'> }) => ({
	load: ({ locals }: LoadContext) => {
		requireComunicacaoAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			const user = requireComunicacaoAccess(locals.user);

			const { nome, parsed } = await readSpeakerName(request);
			if (!parsed.success) return rejectSpeakerName(nome, flattenError(parsed.error).fieldErrors.nome ?? []);

			const created = await createSpeaker(speakers, parsed.data.nome, user.id);
			if (created instanceof DuplicatePalestranteNameError) return rejectSpeakerName(nome, [created.message]);

			redirect(303, `${SPEAKERS_PATH}/${created.id}`);
		},
	},
});
