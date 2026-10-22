<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import type { Tone } from '#lib/components/feedback/tone.js';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		kind: Tone;
		element?: 'div' | 'p' | 'section';
		class?: ClassValue;
		children: Snippet;
	};

	const TONES: Record<Tone, string> = {
		primary: 'border-primary-ink/30 bg-primary-soft text-primary-ink',
		link: 'border-primary-ink/30 bg-primary-soft text-primary-ink',
		info: 'border-info-ink/30 bg-primary-soft text-info-ink',
		success: 'border-success-ink/30 bg-success-soft text-success-ink',
		warning: 'border-warning-ink/30 bg-warning-soft text-warning-ink',
		danger: 'border-danger-ink/30 bg-danger-soft text-danger-ink',
	};

	const ICONS: Record<Tone, string> = {
		primary: 'fa-solid fa-circle-info',
		link: 'fa-solid fa-circle-info',
		info: 'fa-solid fa-circle-info',
		success: 'fa-solid fa-circle-check',
		warning: 'fa-solid fa-triangle-exclamation',
		danger: 'fa-solid fa-circle-exclamation',
	};

	let { kind, element = 'div', class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={element}
	{...rest}
	class={['flex items-start gap-2 rounded-lg border p-4 wrap-anywhere', TONES[kind], className]}>
	<i class={[ICONS[kind], 'fa-fw mt-1']} aria-hidden="true"></i>
	{@render children()}
</svelte:element>
