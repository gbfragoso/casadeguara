import { describe, expect, it, vi } from 'vitest';

import { createFormEnhancer } from '../../../../src/lib/js/form-enhancer.svelte';

describe('createFormEnhancer', () => {
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
		await completeSubmission({ update });
		loadingStates.push(formEnhancer.loading);

		expect(update).toHaveBeenCalledOnce();
		expect(loadingStates).toEqual([true, true, false]);
	});

	it('clears the loading state when updating the action result fails', async () => {
		const formEnhancer = createFormEnhancer();
		const update = vi.fn(() => Promise.reject(new Error('network')));

		const completeSubmission = formEnhancer.submit();
		const completion = completeSubmission({ update });

		await expect(completion).rejects.toThrow('network');
		expect(formEnhancer.loading).toBe(false);
	});
});
