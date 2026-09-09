import type { ComponentProps } from 'svelte';

import BrlAmountInput from '$lib/components/forms/BrlAmountInput.svelte';

export const createAmountProps = (props: Partial<ComponentProps<typeof BrlAmountInput>> = {}) => {
	const componentProps = $state<ComponentProps<typeof BrlAmountInput>>({ id: 'valor', name: 'valor', ...props });
	return componentProps;
};
