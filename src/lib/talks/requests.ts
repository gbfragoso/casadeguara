import type { ActionFields, SubmitAction } from '#lib/forms/action-request.js';
import type { ActionResult } from '$app/forms';
import type { TalkChange } from '#lib/validation/comunicacao/palestras.js';
import { z } from 'zod';

export type TalkRequestContext = {
	submit: SubmitAction;
	refresh: () => Promise<void>;
	onNotice: (message: string) => void;
};

export type TalkRequestResult = { ok: true } | { ok: false; message: string; campo?: string; stale: boolean };

type TalkVersion = { id: number; versao: number };

const SAVE_FAILURE_MESSAGE = 'Não foi possível salvar. Tente de novo.';
const DELETE_FAILURE_MESSAGE = 'Não foi possível excluir a palestra. Tente de novo.';
const STALE_FAILURE_CODES: readonly string[] = ['conflito', 'inexistente'];

const talkFailureSchema = z.object({ codigo: z.string(), mensagem: z.string(), campo: z.string().optional() });

const readFailure = (result: ActionResult, fallbackMessage: string) => {
	const parsed = result.type === 'failure' ? talkFailureSchema.safeParse(result.data) : undefined;
	if (!parsed?.success) return { mensagem: fallbackMessage, stale: false };

	const { codigo, mensagem, campo } = parsed.data;
	return { mensagem, campo, stale: STALE_FAILURE_CODES.includes(codigo) };
};

const submitTalkAction = async (
	submit: SubmitAction,
	action: `?/${string}`,
	fields: ActionFields,
): Promise<ActionResult | undefined> => {
	try {
		return await submit(action, fields);
	} catch (cause) {
		console.error('comunicacao.palestras.envio_falhou', { action, error: cause });
		return undefined;
	}
};

export const sendTalkRequest = async (
	context: TalkRequestContext,
	action: `?/${string}`,
	fields: ActionFields,
	fallbackMessage: string,
): Promise<TalkRequestResult> => {
	const result = await submitTalkAction(context.submit, action, fields);
	if (!result) return { ok: false, message: fallbackMessage, stale: false };
	if (result.type === 'success') {
		await context.refresh();
		return { ok: true };
	}

	const failure = readFailure(result, fallbackMessage);
	if (failure.stale) {
		await context.refresh();
		context.onNotice(failure.mensagem);
	}
	return { ok: false, message: failure.mensagem, campo: failure.campo, stale: failure.stale };
};

export const updateTalkField = (
	context: TalkRequestContext,
	talk: TalkVersion,
	campo: TalkChange['campo'],
	valor: string,
) =>
	sendTalkRequest(
		context,
		'?/atualizar',
		{ id: `${talk.id}`, versao: `${talk.versao}`, campo, valor },
		SAVE_FAILURE_MESSAGE,
	);

export const deleteTalk = async (context: TalkRequestContext, id: number) => {
	const result = await sendTalkRequest(context, '?/excluir', { id: `${id}` }, DELETE_FAILURE_MESSAGE);
	if (!result.ok && !result.stale) context.onNotice(result.message);
};
