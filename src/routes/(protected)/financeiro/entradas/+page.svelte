<script lang="ts">
	import { enhance } from '$app/forms';
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		form: ActionData;
		data: PageServerData;
	}

	let { form, data }: Props = $props();
	let loading = $state(false);
	let { isAdmin } = $derived(data);

	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/entradas" aria-current="page">Entradas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Entradas</h1>
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
			<label class="label" for="contribuinte">Contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="contribuinte"
					id="contribuinte"
					placeholder="Digite o nome do contribuinte" />
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label>
				<div class="control">
					<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data Final</label>
				<div class="control">
					<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" />
				</div>
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
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/financeiro/entradas/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.resultados}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Contribuinte</th>
							<th>Tipo</th>
							<th>Valor</th>
							<th>Descrição</th>
							<th>Data</th>
							<th>Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.resultados as resultado}
							<tr>
								<td>
									<a href="/financeiro/contribuintes/{resultado.idcontribuinte}">
										{resultado.contribuinte}
									</a>
								</td>
								{#if resultado.trabalhador}
									<td>Trabalhador</td>
								{:else}
									<td>Eventual</td>
								{/if}
								<td>{moeda(Number(resultado.valor))}</td>
								<td>{resultado.descricao}</td>
								<td>{dayjs.utc(resultado.dataEntrada).format('DD/MM/YYYY')}</td>
								<td>
									{#if isAdmin}
										<a aria-label="editar" href="/financeiro/entradas/{resultado.identrada}">
											<i class="fa-solid fa-pen-to-square fa-fw"></i>
										</a>
									{/if}
									<a aria-label="entradas" href="/recibo/{resultado.uuid}" title="Recibo">
										<i class="fa-regular fa-file-lines fa-fw"></i>
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
