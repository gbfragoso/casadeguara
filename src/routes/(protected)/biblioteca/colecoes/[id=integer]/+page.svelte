<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { colecao } = $derived(data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/colecoes" aria-current="page">Coleções</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar coleção</h1>
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
			<label for="nome" class="label">Nome</label>
			<div class="control">
				<input
					type="text"
					name="nome"
					id="nome"
					class="input"
					value={colecao.nome}
					placeholder="Digite o nome da coleção"
					required />
			</div>
			{#if form?.field === 'nome'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-primary has-text-weight-semibold"
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Coleção atualizada com sucesso!</Notification>
{/if}
