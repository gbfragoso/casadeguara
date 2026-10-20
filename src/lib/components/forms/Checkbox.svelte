<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
	import { CHOICE_LABEL_CLASSES } from '#lib/components/forms/control-classes.js';

	type Props = Omit<HTMLInputAttributes, 'class' | 'children' | 'type'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { checked = $bindable(), class: className, children, ...rest }: Props = $props();
</script>

<label for={rest.id} class={[CHOICE_LABEL_CLASSES, className]}>
	<input {...rest} type="checkbox" bind:checked class="size-5 rounded-sm" />
	{@render children()}
</label>
