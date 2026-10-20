<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import {
		COLUMN_SIZES,
		MOBILE_COLUMN_SIZES,
		TABLET_COLUMN_SIZES,
		type ColumnSize,
	} from '#lib/components/layout/column-sizes.js';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		size?: ColumnSize;
		tablet?: ColumnSize;
		mobile?: ColumnSize;
		class?: ClassValue;
		children: Snippet;
	};

	let { size, tablet, mobile, class: className, children, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={[
		'min-w-0',
		size === undefined ? 'flex-1' : COLUMN_SIZES[size],
		tablet !== undefined && TABLET_COLUMN_SIZES[tablet],
		mobile !== undefined && MOBILE_COLUMN_SIZES[mobile],
		className,
	]}>
	{@render children()}
</div>
