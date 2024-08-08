<script lang="ts">
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
	<h1 class="is-size-3 has-text-weight-semibold is-primary">
		Cadastro de autores
	</h1>
</div>

<form class="card" action="?/update" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome do autor"
					required
				/>
			</div>
		</div>
		<button class="button is-primary px-5" type="submit">Cadastrar</button>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Autor cadastrado com sucesso!</p>
	</div>
{/if}
