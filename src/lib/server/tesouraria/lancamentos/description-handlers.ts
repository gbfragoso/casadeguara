import { error, fail } from '@sveltejs/kit';
import { requireTesourariaAccess } from '#lib/server/authorization/tesouraria.js';
import { INVALID_DATA_MESSAGE } from '#lib/validation/tesouraria/common.js';
import { lancamentoDescriptionSchema } from '#lib/validation/tesouraria/lancamentos.js';
import type { LancamentoModel } from './model';
import { LancamentoError, type LancamentoErrorCode } from './errors';

type User = { id: string; roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request };
type DescriptionModel = Pick<LancamentoModel, 'updateDescription'>;
type AccessChecker = (user: User) => { id: string; roles: string };

export type LancamentoDescriptionHandlerDependencies = { model: DescriptionModel; requireAccess?: AccessChecker };

const FAILURE_STATUS: Partial<Record<LancamentoErrorCode, number>> = {
	VALIDATION_ERROR: 400,
	LANCAMENTO_NOT_FOUND: 404,
	LANCAMENTO_ALREADY_REVERSED: 409,
};

const mapFailure = (cause: unknown) => {
	if (cause instanceof LancamentoError) {
		const status = FAILURE_STATUS[cause.code];
		if (status) return fail(status, { message: cause.message });
	}
	console.error('treasury.launches.description_update_failed');
	error(500, 'Falha ao alterar a descrição do lançamento.');
};

const parseInput = (input: unknown) => {
	const result = lancamentoDescriptionSchema.safeParse(input);
	if (result.success) return result;
	const idIssue = result.error.issues.find((issue) => issue.path[0] === 'id');
	const issue = idIssue ?? result.error.issues[0];
	return { success: false as const, status: idIssue ? 404 : 400, message: issue?.message ?? INVALID_DATA_MESSAGE };
};

const createUpdateHandler = (model: DescriptionModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	const user = requireAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const result = parseInput(input);
	if (!result.success) return fail(result.status, { message: result.message });
	try {
		const updated = await model.updateDescription(result.data.id, result.data.descricao, user.id);
		console.info('treasury.launches.description_updated', { id: updated.id, userId: user.id });
		return updated;
	} catch (cause) {
		return mapFailure(cause);
	}
};

export const createLancamentoDescriptionHandlers = ({
	model,
	requireAccess = requireTesourariaAccess,
}: LancamentoDescriptionHandlerDependencies) => ({
	actions: { editarDescricao: createUpdateHandler(model, requireAccess) },
});
