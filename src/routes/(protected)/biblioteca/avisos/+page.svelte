<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	export let data: PageServerData;
	let loading = false;

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

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="texto">Texto do aviso</label>
			<div class="control">
				<textarea class="textarea has-fixed-size" name="texto" id="texto" placeholder="Digite a mensagem"
				></textarea>
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-fullwidth has-text-weight-semibold"
					type="submit">
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
					<tr>
						<th>Texto</th>
						<th class="table-actions">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#await avisos}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as aviso}
							<tr>
								<td>{aviso.texto}</td>
								<td class="table-actions">
									<a aria-label="link" href="/biblioteca/avisos/{aviso.idaviso}">
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
