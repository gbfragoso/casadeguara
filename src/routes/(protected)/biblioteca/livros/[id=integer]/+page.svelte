<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ livro, editoras, colecoes } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros" aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar livro</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Tombo</label>
			<div class="control">
				<input
					class="input"
					type="number"
					name="tombo"
					id="tombo"
					value={livro.tombo}
					placeholder="Digite o tombo do livro"
					required />
			</div>
		</div>
		<div class="field">
			<label class="label" for="nome">Título</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="titulo"
					id="titulo"
					value={livro.titulo}
					placeholder="Digite o título do livro"
					required />
			</div>
			{#if form?.field === 'titulo'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="field">
			<label class="label" for="nome">Editora</label>
			<div class="select is-fullwidth">
				<select name="editora" id="editora" value={livro.editora} required>
					<option></option>
					{#each editoras as editora}
						<option value={editora.ideditora}>{editora.nome}</option>
					{/each}
				</select>
				{#if form?.field === 'editora'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="column is-half">
				<div class="field">
					<label class="label" for="colecao">Coleção</label>
					<div class="select is-fullwidth">
						<select name="colecao" id="colecao" value={livro.serie}>
							<option></option>
							{#each colecoes as colecao}
								<option value={colecao.idserie}>{colecao.nome}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="field">
					<label class="label" for="nome">Ordem na coleção</label>
					<div class="control">
						<input
							class="input"
							type="number"
							name="ordem"
							id="ordem"
							value={livro.ordem}
							placeholder="Ordem na coleção" />
					</div>
				</div>
			</div>
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Livro atualizado com sucesso!</p>
	</div>
{/if}
