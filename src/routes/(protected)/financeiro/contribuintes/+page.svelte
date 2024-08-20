<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;
	$: ({ contribuintes, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/contribuintes" aria-current="page"
					>Contribuintes</a
				>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Contribuintes</h1>
</div>

<form class="card" action="/financeiro/contribuintes" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome do contribuinte"
				/>
			</div>
		</div>
		<div class="columns">
			<div
				class="column is-full-mobile is-2-tablet"
				style="min-width: 200px"
			>
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i
					>Pesquisar
				</button>
			</div>
			<div
				class="column is-full-mobile is-2-tablet"
				style="min-width: 200px"
			>
				<a
					data-sveltekit-reload
					class="button is-fullwidth has-text-weight-semibold"
					href="/financeiro/contribuintes/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>

{#if contribuintes}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th scope="col">Contribuinte</th>
						<th scope="col">Tipo</th>
						<th scope="col">Ações</th>
					</thead>
					<tbody>
						{#each contribuintes as contribuinte}
							<tr>
								<td>{contribuinte.nome}</td>
								{#if contribuinte.trab}
									<td>Trabalhador</td>
								{:else}
									<td>Eventual</td>
								{/if}
								<td>
									<form method="POST">
										<a
											href="/financeiro/contribuintes/{contribuinte.idleitor}"
										>
											<i
												class="fa-solid fa-pen-to-square fa-fw"
											></i>
										</a>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<Pagination {total}></Pagination>
			</div>
		</div>
	</div>
{/if}
