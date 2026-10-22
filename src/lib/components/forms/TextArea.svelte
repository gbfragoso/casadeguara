<script lang="ts">
	import type { ClassValue, HTMLTextareaAttributes } from 'svelte/elements';
	import { CONTROL_CLASSES } from '#lib/components/forms/control-classes.js';

	type Props = Omit<HTMLTextareaAttributes, 'class'> & { class?: ClassValue };

	let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<textarea {...rest} bind:value class={[CONTROL_CLASSES, 'py-2', className]}></textarea>
