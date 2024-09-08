<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/autores" aria-current="page">Autores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de autores</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="control">
				<input class="input" type="text" name="nome" id="nome" placeholder="Digite o nome do autor" required />
			</div>
			{#if form?.field === 'nome'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Autor cadastrado com sucesso!</Notification>
{/if}
