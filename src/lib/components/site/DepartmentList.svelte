<script lang="ts">
	import { resolve } from '$app/paths';
	import { DEPARTMENTS } from '#lib/site/departments.js';

	import DepartmentIcon from './DepartmentIcon.svelte';
	import SectionWave from './SectionWave.svelte';
</script>

<section
	id="departamentos"
	aria-labelledby="titulo-departamentos"
	class="relative bg-primary pt-24 pb-28 text-on-primary tablet:pt-36 tablet:pb-36">
	<SectionWave shape="crest" fill="fill-ground" edge="top" />
	<div class="mx-auto max-w-7xl px-4 tablet:px-8">
		<h2 id="titulo-departamentos" class="font-display text-display font-extrabold text-on-primary">
			Para todas as idades
		</h2>
		<p class="mt-4 max-w-xl text-lg text-primary-100">
			Estudo, convivência e trabalho no bem, de segunda a sábado.
		</p>
		<ul class="mt-12 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-4">
			{#each DEPARTMENTS as department (department.slug)}
				<li class="flex flex-col rounded-3xl bg-surface p-7 text-ink">
					<DepartmentIcon slug={department.slug} />
					<h3 class="mt-5 font-display text-2xl font-bold text-balance text-ink-strong">{department.nome}</h3>
					<p class="mt-3 grow text-ink-muted">{department.resumo}</p>
					{#if department.horarios.length > 0 || department.publico}
						<ul class="mt-5 flex flex-wrap gap-2 text-sm font-medium" aria-label="Horários e público">
							{#each department.horarios as horario (horario)}
								<li class="rounded-xl bg-sky px-3 py-1 text-primary-ink">{horario}</li>
							{/each}
							{#if department.publico}
								<li class="rounded-xl bg-tint-gold px-3 py-1 text-warning-ink">
									{department.publico}
								</li>
							{/if}
						</ul>
					{/if}
					{#if department.link}
						<a
							href={resolve(department.link.href)}
							class="mt-5 font-bold text-primary-ink underline underline-offset-4">
							{department.link.rotulo}
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
	<SectionWave shape="trough" fill="fill-warm-band" edge="bottom" />
</section>
