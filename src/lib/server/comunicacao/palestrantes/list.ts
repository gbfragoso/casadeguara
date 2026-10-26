import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import { speakerSearchSchema } from '#lib/validation/comunicacao/palestrantes.js';
import { error } from '@sveltejs/kit';

type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; url: URL };

export const readSpeakerSearch = (url: URL) => {
	const busca = url.searchParams.get('nome') ?? '';
	const parsed = speakerSearchSchema.safeParse({ nome: busca });
	if (!parsed.success) error(400, parsed.error.issues[0].message);

	return { busca, termo: parsed.data.nome };
};

export const createSpeakerListLoad =
	({ speakers }: { speakers: Pick<PalestranteModel, 'list'> }) =>
	async ({ locals, url }: LoadContext) => {
		requireComunicacaoAccess(locals.user);

		const { busca, termo } = readSpeakerSearch(url);
		try {
			return { busca, palestrantes: await speakers.list(termo) };
		} catch (cause) {
			console.error('comunicacao.palestrantes.falha', { operacao: 'listar', error: cause });
			error(500, 'Falha ao carregar os palestrantes.');
		}
	};
