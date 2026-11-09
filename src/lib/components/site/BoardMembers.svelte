<script lang="ts">
	import type { BoardMember } from '#lib/site/board.js';

	type Props = { members: readonly BoardMember[]; columns?: boolean };

	let { members, columns = false }: Props = $props();
</script>

<dl class={['grid gap-4', columns && 'tablet:grid-cols-2 tablet:gap-x-8']}>
	{#each members as member (member.cargo)}
		<div>
			<dt class="text-sm font-medium text-primary-ink">{member.cargo}</dt>
			<dd class="text-lg text-ink-strong">{member.nome}</dd>
		</div>
	{/each}
</dl>
