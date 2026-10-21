<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Autocomplete from '#lib/components/forms/Autocomplete.svelte';
	import BrlAmountInput from '#lib/components/forms/BrlAmountInput.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let type = $derived((form?.values?.tipo ?? 'entrada') as 'entrada' | 'saida');
	let values = $derived(form?.values ?? {});
	let errors = $derived(form?.errors ?? {});
	let contrapartes = $derived(data?.contrapartes ?? []);
	const counterpartOptions = $derived(contrapartes.map(({ id, nome }) => ({ value: String(id), label: nome })));
	let counterpartId = $derived(values.contraparteId ?? '');
	let depositado = $derived(values.depositado === 'true');
	let amountValue = $derived(values.valor ?? '');
	let isEntry = $derived(type === 'entrada');

	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Lançamentos', href: resolve('tesouraria/lancamentos') },
		{ label: 'Novo', href: resolve('tesouraria/lancamentos/novo') },
	];
	const value = (field: string) => values[field] ?? '';
	const fieldErrors = (field: string) => errors[field] ?? [];
	const changeType = (event: Event) => {
		type = (event.currentTarget as HTMLSelectElement).value as 'entrada' | 'saida';
		counterpartId = '';
		depositado = false;
	};
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-wallet">Novo lançamento</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="tipo" label="Tipo">
		{#snippet control()}
			<Select id="tipo" name="tipo" value={type} onchange={changeType}>
				<option value="entrada">Entrada</option>
				<option value="saida">Saída</option>
			</Select>
		{/snippet}
	</Field>
	<Field
		id="contraparteId"
		label={isEntry ? 'Doador (obrigatório)' : 'Favorecido (opcional)'}
		errors={fieldErrors('contraparteId')}>
		{#snippet control({ describedBy, invalid })}
			{#key form}
				{#key type}
					<Autocomplete
						id="contraparteId"
						name="contraparteId"
						options={counterpartOptions}
						bind:value={counterpartId}
						required={isEntry}
						placeholder={isEntry
							? 'Pesquise e selecione um contribuinte'
							: 'Pesquise um favorecido (opcional)'}
						{invalid}
						{describedBy} />
				{/key}
			{/key}
		{/snippet}
	</Field>
	<Field id="descricao" label="Descrição" errors={fieldErrors('descricao')}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				id="descricao"
				name="descricao"
				maxlength={200}
				required
				placeholder="Discriminação do valor"
				value={value('descricao')}
				aria-invalid={invalid}
				aria-describedby={describedBy} />
		{/snippet}
	</Field>
	<Columns>
		<Column>
			<Field id="valor" label="Valor" errors={fieldErrors('valor')}>
				{#snippet control({ describedBy, invalid })}
					{#key form}
						<BrlAmountInput
							id="valor"
							name="valor"
							bind:value={amountValue}
							required
							{invalid}
							{describedBy} />
					{/key}
				{/snippet}
			</Field>
		</Column>
		<Column>
			<Field
				id="dataLancamento"
				label={isEntry ? 'Data do recebimento' : 'Data do pagamento'}
				errors={fieldErrors('dataLancamento')}>
				{#snippet control({ describedBy, invalid })}
					<TextInput
						type="date"
						id="dataLancamento"
						name="dataLancamento"
						required
						value={value('dataLancamento')}
						aria-invalid={invalid}
						aria-describedby={describedBy} />
				{/snippet}
			</Field>
		</Column>
	</Columns>
	{#if isEntry}
		<div>
			<Checkbox id="depositado" name="depositado" value="true" bind:checked={depositado}
				>Depósito confirmado</Checkbox>
		</div>
	{/if}
	{#if errors.form?.length}
		<ErrorMessage role="alert">{errors.form.join(' ')}</ErrorMessage>
	{/if}
	<Button type="submit" tone="primary" fullwidth loading={formEnhancer.loading} bold>Cadastrar</Button>
</Card>
