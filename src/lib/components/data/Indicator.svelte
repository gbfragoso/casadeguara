<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';

	type ValueTone = 'default' | 'primary' | 'success' | 'danger';
	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		label: string;
		icon: string;
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
		icon,
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
		'relative overflow-hidden rounded-xl p-5',
		highlight
			? 'bg-(image:--gradient-highlight) text-on-highlight shadow-highlight'
			: 'border border-divider bg-surface text-ink shadow-card',
		className,
	]}>
	{#if highlight}
		<span
			aria-hidden="true"
			class="absolute top-0 right-5 h-7 w-3.5 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]"
		></span>
	{/if}
	<p class="flex items-center gap-3 font-medium">
		<span
			aria-hidden="true"
			class={[
				'grid size-9 shrink-0 place-items-center rounded-md',
				highlight ? 'bg-white/15 text-on-highlight' : 'bg-primary-soft text-primary-ink',
			]}>
			<i class={[icon, 'fa-fw']}></i>
		</span>
		{label}
	</p>
	{#if loading}
		<SkeletonLines size="large" tone={highlight ? 'highlight' : 'muted'} class="mt-4" />
	{:else}
		<h2
			class={[
				'mt-4 text-3xl font-medium whitespace-nowrap tabular-nums',
				highlight ? 'text-on-highlight' : VALUE_TONES[valueTone],
			]}>
			{@render value?.()}
		</h2>
	{/if}
</article>
