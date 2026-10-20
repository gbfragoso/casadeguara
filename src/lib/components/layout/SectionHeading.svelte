<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		element?: 'h2' | 'p' | 'legend';
		icon?: string;
		class?: ClassValue;
		children: Snippet;
	};

	let { element = 'h2', icon, class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={element}
	{...rest}
	class={['flex items-center gap-3 text-xl font-medium text-ink-strong', className]}>
	{#if icon}
		<span
			aria-hidden="true"
			class="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-ink">
			<i class={[icon, 'fa-fw']}></i>
		</span>
	{/if}
	{@render children()}
</svelte:element>
