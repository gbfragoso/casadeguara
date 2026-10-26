import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { SpeakerImportOutcome } from '#lib/server/models/palestrante-import.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import { speakerImportSchema } from '#lib/validation/comunicacao/palestrantes.js';
import { error, fail, redirect } from '@sveltejs/kit';

import { SPEAKERS_PATH } from './create';
import { readSpeakerSearch } from './list';

type ImportModel = Pick<PalestranteModel, 'searchImportCandidates' | 'importFromCadastro'>;
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; url: URL };
type ActionContext = { locals: { user: User }; request: Request };
type RejectedOutcome = Exclude<SpeakerImportOutcome['status'], 'created' | 'linked'>;

const REJECTIONS: Record<RejectedOutcome, { status: number; mensagem: string }> = {
	missing: { status: 404, mensagem: 'Cadastro não encontrado.' },
	'already-imported': { status: 409, mensagem: 'Este cadastro já foi importado.' },
	'duplicate-name': { status: 400, mensagem: 'Já existe um palestrante com esse nome.' },
};

const failImport = (operacao: string, cause: unknown): never => {
	console.error('comunicacao.palestrantes.falha', { operacao, error: cause });
	error(500, 'Falha ao importar o palestrante.');
};

const searchCandidates = async (speakers: ImportModel, termo: string) => {
	if (!termo) return [];
	try {
		return await speakers.searchImportCandidates(termo);
	} catch (cause) {
		return failImport('buscar_cadastros', cause);
	}
};

const importSpeaker = async (speakers: ImportModel, { locals, request }: ActionContext) => {
	const user = requireComunicacaoAccess(locals.user);

	const parsed = speakerImportSchema.safeParse({ cadastroId: (await request.formData()).get('cadastroId') });
	if (!parsed.success) return fail(400, { mensagem: parsed.error.issues[0].message });

	let outcome: SpeakerImportOutcome;
	try {
		outcome = await speakers.importFromCadastro(parsed.data.cadastroId, user.id);
	} catch (cause) {
		return failImport('importar', cause);
	}
	if (outcome.status === 'created' || outcome.status === 'linked') {
		redirect(303, `${SPEAKERS_PATH}/${outcome.palestranteId}`);
	}

	const { status, mensagem } = REJECTIONS[outcome.status];
	return fail(status, { mensagem });
};

export const createSpeakerImportHandlers = ({ speakers }: { speakers: ImportModel }) => ({
	load: async ({ locals, url }: LoadContext) => {
		requireComunicacaoAccess(locals.user);

		const { busca, termo } = readSpeakerSearch(url);
		return { busca, candidatos: await searchCandidates(speakers, termo) };
	},
	actions: {
		importar: (context: ActionContext) => importSpeaker(speakers, context),
	},
});
