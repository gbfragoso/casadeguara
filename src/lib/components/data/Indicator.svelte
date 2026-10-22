<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';

	type ValueTone = 'default' | 'primary' | 'success' | 'danger';
	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		label: string;
		loading?: boolean;
		highlight?: boolean;
		valueTone?: ValueTone;
		class?: ClassValue;
		value?: Snippet;
	};

	const VALUE_TONES: Record<ValueTone, string> = {
		default: 'text-ink-strong',
		primary: 'text-primary-ink',
		success: 'text-success-ink',
		danger: 'text-danger-ink',
	};

	let {
		label,
		loading = false,
		highlight = false,
		valueTone = 'default',
		class: className,
		value,
		...rest
	}: Props = $props();
</script>

<article
	{...rest}
	class={[
		'@container relative flex flex-col overflow-hidden rounded-xl p-5 shadow-card',
		highlight ? 'bg-highlight text-on-highlight' : 'border border-divider bg-surface text-ink',
		className,
	]}>
	{#if highlight}
		<span
			aria-hidden="true"
			class="absolute top-0 right-5 h-7 w-3.5 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]"
		></span>
	{/if}
	<p class={['mb-3 font-medium', highlight ? 'pr-6' : 'text-ink-muted']}>{label}</p>
	{#if loading}
		<SkeletonLines size="large" tone={highlight ? 'highlight' : 'muted'} class="mt-auto h-9 justify-center" />
	{:else}
		<h2
			class={[
				'mt-auto text-[length:clamp(1.25rem,13cqi,1.875rem)] leading-9 font-medium whitespace-nowrap tabular-nums',
				highlight ? 'text-on-highlight' : VALUE_TONES[valueTone],
			]}>
			{@render value?.()}
		</h2>
	{/if}
</article>
