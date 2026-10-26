import { deserialize, type ActionResult } from '$app/forms';

export type ActionFields = Record<string, string | readonly string[]>;
export type SubmitAction = (action: `?/${string}`, fields: ActionFields) => Promise<ActionResult>;

const toFormData = (fields: ActionFields) => {
	const form = new FormData();
	Object.entries(fields).forEach(([name, value]) => {
		const values = typeof value === 'string' ? [value] : value;
		values.forEach((item) => form.append(name, item));
	});
	return form;
};

export const submitAction: SubmitAction = async (action, fields) => {
	const response = await fetch(action, {
		method: 'POST',
		body: toFormData(fields),
		headers: { 'x-sveltekit-action': 'true' },
	});
	return deserialize(await response.text());
};
