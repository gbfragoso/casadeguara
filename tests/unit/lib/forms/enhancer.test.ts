import { describe, expect, it, vi } from 'vitest';

import { createFormEnhancer, enhanceForm } from '../../../../src/lib/forms/enhancer.svelte';

function createSubmission(update: () => Promise<void>) {
	return {
		formData: new FormData(),
		formElement: {} as HTMLFormElement,
		action: new URL('https://example.test/action'),
		result: { type: 'success' as const, status: 200 },
		update,
	};
}

describe('createFormEnhancer', () => {
	it('exposes a bare enhancement attachment', () => {
		expect(enhanceForm).toBeTypeOf('function');
	});

	it('exposes an attachment for submissions with loading state', () => {
		const formEnhancer = createFormEnhancer();

		expect(formEnhancer.submitWithLoading).toBeTypeOf('function');
	});

	it('keeps the form loading while the action result is updated', async () => {
		const formEnhancer = createFormEnhancer();
		const loadingStates: boolean[] = [];
		const update = vi.fn(async () => {
			loadingStates.push(formEnhancer.loading);
		});

		const completeSubmission = formEnhancer.submit();
		loadingStates.push(formEnhancer.loading);
		await completeSubmission(createSubmission(update));
		loadingStates.push(formEnhancer.loading);

		expect(update).toHaveBeenCalledOnce();
		expect(loadingStates).toEqual([true, true, false]);
	});

	it('clears the loading state when updating the action result fails', async () => {
		const formEnhancer = createFormEnhancer();
		const update = vi.fn(() => Promise.reject(new Error('network')));

		const completeSubmission = formEnhancer.submit();
		const completion = completeSubmission(createSubmission(update));

		await expect(completion).rejects.toThrow('network');
		expect(formEnhancer.loading).toBe(false);
	});

	it('runs the optional callback after updating the action result', async () => {
		const afterUpdate = vi.fn();
		const formEnhancer = createFormEnhancer({ afterUpdate });
		const update = vi.fn(async () => undefined);
		const submission = createSubmission(update);

		await formEnhancer.submit()(submission);

		expect(afterUpdate).toHaveBeenCalledOnce();
		expect(afterUpdate).toHaveBeenCalledWith(submission);
	});
});
