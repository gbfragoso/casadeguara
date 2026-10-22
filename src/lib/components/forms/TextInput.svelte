<script lang="ts">
	import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
	import { CONTROL_CLASSES, FILE_CONTROL_CLASSES } from '#lib/components/forms/control-classes.js';

	type Props = Omit<HTMLInputAttributes, 'class'> & { class?: ClassValue };

	let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<input {...rest} bind:value class={[CONTROL_CLASSES, rest.type === 'file' && FILE_CONTROL_CLASSES, className]} />
