<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ exemplares } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li><a href="/biblioteca/livros" aria-current="page">Livros</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros/exemplares" aria-current="page"
					>Exemplares</a
				>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de exemplares</h1>
</div>

<form class="card" action="?/adicionar" method="POST">
	<div class="card-content">
		<label class="label" for="numero">Número do exemplar</label>
		<div class="field has-addons">
			<div class="control is-expanded">
				<input
					class="input"
					type="number"
					name="numero"
					id="numero"
					step="1"
				/>
			</div>
			<div class="control">
				<button class="button is-primary px-5" type="submit"
					>Adicionar</button
				>
			</div>
		</div>
		{#if form?.status === 201}
			<p class="help is-success">Exemplar adicionado com sucesso!</p>
		{:else if form?.status === 200}
			<p class="help is-success">Exemplar adicionado com sucesso!</p>
		{:else}
			<p class="help is-danger">{form?.message}</p>
		{/if}
	</div>
</form>
<div class="card">
	<div class="card-content table-container">
		<table class="table is-striped is-hoverable is-fullwidth">
			<thead>
				<th>Ex</th>
				<th>Status</th>
				<th>Ações</th>
			</thead>
			<tbody>
				{#each exemplares as exemplar}
					<tr>
						<td>{exemplar.numero}</td>
						<td>
							{#if exemplar.status === "Disponível"}
								<span class="tag is-success"
									>{exemplar.status}</span
								>
							{:else}
								<span class="tag is-danger"
									>{exemplar.status}</span
								>
							{/if}
						</td>
						<td>
							<div class="field is-grouped">
								<form
									action="?/excluir&exemplar={exemplar.idexemplar}"
									method="POST"
								>
									<button>
										<i class="fa-regular fa-trash-can"></i>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
