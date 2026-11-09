<script lang="ts">
	import { RECANTO_STAGES } from '#lib/site/recanto.js';

	import DrawnIcon from './DrawnIcon.svelte';
</script>

<ol class="grid gap-8 desktop:grid-cols-4">
	{#each RECANTO_STAGES as stage (stage.titulo)}
		<li
			class="relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 before:absolute before:top-22 before:-bottom-4 before:left-9 before:w-0.5 before:bg-sky-wave last:before:hidden desktop:block desktop:before:top-9 desktop:before:-right-4 desktop:before:bottom-auto desktop:before:left-22 desktop:before:h-0.5 desktop:before:w-auto">
			<DrawnIcon name={stage.icone} tone={stage.tom} />
			<div class="desktop:mt-6">
				<h3 class="font-display text-2xl font-bold hyphens-auto text-ink-strong">{stage.titulo}</h3>
				<p class="mt-1 font-bold text-primary-ink">{stage.etapa}</p>
				<p class="mt-3 text-lg">{stage.descricao}</p>
			</div>
		</li>
	{/each}
</ol>
