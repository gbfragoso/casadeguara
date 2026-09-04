import { hasTesourariaAdminAccess, requireTesourariaAccess } from '$lib/server/authorization/tesouraria';
import type { LancamentoModel } from './model';
import { LancamentoError } from './errors';
import { getDomainErrors, getLancamentoErrors, getLancamentoSearchValues } from './form';
import { lancamentoSearchSchema } from '$lib/validation/tesouraria/lancamentos';
import { error, fail } from '@sveltejs/kit';

type User = { id: string; roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request; url: URL };
type ListModel = Pick<LancamentoModel, 'search'>;
type AccessChecker = (user: User) => { id: string; roles: string };

export type LancamentoListHandlerDependencies = { model: ListModel; requireAccess?: AccessChecker };

const toInput = (value: unknown) => {
	if (!(value instanceof URL)) return value;
	return Object.fromEntries([...value.searchParams].filter(([key]) => key !== 'criado'));
};

const mapActionFailure = (cause: unknown, values: ReturnType<typeof getLancamentoSearchValues>) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR')
		return fail(400, { values, errors: getDomainErrors(cause.message) });
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
		return fail(404, { values, message: cause.message });
	console.error('treasury.launches.search_failed');
	error(500, { message: 'Falha ao carregar a lista de lançamentos.' });
};

const mapLoadFailure = (cause: unknown) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR') error(400, { message: cause.message });
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
		error(404, { message: cause.message });
	console.error('treasury.launches.search_failed');
	error(500, { message: 'Falha ao carregar a lista de lançamentos.' });
};

const parseSearch = (input: unknown) => {
	const result = lancamentoSearchSchema.safeParse(input);
	return result.success ? result : { success: false as const, error: result.error };
};

const createLoadHandler = (model: ListModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	const user = requireAccess(event.locals.user);
	const input = toInput(event.url);
	const result = parseSearch(input);
	if (!result.success) error(400, { message: 'Parâmetros de pesquisa inválidos.' });
	try {
		const page = await model.search(result.data);
		return {
			page,
			values: getLancamentoSearchValues(result.data),
			isAdmin: hasTesourariaAdminAccess(user),
		};
	} catch (cause) {
		return mapLoadFailure(cause);
	}
};

const createSearchHandler = (model: ListModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	requireAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const values = getLancamentoSearchValues(input);
	const result = parseSearch(input);
	if (!result.success) return fail(400, { values, errors: getLancamentoErrors(result.error) });
	try {
		const page = await model.search(result.data);
		return { page, values };
	} catch (cause) {
		return mapActionFailure(cause, values);
	}
};

export const createLancamentoListHandlers = ({
	model,
	requireAccess = requireTesourariaAccess,
}: LancamentoListHandlerDependencies) => ({
	load: createLoadHandler(model, requireAccess),
	actions: { pesquisar: createSearchHandler(model, requireAccess) },
});
