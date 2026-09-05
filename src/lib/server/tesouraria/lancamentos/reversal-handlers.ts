import { requireTesourariaAccess } from '$lib/server/authorization/tesouraria';
import type { LancamentoModel } from './model';
import { LancamentoError } from './errors';
import { getDomainErrors, getReasonValues } from './form';
import { estornoReasonSchema } from '$lib/validation/tesouraria/lancamentos';
import { error, fail } from '@sveltejs/kit';

type User = { id: string; roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request; params: Record<string, string> };
type ReversalModel = Pick<LancamentoModel, 'getForReversal' | 'reverse'>;
type AccessChecker = (user: User) => { id: string; roles: string };

export type LancamentoReversalHandlerDependencies = { model: ReversalModel; requireAccess?: AccessChecker };

const parseId = (value: string | undefined) => {
	const id = Number(value);
	return Number.isInteger(id) && id > 0 ? id : null;
};

const createLoadHandler = (model: ReversalModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	requireAccess(event.locals.user);
	const id = parseId(event.params.id);
	if (id === null) error(404, { message: 'Lançamento não encontrado.' });
	let lancamento;
	try {
		lancamento = await model.getForReversal(id);
	} catch (cause) {
		if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
			error(404, { message: cause.message });
		console.error('treasury.launches.reverse_failed');
		error(500, { message: 'Falha ao carregar o lançamento.' });
	}
	if (!lancamento) error(404, { message: 'Lançamento não encontrado.' });
	return { lancamento };
};

const mapFailure = (cause: unknown, values: ReturnType<typeof getReasonValues>) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR')
		return fail(400, { values, errors: getDomainErrors(cause.message, 'motivo') });
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
		return fail(404, { values, message: cause.message });
	if (
		cause instanceof LancamentoError &&
		['LANCAMENTO_ALREADY_REVERSED', 'LANCAMENTO_NOT_DEPOSITABLE'].includes(cause.code)
	)
		return fail(409, { values, message: cause.message });
	console.error('treasury.launches.reverse_failed');
	error(500, { message: 'Falha ao estornar o lançamento.' });
};

const createActionHandler = (model: ReversalModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	const user = requireAccess(event.locals.user);
	const id = parseId(event.params.id);
	if (id === null) return fail(404, { values: { motivo: '' }, message: 'Lançamento não encontrado.' });
	const input: unknown = Object.fromEntries(await event.request.formData());
	const values = getReasonValues(input);
	const result = estornoReasonSchema.safeParse(values.motivo);
	if (!result.success) {
		const message = result.error.issues[0]?.message ?? 'Motivo do estorno é obrigatório.';
		return fail(400, { values, errors: getDomainErrors(message, 'motivo') });
	}
	try {
		await model.reverse(id, result.data, user.id);
		console.info('treasury.launches.reversed', { id, userId: user.id });
		return { status: 200, message: 'Lançamento estornado com sucesso.' };
	} catch (cause) {
		return mapFailure(cause, values);
	}
};

export const createLancamentoReversalHandlers = ({
	model,
	requireAccess = requireTesourariaAccess,
}: LancamentoReversalHandlerDependencies) => {
	const action = createActionHandler(model, requireAccess);
	return { load: createLoadHandler(model, requireAccess), actions: { default: action } };
};
