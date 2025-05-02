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
	let { isAdmin } = $derived(data);
	let loading = $state(false);

	function devolver(id: number) {
		let button = document.getElementById('devolver-' + id.toString());
		if (button) {
			button.ariaDisabled = 'true';
			button.setAttribute('disabled', 'true');
		}

		let tr = document.getElementById(id.toString());
		if (tr) {
			fetch(`/api/biblioteca/devolucao?id=${id}`, {
				method: 'POST',
			}).then((data) => {
				tr.classList = '';
				if (data.status === 200) {
					tr.classList.add('tag', 'is-light');
					tr.innerHTML = 'Devolvido';
				} else {
					tr.classList.add('tag', 'is-danger');
					tr.innerHTML = 'Erro ao devolver';
				}
			});
		}
		if (button) {
			button.remove();
		}
	}
	function renovar(id: number) {
		let button = document.getElementById('renovar-' + id.toString());
		if (button) {
			button.ariaDisabled = 'true';
			button.setAttribute('disabled', 'true');
		}

		let tr = document.getElementById(id.toString());
		if (tr) {
			fetch(`/api/biblioteca/renovacao?id=${id}`, {
				method: 'POST',
			})
				.then((response) => {
					tr.classList = '';
					if (response.status === 200) {
						tr.classList.add('tag', 'is-success');
						tr.innerHTML = 'Renovado';
					} else {
						tr.classList.add('tag', 'is-danger');
						tr.innerHTML = 'Erro ao renovar';
					}
					return response.text();
				})
				.then((text) => {
					let span = document.getElementById(id + 'devolucao');
					if (span) {
						span.innerHTML = dayjs.utc(text).format('DD/MM/YYYY');
					}
				});
		}

		if (button && !isAdmin) {
			button.remove();
		}
	}
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
				<input type="checkbox" name="ativos" id="ativos" checked />
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
						{#each form.emprestimos as emprestimo (emprestimo.idemp)}
							<tr>
								<td>
									<a href="/biblioteca/leitores/{emprestimo.idleitor}">
										{emprestimo.leitor}
									</a>
								</td>
								<td>{emprestimo.titulo}</td>
								<td>{emprestimo.numero}</td>
								<td id={emprestimo.idemp.toString() + 'devolucao'}
									>{dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
								{#if emprestimo.data_devolvido}
									<td
										><span id={emprestimo.idemp.toString()} class="tag is-light">Devolvido</span
										></td>
								{:else if dayjs().isAfter(dayjs(emprestimo.data_devolucao).add(1, 'day'))}
									<td
										><span id={emprestimo.idemp.toString()} class="tag is-warning">Atrasado</span
										></td>
								{:else}
									<td><span id={emprestimo.idemp.toString()} class="tag is-info">Ativo</span></td>
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
											<button
												id={'renovar-' + emprestimo.idemp.toString()}
												class="mr-2"
												onclick={() => renovar(emprestimo.idemp)}
												title="Renovar"
												aria-label="Renovar"
												><i class="fa-solid fa-repeat fa-fw"></i>&nbsp;</button>
										{/if}
										<button
											id={'devolver-' + emprestimo.idemp.toString()}
											class="mr-2"
											onclick={() => devolver(emprestimo.idemp)}
											title="Devolver"
											aria-label="Devolver">
											<i class="fa-solid fa-reply fa-fw"></i>&nbsp;
										</button>
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
