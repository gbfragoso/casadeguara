<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ livros } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Livros</h2>
	<p>Consulta de livros</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/livros" method="GET">
		<div class="grid">
			<label
				>Tombo:
				<input type="number" name="tombo" id="tombo" placeholder="Digite o tombo do livro" />
			</label>
			<label
				>Título:
				<input type="text" name="titulo" id="titulo" placeholder="Digite o título do livro" />
			</label>
		</div>
		<div class="grid">
			<label
				>Autor:
				<input type="text" name="autor" id="autor" placeholder="Digite o nome do autor" />
			</label>
			<label
				>Editora:
				<input type="text" name="editora" id="editora" placeholder="Digite o nome da editora" />
			</label>
			<label
				>Coleção:
				<input type="text" name="serie" id="serie" placeholder="Digite o nome da coleção" />
			</label>
		</div>
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/livros/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>

<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th>Tombo</th>
			<th>Título</th>
			<th>Editora</th>
			<th>Ações</th>
		</thead>
		<tbody>
			{#await livros}
				<tr>Carregando lista de livros...</tr>
			{:then livros}
				{#each livros as livro}
					<tr>
						<td>{livro.tombo}</td>
						<td>{livro.titulo}</td>
						<td>{livro.editora_livro_editoraToeditora?.nome || ''}</td>
						<td>
							<div class="grid" style="width: 60px;">
								<a href="/biblioteca/livros/{livro.idlivro}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
								<form action="?/excluir&id={livro.idlivro}" method="POST">
									<button><i class="fa-regular fa-trash-can"></i></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:catch error}
				<tr>Erro ao carregar os resultados: {error.message}</tr>
			{/await}
		</tbody>
	</table>
</div>
