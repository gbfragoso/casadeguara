<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Autocomplete from '#lib/components/forms/Autocomplete.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let { leitores, exemplares } = $derived(data);
	let readerId = $state('');
	let copyId = $state('');
	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Empréstimos', href: resolve('biblioteca/emprestimos') },
		{ label: 'Novo', href: resolve('biblioteca/emprestimos/novo') },
	];
	const failedField = (field: string) => form?.field === field;
</script>

<PageHeader {breadcrumb}>Novo empréstimo</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Columns>
		<Column>
			<Field id="leitor" label="Leitor">
				{#snippet control()}
					<Autocomplete
						id="leitor"
						name="leitorid"
						options={leitores.map(({ idleitor, nome }) => ({ value: String(idleitor), label: nome }))}
						bind:value={readerId}
						placeholder="Pesquise e selecione um leitor"
						listLabel="Leitores sugeridos"
						emptyMessage="Nenhum leitor encontrado."
						selectionMessage="Selecione um leitor da lista."
						invalid={failedField('leitor') ? 'true' : undefined}
						describedBy={failedField('leitor') ? 'emprestimo-errors' : undefined}
						required />
				{/snippet}
			</Field>
		</Column>
		<Column>
			<Field id="exemplar" label="Exemplar">
				{#snippet control()}
					<Autocomplete
						id="exemplar"
						name="exemplarid"
						options={exemplares.map(({ idexemplar, tombo, titulo, numero }) => ({
							value: String(idexemplar),
							label: `${tombo} - ${titulo} - EX:${numero}`,
						}))}
						bind:value={copyId}
						placeholder="Pesquise pelo título, tombo ou número do exemplar"
						listLabel="Exemplares sugeridos"
						emptyMessage="Nenhum exemplar encontrado."
						selectionMessage="Selecione um exemplar da lista."
						invalid={failedField('exemplar') ? 'true' : undefined}
						describedBy={failedField('exemplar') ? 'emprestimo-errors' : undefined}
						required />
				{/snippet}
			</Field>
		</Column>
	</Columns>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} disabled={!readerId || !copyId} bold
			>Cadastrar</Button>
	</div>
</Card>
{#if form?.status === 400}
	<div id="emprestimo-errors"><Notification kind="danger">{form.message}</Notification></div>
{/if}
