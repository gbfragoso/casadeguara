import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import type { LivroModel } from '$lib/server/models/livro';
import {
	DuplicateLivroTomboError,
	LivroHasDependentsError,
	LivroNotFoundError,
	LivroReferenceNotFoundError,
} from '$lib/server/models/livro-error';
import { livroCreateSchema, type LivroCreateInput } from '$lib/validation/livro';
import { error, fail } from '@sveltejs/kit';
import type { ActionFailure } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { getLivroActionErrors, getLivroFormValues } from './form';

type User = { roles: string } | null | undefined;
type HandlerEvent = { locals: { user: User }; request: Request };
type LoadEvent = Pick<HandlerEvent, 'locals'>;
type CreateModel = Pick<LivroModel, 'listPublisherOptions' | 'listCollectionOptions' | 'listAuthorOptions' | 'create'>;
type AccessChecker = (user: User) => { roles: string };
type BookActionData = import('./form').LivroFormState & {
	field?: string;
	status?: number;
	idlivro?: number;
};
type BookActionResult = BookActionData | ActionFailure<BookActionData>;
type FormValues = import('./form').LivroFormValues;

export type BookCreateHandlerDependencies = {
	model: CreateModel;
	requireAccess?: AccessChecker;
};

const createLoadHandler = (model: CreateModel, requireAccess: AccessChecker) => async (event: LoadEvent) => {
	requireAccess(event.locals.user);

	try {
		const [editoras, colecoes, autores] = await Promise.all([
			model.listPublisherOptions(),
			model.listCollectionOptions(),
			model.listAuthorOptions(),
		]);
		return { editoras, colecoes, autores };
	} catch {
		console.error('library.books.create_options_failed');
		error(500, { message: 'Falha ao carregar os dados do livro.' });
	}
};

const getCreateInput = (formData: FormData): unknown => ({
	...Object.fromEntries(formData),
	autores: formData.getAll('autores'),
});

const persistBook = async (
	model: CreateModel,
	input: LivroCreateInput,
	values: FormValues,
): Promise<BookActionResult> => {
	try {
		const created = await model.create(input);
		return { outcome: 'created', idlivro: created.idlivro, message: 'Livro cadastrado com sucesso.' };
	} catch (cause) {
		if (cause instanceof DuplicateLivroTomboError) {
			return fail(409, { values, errors: { tombo: [cause.message] } });
		}
		if (cause instanceof LivroReferenceNotFoundError) {
			return fail(400, { values, errors: { [cause.field]: [cause.message] } });
		}
		if (cause instanceof LivroNotFoundError) return fail(404, { values, message: cause.message });
		if (cause instanceof LivroHasDependentsError) return fail(409, { values, message: cause.message });

		console.error('library.books.create_failed');
		error(500, { message: 'Falha ao cadastrar um novo livro.' });
	}
};

const createActionHandler =
	(model: CreateModel, requireAccess: AccessChecker) =>
	async (event: HandlerEvent): Promise<BookActionResult> => {
		requireAccess(event.locals.user);
		const formData = await event.request.formData();
		const input = getCreateInput(formData);
		const result = livroCreateSchema.safeParse(input);
		const values = getLivroFormValues(input);

		if (!result.success) {
			return fail(400, { values, errors: getLivroActionErrors(flattenError(result.error).fieldErrors) });
		}

		return persistBook(model, result.data, values);
	};

export const createBookCreateHandlers = ({
	model,
	requireAccess = requireLibraryAccess,
}: BookCreateHandlerDependencies) => ({
	load: createLoadHandler(model, requireAccess),
	actions: { default: createActionHandler(model, requireAccess) },
});
