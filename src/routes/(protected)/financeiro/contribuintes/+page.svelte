<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/contribuintes" aria-current="page">Contribuintes</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Contribuintes</h1>
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
			<label class="label" for="nome">Nome do contribuinte</label>
			<div class="control">
				<input class="input" type="text" name="nome" id="nome" placeholder="Digite o nome do contribuinte" />
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/financeiro/contribuintes/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.contribuintes}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Contribuinte</th>
							<th>Tipo</th>
							<th>Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.contribuintes as contribuinte}
							<tr>
								<td>{contribuinte.nome}</td>
								{#if contribuinte.trab}
									<td>Trabalhador</td>
								{:else}
									<td>Eventual</td>
								{/if}
								<td>
									<form method="POST">
										<a aria-label="editar" href="/financeiro/contribuintes/{contribuinte.idleitor}">
											<i class="fa-solid fa-pen-to-square fa-fw"></i>
										</a>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
