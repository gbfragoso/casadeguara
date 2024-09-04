<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ avisos } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/avisos" aria-current="page">Avisos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Avisos</h1>
</div>

<form class="card" action="/biblioteca/avisos" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="texto">Texto do aviso</label>
			<div class="control">
				<textarea class="textarea has-fixed-size" name="texto" id="texto" placeholder="Digite a mensagem" />
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo
				</button>
			</div>
		</div>
	</div>
</form>
<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>Texto</th>
					<th class="table-actions">Ações</th>
				</thead>
				<tbody>
					{#await avisos}
						<td>
							<div class="skeleton-lines"></div>
						</td>
						<td>
							<div class="skeleton-lines"></div>
						</td>
					{:then item}
						{#each item as aviso}
							<tr>
								<td>{aviso.texto}</td>
								<td class="table-actions">
									<a href="/biblioteca/avisos/{aviso.idaviso}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
