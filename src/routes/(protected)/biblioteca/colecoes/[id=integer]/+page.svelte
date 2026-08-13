<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fromAction } from 'svelte/attachments';
	import type { ActionData, PageServerData } from './$types';
	type SubmitCallback = Exclude<Awaited<ReturnType<SubmitFunction>>, void>;

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let colecao = $derived(data.colecao);

	function handleSubmit(): SubmitCallback {
		loading = true;

		return async ({ update }) => {
			try {
				await update();
			} finally {
				loading = false;
			}
		};
	}
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

<form class="card" method="POST" {@attach fromAction(enhance, () => handleSubmit)}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					value={form?.values?.nome ?? colecao.nome}
					placeholder="Digite o nome da coleção"
					maxlength="60"
					required
					aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
					aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
			</div>
			{#if form?.errors?.nome?.length}
				<div id="nome-errors" class="help is-danger">
					{#each form.errors.nome as message (message)}
						<p>{message}</p>
					{/each}
				</div>
			{/if}
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': loading }]}
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Coleção atualizada com sucesso!</Notification>
{/if}
