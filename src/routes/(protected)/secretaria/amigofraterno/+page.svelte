<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Tags from '#lib/components/feedback/Tags.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Amigo Fraterno', href: resolve('secretaria/amigofraterno') },
	];
</script>

<PageHeader {breadcrumb}>Amigo Fraterno</PageHeader>

<Card class="flex flex-col gap-5">
	<p>
		Revise os participantes antes de gerar os cartões. Altere participantes e fotos em <a
			class="underline"
			href={resolve('secretaria/cadastros')}>Cadastros</a
		>.
	</p>
	<Tags aria-live="polite">
		<Tag kind="primary" size="medium">Total: {data.total}</Tag>
		<Tag kind="warning" size="medium">Sem foto: {data.withoutPhoto}</Tag>
	</Tags>
	{#if data.total === 0}
		<p role="status">Não há participantes elegíveis no momento. Revise os Cadastros para atualizar a lista.</p>
	{:else}
		<form
			class="flex flex-col gap-4 tablet:flex-row tablet:items-end"
			method="GET"
			action={resolve('secretaria/amigofraterno/pdf')}>
			<Field id="nextDrawDate" label="Data do próximo sorteio" class="tablet:w-64">
				{#snippet control()}
					<TextInput id="nextDrawDate" type="date" name="nextDrawDate" required />
				{/snippet}
			</Field>
			<Button type="submit" tone="primary" bold>Baixar cartões em PDF</Button>
		</form>
		<DataTable class="-mx-5 tablet:-mx-6">
			{#snippet head()}
				<tr><th>Nome</th><th>Foto</th></tr>
			{/snippet}
			{#each data.participants as participant (participant.id)}
				<tr><td>{participant.name}</td><td>{participant.hasPhoto ? 'Cadastrada' : 'Pendente'}</td></tr>
			{/each}
		</DataTable>
	{/if}
</Card>
