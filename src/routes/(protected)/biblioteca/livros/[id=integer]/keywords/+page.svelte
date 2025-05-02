<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let loading = $state(false);
	let { keywords, keywordsLivro, livros, role } = $derived(data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li><a href="/biblioteca/livros">Livros</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros/keywords" aria-current="page">Palavras-Chave</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de palavras-chave</h1>
</div>

<form
	class="card"
	action="?/adicionar"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="columns">
			{#await livros then livro}
				<div class="field column is-2">
					<label class="label" for="nome">Tombo</label>
					<div class="control">
						<input class="input" type="number" name="tombo" id="tombo" value={livro[0].tombo} disabled />
					</div>
				</div>
				<div class="field column">
					<label class="label" for="nome">Título</label>
					<div class="control">
						<input class="input" type="text" name="titulo" id="titulo" value={livro[0].titulo} disabled />
					</div>
				</div>
			{/await}
		</div>
		<div class="field">
			<label class="label" for="nome">Palavra-chave</label>
			<div class="select is-fullwidth">
				<select name="keyword" id="keyword" required>
					<option></option>
					{#await keywords then item}
						{#each item as keyword}
							<option value={keyword.idkeyword}>{keyword.chave}</option>
						{/each}
					{/await}
				</select>
			</div>
		</div>
		<div class="field">
			<label class="label" for="referencia">Referência</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="referencia"
					id="referencia"
					placeholder="Digite o local do livro onde encontramos esse tema"
					required />
			</div>
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-primary has-text-weight-semibold"
				type="submit">Adicionar</button>
		</div>
	</div>
</form>
<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Palavra-chave</th>
						<th>Referência</th>
						<th class="table-actions">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#await keywordsLivro}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
						</tr>
					{:then item}
						{#each item as keyword}
							<tr>
								<td>{keyword.chave}</td>
								<td>{keyword.referencia}</td>
								<td>
									{#if role.includes('admin')}
										<div class="field is-grouped">
											<form
												action="?/excluir&keyword={keyword.idkeyword}"
												method="POST"
												use:enhance>
												<button aria-label="trash">
													<i class="fa-regular fa-trash-can fa-fw"></i>
												</button>
											</form>
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
