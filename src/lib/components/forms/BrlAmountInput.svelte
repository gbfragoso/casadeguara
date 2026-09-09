<script lang="ts">
	import { createBrlAmountState, updateBrlAmountState } from '$lib/forms/brl-amount';

	interface Props {
		id: string;
		name: string;
		value?: string;
		required?: boolean;
		invalid?: 'true';
		describedBy?: string;
	}

	let { id, name, value = $bindable(''), required = false, invalid, describedBy }: Props = $props();
	let amountState = $derived(createBrlAmountState(value));

	function validateInput(element: HTMLInputElement) {
		$effect(() => {
			element.setCustomValidity(required && amountState.canonicalValue === '' ? 'Valor é obrigatório.' : '');
		});
	}

	function handleInput(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		const nextState = updateBrlAmountState(amountState, element.value);
		value = nextState.canonicalValue;
		element.value = nextState.displayValue;
		element.setSelectionRange(nextState.displayValue.length, nextState.displayValue.length);
	}
</script>

<input
	{@attach validateInput}
	{id}
	class="input"
	type="text"
	inputmode="numeric"
	{required}
	value={amountState.displayValue}
	aria-invalid={invalid}
	aria-describedby={describedBy}
	oninput={handleInput} />
<input type="hidden" {name} value={amountState.canonicalValue} />
