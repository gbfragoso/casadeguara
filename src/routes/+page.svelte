<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import { INSTITUTION_NAME } from '#lib/brand/institution.js';
	import DepartmentList from '#lib/components/site/DepartmentList.svelte';
	import LocationSection from '#lib/components/site/LocationSection.svelte';
	import NextTalkHero from '#lib/components/site/NextTalkHero.svelte';
	import RecantoSection from '#lib/components/site/RecantoSection.svelte';
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import SiteHeader from '#lib/components/site/SiteHeader.svelte';
	import UpcomingTalks from '#lib/components/site/UpcomingTalks.svelte';
	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{INSTITUTION_NAME} · Itabuna-BA</title>
	<meta
		name="description"
		content="Palestras públicas, departamentos e o Recanto de Potira do Grupo Espírita Casa de Guará, na Rua Major Dórea, 86, em Itabuna-BA." />
</svelte:head>

<div class="relative scroll-smooth bg-ground text-ink motion-reduce:scroll-auto">
	<SiteHeader />
	<main>
		<NextTalkHero talk={data.destaque} today={data.hoje} />
		<UpcomingTalks talks={data.seguintes} />
		<DepartmentList />
		<RecantoSection />
		<LocationSection />
	</main>
	<SiteFooter />
</div>
