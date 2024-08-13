<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ keywords, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/keywords" aria-current="page"
					>Palavras-chave</a
				>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">
		Consulta de palavras-chave
	</h1>
</div>

<form class="card" action="/biblioteca/keywords" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="chave">Palavra-chave</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="chave"
					id="chave"
					placeholder="Digite a palavra-chave"
				/>
			</div>
		</div>
		<div class="field is-grouped">
			<div class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="control">
				<a class="button px-6" href="/biblioteca/keywords/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>

{#if keywords && keywords.length > 0}
	<div class="card">
		<div class="card-content">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>chave</th>
					<th>Ações</th>
				</thead>
				<tbody>
					{#each keywords as keyword}
						<tr>
							<td>{keyword.chave}</td>
							<td>
								<a
									href="/biblioteca/keywords/{keyword.idkeyword}"
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
