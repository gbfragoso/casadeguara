<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';

	type ControlState = { describedBy: string | undefined; invalid: 'true' | undefined };
	type Props = {
		id: string;
		label: string;
		errors?: readonly string[];
		errorsId?: string;
		help?: string;
		helpId?: string;
		class?: ClassValue;
		control: Snippet<[ControlState]>;
	};

	let { id, label, errors = [], errorsId, help, helpId, class: className, control }: Props = $props();

	let resolvedErrorsId = $derived(errorsId ?? `${id}-errors`);
	let resolvedHelpId = $derived(helpId ?? `${id}-help`);
	let invalid: 'true' | undefined = $derived(errors.length > 0 ? 'true' : undefined);
	let describedBy = $derived(
		[help && resolvedHelpId, invalid && resolvedErrorsId].filter(Boolean).join(' ') || undefined,
	);
</script>

<div class={['flex min-w-0 flex-col gap-1.5', className]}>
	<label for={id} class="text-sm font-medium text-ink-strong">{label}</label>
	{@render control({ describedBy, invalid })}
	{#if help}
		<p id={resolvedHelpId} class="text-sm text-ink-muted">{help}</p>
	{/if}
	{#if invalid}
		<ErrorMessage element="div" id={resolvedErrorsId}>
			<div>
				{#each errors as message (message)}
					<p>{message}</p>
				{/each}
			</div>
		</ErrorMessage>
	{/if}
</div>
