import { requireTesourariaAccess } from '$lib/server/authorization/tesouraria';
import type { LancamentoModel } from './model';
import { LancamentoError } from './errors';
import { getDomainErrors, getLancamentoErrors, getLancamentoFormValues } from './form';
import { createLancamentoFormSchema } from '$lib/validation/tesouraria/lancamentos';
import { error, fail, redirect } from '@sveltejs/kit';

type User = { id: string; roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request };
type LoadEvent = Pick<HandlerEvent, 'locals'>;
type CreateModel = Pick<LancamentoModel, 'listCounterpartOptions' | 'create'>;
type AccessChecker = (user: User) => { id: string; roles: string };

export type LancamentoCreateHandlerDependencies = { model: CreateModel; requireAccess?: AccessChecker };

const createLoadHandler =
	(model: CreateModel, requireAccess: AccessChecker) =>
	async ({ locals }: LoadEvent) => {
		requireAccess(locals.user);
		try {
			return { contrapartes: await model.listCounterpartOptions() };
		} catch {
			console.error('treasury.launches.create_failed');
			error(500, { message: 'Falha ao carregar as contrapartes.' });
		}
	};

const mapCreateFailure = (cause: unknown, values: ReturnType<typeof getLancamentoFormValues>) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR') {
		const field = cause.message.toLowerCase().includes('contraparte') ? 'contraparteId' : undefined;
		return fail(400, { values, errors: getDomainErrors(cause.message, field) });
	}
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
		return fail(404, { values, message: cause.message });
	console.error('treasury.launches.create_failed');
	error(500, { message: 'Falha ao cadastrar o lançamento.' });
};

const createActionHandler = (model: CreateModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	const user = requireAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const values = getLancamentoFormValues(input);
	const result = createLancamentoFormSchema.safeParse(input);
	if (!result.success) return fail(400, { values, errors: getLancamentoErrors(result.error) });
	let created;
	try {
		created = await model.create(result.data, user.id);
	} catch (cause) {
		return mapCreateFailure(cause, values);
	}
	if (created.tipo === 'entrada' && created.uuidRecibo) redirect(303, `/recibo/${created.uuidRecibo}`);
	if (created.tipo === 'saida') redirect(303, `/tesouraria/lancamentos?criado=${created.id}`);
	return mapCreateFailure(new Error('missing receipt identifier'), values);
};

export const createLancamentoCreateHandlers = ({
	model,
	requireAccess = requireTesourariaAccess,
}: LancamentoCreateHandlerDependencies) => ({
	load: createLoadHandler(model, requireAccess),
	actions: { default: createActionHandler(model, requireAccess) },
});
