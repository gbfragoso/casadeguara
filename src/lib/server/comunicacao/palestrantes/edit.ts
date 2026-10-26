import {
	hasComunicacaoAdminAccess,
	requireComunicacaoAccess,
	requireComunicacaoAdminAccess,
} from '#lib/server/authorization/comunicacao.js';
import { DuplicatePalestranteNameError } from '#lib/server/models/palestrante-error.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import { fail, redirect } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { readSpeakerName, rejectSpeakerName, SPEAKERS_PATH } from './create';
import { failSpeakerOperation, missingSpeaker, runSpeakerOperation } from './failures';
import { createSpeakerPhotoActions, type SpeakerPhotoModel } from './photo-actions';

type EditModel = Pick<PalestranteModel, 'get' | 'rename' | 'remove'> & SpeakerPhotoModel;
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const UPDATED_STATUS = 200;

const describeUsage = (palestras: number) =>
	`Este palestrante está em ${palestras} ${palestras === 1 ? 'palestra' : 'palestras'} e não pode ser excluído.`;

const renameSpeaker = async (speakers: EditModel, { locals, params, request }: ActionContext) => {
	const user = requireComunicacaoAccess(locals.user);

	const { nome, parsed } = await readSpeakerName(request);
	if (!parsed.success) return rejectSpeakerName(nome, flattenError(parsed.error).fieldErrors.nome ?? []);

	const id = Number(params.id);
	let renamed: boolean;
	try {
		renamed = await speakers.rename(id, parsed.data.nome, user.id);
	} catch (cause) {
		if (cause instanceof DuplicatePalestranteNameError) return rejectSpeakerName(nome, [cause.message]);
		return failSpeakerOperation('renomear', id, cause);
	}

	return renamed ? { status: UPDATED_STATUS } : missingSpeaker();
};

const removeSpeaker = async (speakers: EditModel, { locals, params }: LoadContext) => {
	requireComunicacaoAdminAccess(locals.user);

	const id = Number(params.id);
	const removal = await runSpeakerOperation('excluir', id, () => speakers.remove(id));
	if (removal.status === 'missing') missingSpeaker();
	if (removal.status === 'in-use') return fail(400, { mensagem: describeUsage(removal.palestras) });

	redirect(303, SPEAKERS_PATH);
};

export const createSpeakerEditHandlers = ({ speakers }: { speakers: EditModel }) => ({
	load: async ({ locals, params }: LoadContext) => {
		const user = requireComunicacaoAccess(locals.user);

		const id = Number(params.id);
		const palestrante = (await runSpeakerOperation('carregar', id, () => speakers.get(id))) ?? missingSpeaker();
		return { palestrante, isAdmin: hasComunicacaoAdminAccess(user) };
	},
	actions: {
		salvar: (context: ActionContext) => renameSpeaker(speakers, context),
		excluir: (context: ActionContext) => removeSpeaker(speakers, context),
		...createSpeakerPhotoActions({ speakers }),
	},
});
