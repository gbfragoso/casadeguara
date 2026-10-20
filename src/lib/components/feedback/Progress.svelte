<script lang="ts">
	import type { ClassValue, HTMLProgressAttributes } from 'svelte/elements';

	type Props = Omit<HTMLProgressAttributes, 'class'> & { class?: ClassValue };

	let { class: className, ...rest }: Props = $props();
</script>

<progress
	{...rest}
	class={[
		'h-2 w-full appearance-none overflow-hidden rounded-full bg-surface-muted [&::-moz-progress-bar]:bg-primary-600 [&::-webkit-progress-bar]:bg-surface-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary-600',
		className,
	]}></progress>
