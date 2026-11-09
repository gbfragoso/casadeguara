<script lang="ts">
	import { BOARD_COORDINATIONS } from '#lib/site/board.js';
	import type { DepartmentPageContent } from '#lib/site/department-pages/types.js';

	type Props = { content: DepartmentPageContent; wide: boolean };

	let { content, wide }: Props = $props();
	let coordinations = $derived(content.coordenacao.map((key) => BOARD_COORDINATIONS[key]));
</script>

<div class={['grid content-start gap-5', wide && 'tablet:grid-cols-2']}>
	<section aria-labelledby="titulo-agenda" class="rounded-3xl bg-tint-sky p-7 text-ink-strong tablet:p-8">
		<h2 id="titulo-agenda" class="font-display text-2xl font-bold">{content.agenda.titulo}</h2>
		<dl class="mt-5 grid gap-4">
			{#each content.agenda.entradas as entry (entry.rotulo)}
				<div>
					<dt class="font-bold text-primary-ink">{entry.rotulo}</dt>
					<dd class="text-lg">{entry.horario}</dd>
				</div>
			{/each}
		</dl>
	</section>
	<section aria-labelledby="titulo-coordenacao" class="rounded-3xl bg-tint-gold p-7 text-ink-strong tablet:p-8">
		<h2 id="titulo-coordenacao" class="font-display text-2xl font-bold">Coordenação</h2>
		{#each coordinations as coordination (coordination.titulo)}
			<div class="mt-5">
				{#if coordinations.length > 1}
					<h3 class="font-bold text-balance">{coordination.titulo}</h3>
				{/if}
				<dl class="mt-2 grid gap-3">
					{#each coordination.membros as member (member.nome)}
						<div>
							<dt class="text-sm font-medium text-warning-ink">{member.cargo}</dt>
							<dd class="text-lg">{member.nome}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/each}
	</section>
</div>
