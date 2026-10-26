import type { ActionResult } from '$app/forms';
import { z } from 'zod';
import type { SubmitAction } from '#lib/forms/action-request.js';

export type DescriptionChangeResult = { ok: true; descricao: string } | { ok: false; message: string };

export const DESCRIPTION_SAVE_FAILURE_MESSAGE = 'Não foi possível salvar a descrição. Tente de novo.';

const savedDescriptionSchema = z.object({ descricao: z.string() });
const failureSchema = z.object({ message: z.string() });

const readResult = (result: ActionResult): DescriptionChangeResult => {
	const saved = result.type === 'success' ? savedDescriptionSchema.safeParse(result.data) : undefined;
	if (saved?.success) return { ok: true, descricao: saved.data.descricao };

	const failure = result.type === 'failure' ? failureSchema.safeParse(result.data) : undefined;
	return { ok: false, message: failure?.success ? failure.data.message : DESCRIPTION_SAVE_FAILURE_MESSAGE };
};

export const submitDescriptionChange = async (
	submit: SubmitAction,
	id: number,
	descricao: string,
): Promise<DescriptionChangeResult> => {
	try {
		return readResult(await submit('?/editarDescricao', { id: `${id}`, descricao }));
	} catch (cause) {
		console.error('treasury.launches.description_request_failed', { id, error: cause });
		return { ok: false, message: DESCRIPTION_SAVE_FAILURE_MESSAGE };
	}
};
