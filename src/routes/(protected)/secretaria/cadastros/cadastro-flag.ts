export const cadastroFlagFields = ['trab', 'frequencia', 'desencarnado', 'amigoFraterno'] as const;
export type CadastroFlagField = (typeof cadastroFlagFields)[number];

type Checkbox = { checked: boolean };
type Mutation = { id: number; field: CadastroFlagField; value: boolean };
type FlagState = {
	setPending: (field: CadastroFlagField, id: number, pending: boolean) => void;
	setError: (message: string) => void;
};

const FAILURE_MESSAGE = 'Não foi possível atualizar o cadastro. Tente novamente.';

export const updateCadastroFlag = async (
	checkbox: Checkbox,
	mutation: Omit<Mutation, 'value'>,
	send: (data: Mutation) => Promise<Response>,
	state: FlagState,
) => {
	const value = checkbox.checked;
	state.setPending(mutation.field, mutation.id, true);
	state.setError('');

	try {
		const response = await send({ ...mutation, value });
		if (response.ok) return;

		checkbox.checked = !value;
		state.setError(FAILURE_MESSAGE);
	} catch {
		checkbox.checked = !value;
		state.setError(FAILURE_MESSAGE);
	} finally {
		state.setPending(mutation.field, mutation.id, false);
	}
};
