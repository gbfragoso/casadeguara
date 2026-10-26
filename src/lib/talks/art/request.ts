import { resolve } from '$app/paths';
import { z } from 'zod';

export type TalkArtResult = { ok: true; image: Blob } | { ok: false; message: string; stale: boolean };

type TalkVersion = { id: number; versao: number };

const ART_FAILURE_MESSAGE = 'Não foi possível gerar a arte. Tente novamente.';
const STALE_STATUSES: readonly number[] = [404, 409];

const artFailureSchema = z.object({ message: z.string().min(1) });

const buildArtUrl = ({ id, versao }: TalkVersion) =>
	`${resolve('/(protected)/comunicacao/palestras/[id=integer]/arte', { id: `${id}` })}?versao=${versao}`;

const readFailureMessage = async (response: Response) => {
	const body: unknown = await response.json().catch(() => null);
	const parsed = artFailureSchema.safeParse(body);
	return parsed.success ? parsed.data.message : ART_FAILURE_MESSAGE;
};

const translateResponse = async (response: Response): Promise<TalkArtResult> => {
	if (response.ok) return { ok: true, image: await response.blob() };

	const message = await readFailureMessage(response);
	return { ok: false, message, stale: STALE_STATUSES.includes(response.status) };
};

export const requestTalkArt = async (
	fetcher: typeof fetch,
	talk: TalkVersion,
	signal: AbortSignal,
): Promise<TalkArtResult> => {
	try {
		return await translateResponse(await fetcher(buildArtUrl(talk), { signal }));
	} catch (cause) {
		if (!signal.aborted) console.error('comunicacao.palestras.arte_falhou', { palestraId: talk.id, error: cause });
		return { ok: false, message: ART_FAILURE_MESSAGE, stale: false };
	}
};
