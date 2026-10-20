<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import type { Tone } from '#lib/components/feedback/tone.js';

	type TagSize = 'normal' | 'medium';
	type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> & {
		kind?: Tone;
		light?: boolean;
		size?: TagSize;
		class?: ClassValue;
		children: Snippet;
	};

	const SOFT_TONES: Record<Tone, string> = {
		primary: 'bg-primary-soft text-primary-ink',
		link: 'bg-primary-soft text-primary-ink',
		info: 'bg-primary-soft text-info-ink',
		success: 'bg-success-soft text-success-ink',
		warning: 'bg-warning-soft text-warning-ink',
		danger: 'bg-danger-soft text-danger-ink',
	};

	const LIGHT_TONES: Record<Tone, string> = {
		primary: 'border border-divider bg-surface text-primary-ink',
		link: 'border border-divider bg-surface text-primary-ink',
		info: 'border border-divider bg-surface text-info-ink',
		success: 'border border-divider bg-surface text-success-ink',
		warning: 'border border-divider bg-surface text-warning-ink',
		danger: 'border border-divider bg-surface text-danger-ink',
	};

	const SIZES: Record<TagSize, string> = {
		normal: 'px-2.5 py-0.5 text-xs',
		medium: 'px-3 py-1 text-sm',
	};

	let { kind, light = false, size = 'normal', class: className, children, ...rest }: Props = $props();

	let toneClasses = $derived.by(() => {
		if (kind === undefined) return 'bg-surface-muted text-ink';
		return light ? LIGHT_TONES[kind] : SOFT_TONES[kind];
	});
</script>

<span {...rest} class={['inline-flex items-center rounded-full font-medium', toneClasses, SIZES[size], className]}>
	{@render children()}
</span>
