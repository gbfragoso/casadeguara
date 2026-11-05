<script lang="ts">
	import { DRAWN_ICON_PATHS, type DrawnIconName, type DrawnIconTone } from '#lib/site/drawn-icons.js';

	type Props = { name: DrawnIconName; tone: DrawnIconTone };

	let { name, tone }: Props = $props();
</script>

<span
	aria-hidden="true"
	class={[
		'grid size-18 shrink-0 place-items-center rounded-full',
		tone === 'gold' ? 'bg-tint-gold text-warning-ink' : 'bg-sky text-primary-ink',
	]}>
	<svg
		viewBox="0 0 42 42"
		class="size-10 fill-none stroke-current"
		stroke-width="2.6"
		stroke-linecap="round"
		stroke-linejoin="round">
		<path d={DRAWN_ICON_PATHS[name]} />
	</svg>
</span>
