<script lang="ts">
	import type { ChartData, ChartOptions } from 'chart.js';

	type Props = { data: ChartData<'line'>; options: ChartOptions<'line'>; [attribute: string]: unknown };

	let { data, options, ...rest }: Props = $props();
</script>

<canvas
	{...rest}
	data-entry-color={String(data.datasets[0]?.borderColor)}
	data-axis-color={String(options.scales?.x?.ticks?.color)}></canvas>
