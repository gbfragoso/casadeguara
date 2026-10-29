<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		INSTITUTION_ADDRESS,
		INSTITUTION_EMAIL,
		INSTITUTION_INSTAGRAM_URL,
		INSTITUTION_NAME,
		INSTITUTION_POSTAL_CODE,
		INSTITUTION_YOUTUBE_URL,
	} from '#lib/brand/institution.js';
	import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
	import { SITE_SECTIONS } from '#lib/site/sections.js';

	import SectionWave from './SectionWave.svelte';
</script>

<footer class="relative bg-footer pt-28 pb-14 text-on-primary tablet:pt-36">
	<SectionWave shape="crest" fill="fill-ground" edge="top" />
	<div class="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-16 gap-y-10 px-4 tablet:px-8">
		<div class="max-w-xs">
			<p class="font-display text-2xl font-bold text-on-primary">{INSTITUTION_NAME}</p>
			<p class="mt-3 text-primary-100">{INSTITUTION_ADDRESS}<br />CEP {INSTITUTION_POSTAL_CODE}</p>
		</div>
		<div>
			<h2 class="font-display text-xl font-bold text-on-primary">Contato</h2>
			<ul class="mt-3 grid gap-2 text-primary-100">
				<li>
					<a href={`mailto:${INSTITUTION_EMAIL}`} class="text-primary-100 hover:underline"
						>{INSTITUTION_EMAIL}</a>
				</li>
				<li>
					<a href={INSTITUTION_INSTAGRAM_URL} rel="external" class="text-primary-100 hover:underline"
						>Instagram</a>
				</li>
				<li>
					<a href={INSTITUTION_YOUTUBE_URL} rel="external" class="text-primary-100 hover:underline"
						>YouTube</a>
				</li>
			</ul>
		</div>
		<nav aria-labelledby="titulo-navegue">
			<h2 id="titulo-navegue" class="font-display text-xl font-bold text-on-primary">Navegue</h2>
			<ul class="mt-3 grid gap-2 text-primary-100">
				{#each SITE_SECTIONS as section (section.id)}
					<li><a href={`#${section.id}`} class="text-primary-100 hover:underline">{section.rotulo}</a></li>
				{/each}
				<li><a href={resolve(LOGIN_PATH)} class="text-primary-100 hover:underline">Área do voluntário</a></li>
			</ul>
		</nav>
	</div>
</footer>
