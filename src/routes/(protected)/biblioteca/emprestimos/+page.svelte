<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ emprestimos, total, isAdmin } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/emprestimos" aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de empréstimos</h1>
</div>

<form class="card" action="/biblioteca/emprestimos" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="leitor">Leitor</label>
			<div class="control">
				<input class="input" type="text" name="leitor" id="leitor" placeholder="Digite o nome do leitor" />
			</div>
		</div>
		<div class="columns">
			<div class="column">
				<div class="field">
					<label class="label" for="titulo">Tombo</label>
					<div class="control">
						<input class="input" type="number" name="tombo" id="tombo" placeholder="Digite o tombo" />
					</div>
				</div>
			</div>
			<div class="column">
				<div class="field">
					<label class="label" for="titulo">Títuto</label>
					<div class="control">
						<input
							class="input"
							type="text"
							name="titulo"
							id="titulo"
							placeholder="Digite o título da obra" />
					</div>
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<label class="checkbox">
				<input type="checkbox" name="ativos" id="ativos" />
				Somente ativos
			</label>
			<label class="checkbox">
				<input type="checkbox" name="atrasados" id="atrasados" />
				Somente atrasados
			</label>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					data-sveltekit-reload
					class="button is-fullwidth has-text-weight-semibold"
					href="/biblioteca/emprestimos/novo"><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if emprestimos && emprestimos.length > 0}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Leitor</th>
						<th>Título</th>
						<th>Ex</th>
						<th>Prazo</th>
						<th>Status</th>
						<th class="table-actions">Ações</th>
					</thead>
					<tbody>
						{#each emprestimos as emprestimo}
							<tr>
								<td>
									<a href="/biblioteca/leitores/{emprestimo.idleitor}">
										{emprestimo.leitor}
									</a>
								</td>
								<td>{emprestimo.titulo}</td>
								<td>{emprestimo.numero}</td>
								<td>{dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
								{#if emprestimo.data_devolvido}
									<td><span class="tag is-success">Devolvido</span></td>
								{:else if dayjs().isAfter(emprestimo.data_devolucao)}
									<td><span class="tag is-warning">Atrasado</span></td>
								{:else}
									<td><span class="tag is-info">Ativo</span></td>
								{/if}
								<td class="table-actions">
									<div class="dropdown is-hoverable">
										<div class="dropdown-trigger">
											<button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
												<span>Ações</span>
												<span class="icon is-small">
													<i class="fas fa-angle-down" aria-hidden="true"></i>
												</span>
											</button>
										</div>
										<div class="dropdown-menu" id="dropdown-menu" role="menu">
											<div class="dropdown-content">
												{#if !emprestimo.data_devolvido}
													{#if Number(emprestimo.renovacoes) < 1 || isAdmin}
														<form action="?/renovar&id={emprestimo.idemp}" method="POST">
															<button class="dropdown-item" title="Renovar"
																><i class="fa-solid fa-repeat fa-fw"></i
																>&nbsp;Renovar</button>
														</form>
													{/if}
													<form action="?/devolver&id={emprestimo.idemp}" method="POST">
														<button class="dropdown-item" title="Devolver"
															><i class="fa-solid fa-reply fa-fw"></i
															>&nbsp;Devolver</button>
													</form>
												{/if}
												<a
													class="dropdown-item"
													href="/biblioteca/emprestimos/{emprestimo.idleitor}/recibo"
													title="Recibo">
													<i class="fa-regular fa-file-lines fa-fw"></i>&nbsp;Recibo
												</a>
											</div>
										</div>
									</div>
								</td>
								{#if form?.status === 400 && form?.message}
									<p class="help is-danger">{form.message}</p>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
				<Pagination {total}></Pagination>
			</div>
		</div>
	</div>
{/if}
