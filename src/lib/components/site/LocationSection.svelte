<script lang="ts">
	import {
		INSTITUTION_ADDRESS,
		INSTITUTION_DIRECTIONS_URL,
		INSTITUTION_MAP_EMBED_URL,
		INSTITUTION_MAP_URL,
		INSTITUTION_POSTAL_CODE,
	} from '#lib/brand/institution.js';
</script>

<section id="como-chegar" aria-labelledby="titulo-como-chegar" class="bg-ground pt-12 pb-24 tablet:pt-16 tablet:pb-32">
	<div class="mx-auto max-w-7xl px-4 tablet:px-8">
		<h2 id="titulo-como-chegar" class="font-display text-display font-extrabold text-ink-strong">
			Venha nos visitar
		</h2>
		<div class="mt-12 grid items-center gap-10 desktop:grid-cols-[0.85fr_1.15fr] desktop:gap-16">
			<div>
				<address class="font-display text-3xl font-bold text-ink-strong not-italic">
					{INSTITUTION_ADDRESS}
				</address>
				<p class="mt-2 text-lg text-ink-muted">CEP {INSTITUTION_POSTAL_CODE}</p>
				<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
					<a
						href={INSTITUTION_DIRECTIONS_URL}
						rel="external"
						class="inline-flex h-14 items-center rounded-full bg-primary px-7 text-lg font-bold text-on-primary hover:bg-primary-700">
						Traçar rota
					</a>
					<a
						href={INSTITUTION_MAP_URL}
						rel="external"
						class="text-lg font-bold text-primary-ink underline underline-offset-4">
						Abrir mapa
					</a>
				</div>
			</div>
			<iframe
				title="Mapa com a localização da Casa de Guará"
				src={INSTITUTION_MAP_EMBED_URL}
				loading="lazy"
				class="h-80 w-full rounded-3xl border-8 border-sky tablet:h-105"></iframe>
		</div>
	</div>
</section>
