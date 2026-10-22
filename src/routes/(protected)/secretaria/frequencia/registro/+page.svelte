<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import AttendanceFilters from '#lib/components/forms/AttendanceFilters.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Frequência', href: resolve('secretaria/frequencia') },
		{ label: 'Registro', href: resolve('secretaria/frequencia/registro') },
	];
</script>

<PageHeader {breadcrumb} printTitle={false}>Registro de frequência</PageHeader>

<Card
	element="form"
	action="?/pesquisar"
	method="POST"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<AttendanceFilters />
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-50">
			<i class="fa-regular fa-rectangle-list fa-fw" aria-hidden="true"></i>Gerar Lista
		</Button>
	</div>
</Card>

{#if form?.leitores?.length === 0}
	<Card class="mt-6">
		<p role="status">Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.</p>
	</Card>
{:else if form?.leitores}
	<Card
		element="form"
		action="?/registrar"
		method="POST"
		class="mt-6 flex flex-col gap-5"
		{@attach formEnhancer.submitWithLoading}>
		<DataTable class="-mx-5 tablet:-mx-6 print:mx-0">
			{#snippet head()}
				<tr>
					{#each form.fulldates as date, index (date)}
						<th class="print:pr-2!">
							{form.datas[index]}
						</th>
					{/each}
					<th class="print:pl-12!">Nome</th>
				</tr>
			{/snippet}
			{#each form.leitores as leitor (leitor.id)}
				<tr>
					{#each form.fulldates as _ (_)}
						<td class="print:pr-2!"
							><input
								type="checkbox"
								class="size-5 rounded-sm"
								name={leitor.id.toString()}
								value={_} /></td>
					{/each}
					<td class="print:pl-12!">
						{leitor.nome.toUpperCase()}
					</td>
				</tr>
			{/each}
		</DataTable>
		<div class="print:hidden">
			<Button type="submit" tone="success" loading={formEnhancer.loading} fullwidth bold>
				<i class="fa-solid fa-check fa-fw" aria-hidden="true"></i>Concluir registro
			</Button>
		</div>
	</Card>
{/if}
