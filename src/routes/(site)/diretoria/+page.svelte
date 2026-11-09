<script lang="ts">
	import BoardMembers from '#lib/components/site/BoardMembers.svelte';
	import SitePageCover from '#lib/components/site/SitePageCover.svelte';
	import SitePageIntro from '#lib/components/site/SitePageIntro.svelte';
	import {
		BOARD_COORDINATIONS,
		BOARD_COVER,
		BOARD_NAME_LISTS,
		BOARD_OFFICES,
		BOARD_PERIOD,
		BOARD_STATUTE,
	} from '#lib/site/board.js';

	const coordinations = Object.values(BOARD_COORDINATIONS);
</script>

<SitePageIntro title="Diretoria" lead="Estrutura Administrativa de {BOARD_PERIOD}" />

<div class="relative mx-auto -mt-12 max-w-7xl px-4 pb-24 tablet:-mt-20 tablet:px-8 tablet:pb-32">
	<SitePageCover photo={BOARD_COVER} />

	<div class="mt-12 grid gap-10 tablet:mt-16 tablet:grid-cols-2 desktop:grid-cols-4 desktop:gap-8">
		{#each BOARD_OFFICES as office, index (office.titulo)}
			<section aria-labelledby="titulo-cargo-{index}" class="border-t-2 border-sky pt-6">
				<h2 id="titulo-cargo-{index}" class="font-display text-2xl font-bold text-balance text-ink-strong">
					{office.titulo}
				</h2>
				<div class="mt-5"><BoardMembers members={office.membros} /></div>
			</section>
		{/each}
	</div>

	<section aria-labelledby="titulo-coordenacoes" class="mt-16 rounded-3xl bg-tint-sky p-7 tablet:mt-20 tablet:p-10">
		<h2 id="titulo-coordenacoes" class="font-display text-display font-extrabold text-ink-strong">Coordenações</h2>
		<div class="mt-10 grid gap-x-8 gap-y-10 tablet:grid-cols-2 desktop:grid-cols-4">
			{#each coordinations as coordination (coordination.titulo)}
				<div>
					<h3 class="font-bold text-balance text-ink-strong">{coordination.titulo}</h3>
					<div class="mt-3"><BoardMembers members={coordination.membros} /></div>
				</div>
			{/each}
		</div>
	</section>

	<div class="mt-16 grid gap-10 tablet:mt-20 tablet:grid-cols-2 desktop:gap-16">
		{#each BOARD_NAME_LISTS as list, index (list.titulo)}
			<section aria-labelledby="titulo-lista-{index}" class="border-t-2 border-sky pt-6">
				<h2 id="titulo-lista-{index}" class="font-display text-2xl font-bold text-ink-strong">{list.titulo}</h2>
				<ul class="mt-5 grid gap-2 text-lg text-ink-strong">
					{#each list.nomes as name (name)}
						<li>{name}</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	<p class="mt-16 text-lg tablet:mt-20">
		Quer saber mais? Acesse o
		<a href={BOARD_STATUTE.href} rel="external" class="font-bold text-primary-ink underline underline-offset-4">
			{BOARD_STATUTE.rotulo}
		</a>
		(PDF, {BOARD_STATUTE.tamanho}).
	</p>
</div>
