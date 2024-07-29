<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { autor } from "$lib/database/schema";
	import Pagination from "$lib/components/Pagination.svelte";

	let autores: (typeof autor)[];
	let total = 1;

	const getAutores = async function (e: Event) {
		const form = e.target as HTMLFormElement;
		const data = new FormData(form);
		await fetch(`/api/autores?nome=${data.get("nome")}`)
			.then((res) => res.json())
			.then((data) => {
				(autores = data.autores), (total = data.total);
			});
		await invalidateAll()
	}
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
		Consulta de autores
	</h1>
</div>

<form class="card" action='/api/autores' on:submit|preventDefault={getAutores} method="GET">
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
				/>
			</div>
		</div>
		<div class="field is-grouped">
			<div class="control">
				<button class="button is-primary px-5">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="control">
				<a class="button px-6" href="/biblioteca/autores/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>
<div class="card">
	<div class="card-content table-container">
		<table class="table is-striped is-hoverable is-fullwidth">
			<thead>
				<th>Nome</th>
				<th>Ações</th>
			</thead>
			<tbody>
				{#if autores}
					{#each autores as autor}
						<tr>
							<td>{autor.nome}</td>
							<td>
								<a href="/biblioteca/autores/{autor.idautor}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		<Pagination {total}></Pagination>
	</div>
</div>
