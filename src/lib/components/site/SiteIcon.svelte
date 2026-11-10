<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { SITE_ICONS, type SiteIconName } from '#lib/site/site-icons.js';

	type Props = { name: SiteIconName; class?: ClassValue };

	const LINE_STROKE_WIDTH = 2.4;

	let { name, class: className }: Props = $props();
	let icon = $derived(SITE_ICONS[name]);
	let isLine = $derived(icon.kind === 'line');
</script>

<svg
	viewBox={icon.viewBox}
	aria-hidden="true"
	focusable="false"
	data-icon={name}
	class={['size-[1em] shrink-0', isLine ? 'fill-none stroke-current' : 'fill-current', className]}
	stroke-width={isLine ? LINE_STROKE_WIDTH : undefined}
	stroke-linecap="round"
	stroke-linejoin="round">
	<path d={icon.path} />
</svg>
