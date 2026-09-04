import { requireTesourariaAdminAccess } from '$lib/server/authorization/tesouraria';
import type { LancamentoModel } from './model';
import { LancamentoError } from './errors';
import { getDomainErrors, getEstornoSearchValues, getLancamentoErrors } from './form';
import { estornoSearchSchema } from '$lib/validation/tesouraria/lancamentos';
import { error, fail } from '@sveltejs/kit';

type User = { id: string; roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request; url: URL };
type AuditModel = Pick<LancamentoModel, 'searchReversals'>;
type AccessChecker = (user: User) => { id: string; roles: string };

export type LancamentoAuditHandlerDependencies = { model: AuditModel; requireAdminAccess?: AccessChecker };

const parseSearch = (input: unknown) => estornoSearchSchema.safeParse(input);

const mapActionFailure = (cause: unknown, values: ReturnType<typeof getEstornoSearchValues>) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR')
		return fail(400, { values, errors: getDomainErrors(cause.message) });
	console.error('treasury.lancamentos.audit_failed');
	error(500, { message: 'Falha ao carregar a auditoria de estornos.' });
};

const mapLoadFailure = (cause: unknown) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR') error(400, { message: cause.message });
	console.error('treasury.lancamentos.audit_failed');
	error(500, { message: 'Falha ao carregar a auditoria de estornos.' });
};

const createLoadHandler = (model: AuditModel, requireAdminAccess: AccessChecker) => async (event: HandlerEvent) => {
	const user = requireAdminAccess(event.locals.user);
	const input = Object.fromEntries(event.url.searchParams);
	const result = parseSearch(input);
	if (!result.success) error(400, { message: 'Parâmetros de auditoria inválidos.' });
	try {
		const page = await model.searchReversals(result.data);
		return { page, values: getEstornoSearchValues(result.data), isAdmin: Boolean(user) };
	} catch (cause) {
		return mapLoadFailure(cause);
	}
};

const createSearchHandler = (model: AuditModel, requireAdminAccess: AccessChecker) => async (event: HandlerEvent) => {
	requireAdminAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const values = getEstornoSearchValues(input);
	const result = parseSearch(input);
	if (!result.success) return fail(400, { values, errors: getLancamentoErrors(result.error) });
	try {
		return { page: await model.searchReversals(result.data), values };
	} catch (cause) {
		return mapActionFailure(cause, values);
	}
};

export const createLancamentoAuditHandlers = ({
	model,
	requireAdminAccess = requireTesourariaAdminAccess,
}: LancamentoAuditHandlerDependencies) => ({
	load: createLoadHandler(model, requireAdminAccess),
	actions: { pesquisar: createSearchHandler(model, requireAdminAccess) },
});

export const createEstornoListHandlers = createLancamentoAuditHandlers;
