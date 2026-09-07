import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { type ColecaoModel } from '$lib/server/models/colecao';
import { colecaoSchema } from '$lib/validation/colecao';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

type EditModel = Pick<ColecaoModel, 'get' | 'update'>;
type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

async function getColecao(model: Pick<ColecaoModel, 'get'>, id: number) {
	try {
		return await model.get(id);
	} catch (cause) {
		console.error('Falha ao recuperar os dados da coleção', cause);
		error(500, { message: 'Falha ao recuperar os dados da coleção' });
	}
}

async function updateColecao(model: Pick<ColecaoModel, 'update'>, id: number, name: string) {
	try {
		return await model.update(id, name);
	} catch (cause) {
		console.error('Falha ao atualizar os dados da coleção', cause);
		error(500, { message: 'Falha ao atualizar os dados da coleção' });
	}
}

const createEditLoad =
	(model: EditModel) =>
	async ({ locals, params }: LoadContext) => {
		requireLibraryAccess(locals.user);
		const id = Number(params.id);
		const colecao = await getColecao(model, id);

		if (!colecao) error(404, { message: 'Coleção não encontrada.' });
		return { colecao };
	};

const createEditAction =
	(model: EditModel) =>
	async ({ locals, params, request }: ActionContext) => {
		requireLibraryAccess(locals.user);
		const formData = await request.formData();
		const rawName = formData.get('nome');
		const result = colecaoSchema.safeParse({ nome: rawName });
		const values = { nome: getSubmittedName(rawName) };

		if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

		const id = Number(params.id);
		const updated = await updateColecao(model, id, result.data.nome);
		if (!updated) error(404, { message: 'Coleção não encontrada.' });

		return { status: 200 };
	};

export const createCollectionEditHandlers = ({ model }: { model: EditModel }) => ({
	load: createEditLoad(model),
	actions: { default: createEditAction(model) },
});
