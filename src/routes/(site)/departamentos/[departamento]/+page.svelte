<script lang="ts">
	import DepartmentPage from '#lib/components/site/DepartmentPage.svelte';

	import type { PageData } from './$types';

	type Props = { data: PageData };

	let { data }: Props = $props();
</script>

<DepartmentPage content={data.conteudo} lead={data.resumo} showsRecantoProgram={data.slug === 'recanto'} />
