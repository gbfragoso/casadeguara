<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ editora } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/editoras" aria-current="page">Editoras</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar editora</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label for="nome" class="label">Nome</label>
			<div class="control">
				<input
					type="text"
					name="nome"
					id="nome"
					class="input"
					value={editora.nome}
					placeholder="Digite o nome da editora"
					required />
			</div>
			{#if form?.field === 'nome'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Editora atualizada com sucesso!</Notification>
{/if}
