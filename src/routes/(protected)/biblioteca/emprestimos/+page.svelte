<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { isAdmin } = $derived(data);
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

<form
	class="card"
	action="?/pesquisar"
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
					<label class="label" for="titulo">Título</label>
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
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/biblioteca/emprestimos/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.emprestimos}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Leitor</th>
							<th>Título</th>
							<th>Ex</th>
							<th>Prazo</th>
							<th>Status</th>
							<th class="table-actions">Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.emprestimos as emprestimo}
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
								{:else if dayjs().isAfter(dayjs(emprestimo.data_devolucao).add(1, 'day'))}
									<td><span class="tag is-warning">Atrasado</span></td>
								{:else}
									<td><span class="tag is-info">Ativo</span></td>
								{/if}
								<td class="table-actions is-flex">
									{#if !emprestimo.data_devolvido}
										<a
											class="mr-2"
											href="/biblioteca/emprestimos/{emprestimo.idemp}"
											title="Editar"
											aria-label="Editar">
											<i class="fa-regular fa-pen-to-square fa-fw"></i>&nbsp;
										</a>
										{#if Number(emprestimo.renovacoes) < 1 || isAdmin}
											<form action="?/renovar&id={emprestimo.idemp}" method="POST" use:enhance>
												<button class="mr-2" title="Renovar" aria-label="Renovar"
													><i class="fa-solid fa-repeat fa-fw"></i>&nbsp;</button>
											</form>
										{/if}
										<form
											action="?/devolver&emprestimo={emprestimo.idemp}&exemplar={emprestimo.exemplar}"
											method="POST"
											use:enhance>
											<button class="mr-2" title="Devolver" aria-label="Devolver"
												><i class="fa-solid fa-reply fa-fw"></i>&nbsp;</button>
										</form>
									{/if}
									<a
										class="mr-2"
										href="/biblioteca/emprestimos/{emprestimo.idemp}/recibo"
										title="Recibo"
										aria-label="Recibo">
										<i class="fa-regular fa-file-lines fa-fw"></i>&nbsp;
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
{#if form?.status === 201}
	<Notification class="is-success">{form.message}</Notification>
{/if}
{#if form?.status === 400 && form?.message}
	<Notification class="is-danger">{form.message}</Notification>
{/if}
