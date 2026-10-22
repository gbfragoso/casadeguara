<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { emprestimo, exemplares } = $derived(data);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Empréstimos', href: resolve('biblioteca/emprestimos') },
	];
	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb}>Atualizar empréstimo</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="leitor" label="Leitor">
		{#snippet control()}
			<TextInput type="text" name="leitor" id="leitor" value={emprestimo.leitor} disabled />
		{/snippet}
	</Field>
	<Field id="exemplaratual" label="Exemplar atual">
		{#snippet control()}
			<TextInput
				type="text"
				name="exemplaratual"
				id="exemplaratual"
				value={emprestimo.livro + ' - EX:' + emprestimo.numero}
				disabled />
			<input type="hidden" name="idexemplar" id="idexemplar" value={emprestimo.idexemplar} />
		{/snippet}
	</Field>
	<Field id="novoexemplar" label="Exemplar">
		{#snippet control()}
			<Select name="novoexemplar" id="novoexemplar" required>
				<option value=""></option>
				{#await exemplares then item}
					{#each item as exemplar (exemplar.idexemplar)}
						<option value={exemplar.idexemplar}>{exemplar.livro + ' - EX:' + exemplar.numero}</option>
					{/each}
				{:catch}
					<option value="" disabled>Não foi possível carregar os exemplares</option>
				{/await}
			</Select>
		{/snippet}
	</Field>
	<p class="text-center">
		Emprestado por <strong>{emprestimo.usuarioEmprestimo}</strong> no dia {dayjs
			.utc(emprestimo.dataEmprestimo)
			.format('DD/MM/YYYY')}
	</p>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Atualizar</Button>
	</div>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Empréstimo atualizado com sucesso</Notification>
{/if}
