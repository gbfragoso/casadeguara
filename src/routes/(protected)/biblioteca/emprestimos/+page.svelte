<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ emprestimos } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
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
						<th>Empréstimo</th>
						<th>Prazo</th>
						<th>Ações</th>
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
								<td>{dayjs.utc(emprestimo.data_emprestimo).format('DD/MM/YYYY')}</td>
								<td>{dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
								<td>
									<div class="field is-grouped">
										<form action="?/renovar&id={emprestimo.idemp}" method="POST">
											<button title="renovar" class="control"
												><i class="fa-solid fa-repeat fa-fw"></i>&nbsp;</button>
										</form>
										<form action="?/devolver&id={emprestimo.idemp}" method="POST">
											<button title="devolver" class="control has-text-danger"
												><i class="fa-solid fa-reply fa-fw"></i>&nbsp;</button>
										</form>
										<a href="/biblioteca/emprestimos/{emprestimo.idleitor}/recibo" title="recibo">
											<i class="fa-regular fa-file-lines fa-fw"></i>&nbsp;
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
