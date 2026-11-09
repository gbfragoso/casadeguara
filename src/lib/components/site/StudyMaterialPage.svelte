<script lang="ts">
	import type { StudyMaterialContent } from '#lib/site/study-materials/types.js';

	import SitePageIntro from './SitePageIntro.svelte';
	import StudySection from './StudySection.svelte';

	type Props = { content: StudyMaterialContent };

	let { content }: Props = $props();
</script>

<SitePageIntro title={content.titulo} lead={content.resumo ?? undefined} />

<div class="mx-auto max-w-7xl px-4 pt-12 pb-24 tablet:px-8 tablet:pt-16 tablet:pb-32">
	<div class="grid max-w-5xl gap-16 tablet:gap-20">
		{#each content.secoes as section (section)}
			<StudySection {section} />
		{/each}
	</div>
</div>
