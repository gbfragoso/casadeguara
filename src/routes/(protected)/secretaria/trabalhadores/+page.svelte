<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	export let form: ActionData;
	export let loading = false;
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/trabalhadores" aria-current="page">Leitores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de trabalhadores</h1>
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
			<label class="label" for="nome">Nome do trabalhador</label>
			<div class="control">
				<input class="input" type="text" name="nome" id="nome" placeholder="Digite o nome do trabalhador" />
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold {loading ? 'is-loading' : ''}"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold" href="/secretaria/trabalhadores/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.leitores}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Nome</th>
						<th class="table-actions">Ações</th>
					</thead>
					<tbody>
						{#each form.leitores as leitor}
							<tr>
								<td>{leitor.nome}</td>
								<td class="table-actions">
									<a href="/secretaria/trabalhadores/{leitor.idleitor}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
