<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/Notification.svelte';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let editora = $derived(data.editora);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/editoras')} aria-current="page">Editoras</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar editora</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field">
			<label for="nome" class="label">Nome</label>
			<div class="control">
				<input
					type="text"
					name="nome"
					id="nome"
					class="input"
					value={form?.values?.nome ?? editora.nome}
					placeholder="Digite o nome da editora"
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
				aria-busy={formEnhancer.loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Editora atualizada com sucesso!</Notification>
{/if}
