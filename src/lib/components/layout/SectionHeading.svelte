<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type IconTone = 'primary' | 'danger';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		element?: 'h2' | 'p' | 'legend';
		icon?: string;
		iconTone?: IconTone;
		class?: ClassValue;
		children: Snippet;
	};

	const ICON_TONES: Record<IconTone, string> = {
		primary: 'bg-primary-soft text-primary-ink',
		danger: 'bg-danger-soft text-danger-ink',
	};

	let { element = 'h2', icon, iconTone = 'primary', class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={element}
	{...rest}
	class={['flex items-center gap-3 text-xl font-medium text-ink-strong', className]}>
	{#if icon}
		<span aria-hidden="true" class={['grid size-9 shrink-0 place-items-center rounded-md', ICON_TONES[iconTone]]}>
			<i class={[icon, 'fa-fw']}></i>
		</span>
	{/if}
	{@render children()}
</svelte:element>
