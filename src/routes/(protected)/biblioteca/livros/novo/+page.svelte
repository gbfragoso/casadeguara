<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let { editoras, colecoes } = $derived(data);
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
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de livros</h1>
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
					placeholder="Digite o tombo do livro"
					required />
			</div>
			{#if form?.field === 'tombo'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="field">
			<label class="label" for="nome">Título</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="titulo"
					id="titulo"
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
				<select name="editora" id="editora" required>
					<option></option>
					{#each editoras as editora}
						<option value={editora.ideditora}>{editora.nome}</option>
					{/each}
				</select>
			</div>
			{#if form?.field === 'editora'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="columns">
			<div class="column is-half">
				<div class="field">
					<label class="label" for="colecao">Coleção</label>
					<div class="select is-fullwidth">
						<select name="colecao" id="colecao">
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
						<input class="input" type="number" name="ordem" id="ordem" placeholder="Ordem na coleção" />
					</div>
				</div>
			</div>
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Livro cadastrado com sucesso!</Notification>
{/if}
