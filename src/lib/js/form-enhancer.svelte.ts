import { enhance } from '$app/forms';
import { fromAction } from 'svelte/attachments';

interface SubmissionUpdate {
	update: () => Promise<void>;
}

export function createFormEnhancer() {
	let loading = $state(false);

	const submit = () => {
		loading = true;

		return async ({ update }: SubmissionUpdate) => {
			try {
				await update();
			} finally {
				loading = false;
			}
		};
	};

	return {
		submitWithLoading: fromAction(enhance, () => submit),
		get loading() {
			return loading;
		},
		submit,
	};
}
