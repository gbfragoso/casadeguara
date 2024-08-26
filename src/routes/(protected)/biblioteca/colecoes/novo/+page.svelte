<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
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
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastrar coleção</h1>
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
					placeholder="Digite o nome da coleção"
					required />
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
	<div class="notification is-success">
		<p>Coleção cadastrada com sucesso!</p>
	</div>
{/if}
