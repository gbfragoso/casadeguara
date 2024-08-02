<script lang="ts">
	import type { PageServerData, ActionData } from "./$types";
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ autor } = data);
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
		Atualizar autor
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
					value={autor.nome}
					placeholder="Digite o nome do autor"
				/>
			</div>
		</div>
		<button class="button is-primary px-5" type="submit">Atualizar</button>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Autor atualizado com sucesso!</p>
	</div>
{/if}
