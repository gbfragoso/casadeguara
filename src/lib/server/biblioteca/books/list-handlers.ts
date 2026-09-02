import { requireLibraryAccess, requireLibraryAdminAccess } from '$lib/server/authorization/biblioteca';
import type { LivroModel } from '$lib/server/models/livro';
import { LivroHasDependentsError, LivroNotFoundError } from '$lib/server/models/livro-error';
import { livroDeleteSchema, livroSearchSchema } from '$lib/validation/livro';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { getLivroActionErrors, getLivroSearchValues } from './form';

type User = { roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request };
type LoadEvent = Pick<HandlerEvent, 'locals'>;
type ListModel = Pick<LivroModel, 'listCollectionOptions' | 'search' | 'delete'>;
type AccessChecker = (user: User) => { roles: string };

export type BookListHandlerDependencies = {
	model: ListModel;
	requireAccess?: AccessChecker;
	requireAdminAccess?: AccessChecker;
};

const getDeleteValues = (input: unknown) => {
	if (typeof input !== 'object' || input === null) return { idlivro: '' };
	const value = Reflect.get(input, 'idlivro');
	return { idlivro: typeof value === 'string' ? value : '' };
};

const isAdmin = (user: { roles: string }) => user.roles.split(',').some((role) => role === 'biblioteca:admin');

const createLoadHandler = (model: ListModel, requireAccess: AccessChecker) => async (event: LoadEvent) => {
	const user = requireAccess(event.locals.user);

	try {
		const colecoes = await model.listCollectionOptions();
		return { colecoes, isAdmin: isAdmin(user), role: user.roles };
	} catch {
		console.error('library.books.load_failed');
		error(500, { message: 'Falha ao carregar os dados dos livros.' });
	}
};

const createSearchHandler = (model: ListModel, requireAccess: AccessChecker) => async (event: HandlerEvent) => {
	requireAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const result = livroSearchSchema.safeParse(input);
	const values = getLivroSearchValues(input);

	if (!result.success) {
		return fail(400, { values, errors: getLivroActionErrors(flattenError(result.error).fieldErrors) });
	}

	try {
		const livros = await model.search(result.data);
		return { livros, values };
	} catch {
		console.error('library.books.search_failed');
		error(500, { message: 'Falha ao carregar a lista de livros.' });
	}
};

const createDeleteHandler = (model: ListModel, requireAdminAccess: AccessChecker) => async (event: HandlerEvent) => {
	requireAdminAccess(event.locals.user);
	const input: unknown = Object.fromEntries(await event.request.formData());
	const result = livroDeleteSchema.safeParse(input);
	const values = getDeleteValues(input);

	if (!result.success) {
		return fail(400, { values, errors: getLivroActionErrors(flattenError(result.error).fieldErrors) });
	}

	try {
		await model.delete(result.data.idlivro);
		return { outcome: 'deleted' as const, message: 'Livro excluído com sucesso.' };
	} catch (cause) {
		if (cause instanceof LivroNotFoundError) return fail(404, { values, message: cause.message });
		if (cause instanceof LivroHasDependentsError) return fail(409, { values, message: cause.message });

		console.error('library.books.delete_failed');
		error(500, { message: 'Falha ao excluir o livro.' });
	}
};

export const createBookListHandlers = ({
	model,
	requireAccess = requireLibraryAccess,
	requireAdminAccess = requireLibraryAdminAccess,
}: BookListHandlerDependencies) => ({
	load: createLoadHandler(model, requireAccess),
	actions: {
		pesquisar: createSearchHandler(model, requireAccess),
		excluir: createDeleteHandler(model, requireAdminAccess),
	},
});
