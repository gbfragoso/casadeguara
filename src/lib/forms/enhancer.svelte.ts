import { enhance, type SubmitFunction } from '$app/forms';
import { fromAction } from 'svelte/attachments';

type SubmissionCallback = Exclude<Awaited<ReturnType<SubmitFunction>>, void>;
type SubmissionUpdate = Parameters<SubmissionCallback>[0];

interface FormEnhancerOptions {
	afterUpdate?: (submission: SubmissionUpdate) => void | Promise<void>;
}

export const enhanceForm = fromAction(enhance);

export function createFormEnhancer({ afterUpdate }: FormEnhancerOptions = {}) {
	let loading = $state(false);

	const submit = () => {
		loading = true;

		return async (submission: SubmissionUpdate) => {
			try {
				await submission.update();
				await afterUpdate?.(submission);
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
