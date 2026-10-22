<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	type SkeletonSize = 'normal' | 'large';
	type SkeletonTone = 'muted' | 'highlight';
	type Props = {
		lines?: number;
		size?: SkeletonSize;
		tone?: SkeletonTone;
		class?: ClassValue;
	};

	const SIZES: Record<SkeletonSize, string> = {
		normal: 'h-4 rounded-sm',
		large: 'h-7 w-3/4 rounded-md',
	};

	const TONES: Record<SkeletonTone, string> = {
		muted: 'bg-surface-muted',
		highlight: 'bg-white/25',
	};

	let { lines = 1, size = 'normal', tone = 'muted', class: className }: Props = $props();
</script>

<div aria-hidden="true" class={['flex flex-col gap-2', className]}>
	{#each { length: lines }}
		<div class={['animate-skeleton motion-reduce:animate-none', SIZES[size], TONES[tone]]}></div>
	{/each}
</div>
