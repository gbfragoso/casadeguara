<script lang="ts">
	import dayjs from "dayjs";
	import utc from "dayjs/plugin/utc";
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ emprestimos } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/emprestimos" aria-current="page"
					>Empréstimos</a
				>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de empréstimos</h1>
</div>

<form class="card" action="/biblioteca/emprestimos" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="leitor">Leitor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="leitor"
					id="leitor"
					placeholder="Digite o nome do leitor"
				/>
			</div>
		</div>
		<div class="field">
			<label class="label" for="titulo">Títuto</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="titulo"
					id="titulo"
					placeholder="Digite o título da obra"
				/>
			</div>
		</div>
		<div class="field">
			<label class="checkbox">
				<input type="checkbox" name="atrasados" id="atrasados" />
				Somente atrasados
			</label>
		</div>
		<div class="field is-grouped">
			<p class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</p>
			<p class="control">
				<a class="button px-6" href="/biblioteca/editoras/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</p>
		</div>
	</div>
</form>

<div class="card">
	<div class="card-content table-container">
		<table class="table is-striped is-hoverable is-fullwidth">
			<thead>
				<th>Leitor</th>
				<th>Título</th>
				<th>Ex</th>
				<th>Empréstimo</th>
				<th>Prazo</th>
			</thead>
			<tbody>
				{#await emprestimos}
					<tr>Carregando lista de empréstimos</tr>
				{:then emprestimos}
					{#each emprestimos as emprestimo}
						<tr>
							<td>
								<a
									href="/biblioteca/leitores/{emprestimo
										.leitor_emprestimo_leitorToleitor
										.idleitor}"
								>
									{emprestimo.leitor_emprestimo_leitorToleitor
										.nome}
								</a>
							</td>
							<td
								>{emprestimo
									.exemplar_emprestimo_exemplarToexemplar
									.livro_exemplar_livroTolivro.titulo}</td
							>
							<td
								>{emprestimo
									.exemplar_emprestimo_exemplarToexemplar
									.numero}</td
							>
							<td
								>{dayjs
									.utc(emprestimo.data_emprestimo)
									.format("DD/MM/YYYY")}</td
							>
							<td
								>{dayjs
									.utc(emprestimo.data_devolucao)
									.format("DD/MM/YYYY")}</td
							>
						</tr>
					{/each}
				{:catch error}
					<tr>Erro ao carregar os resultados: {error.message}</tr>
				{/await}
			</tbody>
		</table>
	</div>
</div>
