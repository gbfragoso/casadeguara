<script module lang="ts">
	const VARIANTS = {
		hero: { pixels: 68, loading: 'eager', classes: 'size-16 border-4' },
		card: { pixels: 48, loading: 'lazy', classes: 'size-12 border-2' },
	} as const;
</script>

<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = { talkId: number; variant: keyof typeof VARIANTS };

	let { talkId, variant }: Props = $props();
	let size = $derived(VARIANTS[variant]);
</script>

<img
	src={resolve('/palestras/[id=integer]/foto', { id: String(talkId) })}
	alt=""
	width={size.pixels}
	height={size.pixels}
	loading={size.loading}
	class={['shrink-0 rounded-full border-surface object-cover', size.classes]} />
