<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ leitores, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/leitores" aria-current="page">Leitores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de leitores</h1>
</div>

<form class="card" action="/biblioteca/leitores" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do leitor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome do leitor"
				/>
			</div>
		</div>
		<div class="field is-grouped">
			<p class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</p>
			<p class="control">
				<a class="button px-6" href="/biblioteca/leitores/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</p>
		</div>
	</div>
</form>

{#if leitores && leitores.length > 0}
	<div class="card">
		<div class="card-content table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>Nome</th>
					<th>Trabalhador</th>
					<th>Status</th>
					<th>Ações</th>
				</thead>
				<tbody>
					{#each leitores as leitor}
						<tr>
							<td>{leitor.nome}</td>
							{#if leitor.trab}
								<td>Sim</td>
							{:else}
								<td>Não</td>
							{/if}
							{#if leitor.status}
								<td>Ativo</td>
							{:else}
								<td>Inativo</td>
							{/if}
							<td>
								<a
									href="/biblioteca/leitores/{leitor.idleitor}"
								>
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<Pagination {total}></Pagination>
		</div>
	</div>
{/if}
