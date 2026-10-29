<script lang="ts">
	type Props = { slug: string };

	const ICON_PATHS: Record<string, string> = {
		biblioteca:
			'M5 9.6c5.4-2.3 10.9-1.5 16 1.9 5.2-3.5 10.7-4.1 16-1.7l-.3 23.9c-5.5-2.1-10.8-1.3-15.7 2.1-5.1-3.3-10.5-4-15.9-1.9zM21 11.5l.2 24.6M9.2 15.4c2.8-.7 5.7-.4 8.3.9M24.6 16.2c2.6-1.2 5.4-1.5 8.1-.8',
		evangelizacao:
			'M26.6 4.8l9.1 9.4-9.4 12-8.8-9.6zM26.4 5.4l-.1 20.4M18.3 16.9c5.8.4 11.6-.6 17-2.6M26.2 26c-2.6 3.9-7.3 2.7-9.7 6.2-2 2.9-5.6 3.8-9 2.3M15.6 30.4l2.8 3.4M10.8 33l1.4 3.2',
		jear: 'M11.2 13.1a4 4 0 1 1 8 .2 4 4 0 1 1-8-.2zM23.4 11a4.5 4.5 0 1 1 9-.1 4.5 4.5 0 1 1-9 .1zM6.8 33.2c.6-6.9 3.8-11 8.4-11.1 4.3 0 7.1 3.6 7.7 9.4M21.3 33.6c.9-8 4.1-12.7 6.9-12.6 3 .1 6.4 4.8 7.2 12.7',
		manjedoura:
			'M14.2 6.2c1.6 3 4 4.4 6.9 4.4s5.4-1.5 7-4.6l7 4.6-3.1 6-3.4-1.6.2 20.1c-5.2 1.7-11 1.6-16.1-.1l.2-20-3.6 1.6-2.9-6.1zM18 31.8l.1.6M24.2 31.8l-.1.6',
	};

	const GOLD_ICONS = new Set(['evangelizacao', 'manjedoura']);

	let { slug }: Props = $props();
	let isGold = $derived(GOLD_ICONS.has(slug));
</script>

<span
	aria-hidden="true"
	class={[
		'grid size-18 place-items-center rounded-full',
		isGold ? 'bg-tint-gold text-warning-ink' : 'bg-sky text-primary-ink',
	]}>
	<svg
		viewBox="0 0 42 42"
		class="size-10 fill-none stroke-current"
		stroke-width="2.6"
		stroke-linecap="round"
		stroke-linejoin="round">
		<path d={ICON_PATHS[slug]} />
	</svg>
</span>
