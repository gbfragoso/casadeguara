<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/saidas" aria-current="page">saidas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Lançamento de despesas</h1>
</div>

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					min="1"
					step="any"
					placeholder="Discriminação da despesa"
					required />
				{#if form?.field === 'descricao'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="valor">Valor</label>
				<div class="control">
					<input
						class="input"
						type="number"
						name="valor"
						min="1"
						step="any"
						placeholder="Digite o valor do pagamento"
						required />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="data_saida"> Data do pagamento</label>
				<div class="control">
					<input class="input" type="date" name="data_saida" aria-label="Date" required />
				</div>
			</div>
		</div>
		<div class="field">
			<div class="control">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary has-text-weight-semibold"
					type="submit">Cadastrar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Despesa cadastrada com sucesso!</Notification>
{/if}
