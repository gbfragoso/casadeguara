<script lang="ts">
	import StudyMaterialPage from '#lib/components/site/StudyMaterialPage.svelte';

	import type { PageData } from './$types';

	type Props = { data: PageData };

	let { data }: Props = $props();
</script>

<StudyMaterialPage content={data.conteudo} />
