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
	const formEnhancer = createFormEnhancer({ reset: false });
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Frequência', href: resolve('secretaria/frequencia') },
	];
</script>

<PageHeader {breadcrumb} printTitle={false}>Lista de frequência</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<AttendanceFilters />
	<div class="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:gap-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-50">
			<i class="fa-regular fa-rectangle-list fa-fw" aria-hidden="true"></i>Gerar Lista
		</Button>
		<a class="inline-flex min-h-10 items-center underline" href={resolve('secretaria/frequencia/registro')}
			>Clique aqui para registrar as frequências</a>
	</div>
</Card>

{#if form?.leitores?.length === 0}
	<Card class="mt-6">
		<p role="status">Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.</p>
	</Card>
{:else if form?.leitores}
	<Card id="printable-content" class="notranslate mt-6 flex flex-col gap-2" translate="no">
		<h2 class="text-center text-lg font-bold text-primary-ink">Grupo Espírita Casa de Guará</h2>
		<p contenteditable="true" class="text-center text-lg font-bold">Altere o texto</p>
		<p contenteditable="true" class="text-center font-bold text-danger-ink">
			OBS.: Caso seu nome não esteja nesta lista, favor escrevê-lo ao final.
		</p>
		<DataTable class="-mx-5 mt-2 tablet:-mx-6 print:mx-0">
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
			{#each form.leitores as leitor (leitor)}
				<tr>
					{#each form.fulldates as date (date)}
						<td class="print:pr-2!">[&nbsp;&nbsp;]</td>
					{/each}
					<td class="print:pl-12!">
						{leitor.nome.toUpperCase()}
					</td>
				</tr>
			{/each}
		</DataTable>
	</Card>
{/if}
