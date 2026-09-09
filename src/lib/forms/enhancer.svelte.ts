import { enhance } from '$app/forms';
import type { ActionResult } from '@sveltejs/kit';
import { fromAction } from 'svelte/attachments';

interface SubmissionUpdate {
	formData: FormData;
	formElement: HTMLFormElement;
	action: URL;
	result: ActionResult;
	update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
}

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
