<script lang="ts">
	import { enhance } from '$app/forms';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { exemplares, livros, role } = $derived(data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li><a href="/biblioteca/livros" aria-current="page">Livros</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros/exemplares" aria-current="page">Exemplares</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de exemplares</h1>
</div>

<form
	class="card"
	action="?/adicionar"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="columns">
			{#await livros then livro}
				<div class="field column is-2">
					<label class="label" for="nome">Tombo</label>
					<div class="control">
						<input class="input" type="number" name="tombo" id="tombo" value={livro[0].tombo} disabled />
					</div>
				</div>
				<div class="field column">
					<label class="label" for="nome">Título</label>
					<div class="control">
						<input class="input" type="text" name="titulo" id="titulo" value={livro[0].titulo} disabled />
					</div>
				</div>
			{/await}
		</div>
		<label class="label" for="numero">Número do exemplar</label>
		<div class="field has-addons">
			<div class="control is-expanded">
				<input class="input" type="number" name="numero" id="numero" step="1" />
			</div>
			<div class="control">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary has-text-weight-semibold"
					type="submit">Adicionar</button>
			</div>
		</div>
		{#if form?.status === 201}
			<p class="help is-success">Exemplar adicionado com sucesso!</p>
		{:else if form?.status === 200}
			<p class="help is-success">Exemplar excluído com sucesso!</p>
		{/if}
	</div>
</form>
<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Ex</th>
						<th>Data cadastro</th>
						<th>Status</th>
						{#if role.includes('admin')}
							<th class="table-actions">Ações</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#await exemplares}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							{#if role.includes('admin')}
								<td>
									<div class="skeleton-lines">
										<div></div>
									</div>
								</td>
							{/if}
						</tr>
					{:then item}
						{#each item as exemplar}
							<tr>
								<td>{exemplar.numero}</td>
								<td>{dayjs.utc(exemplar.dataCadastro).format('DD/MM/YYYY')}</td>
								<td>
									{#if exemplar.status === 'Disponível'}
										<span class="tag is-success">{exemplar.status}</span>
									{:else if exemplar.status === 'Arquivado'}
										<span class="tag is-warning">{exemplar.status}</span>
									{:else}
										<span class="tag is-danger">{exemplar.status}</span>
									{/if}
								</td>
								<td class="table-actions">
									{#if role.includes('admin') && exemplar.status !== 'Emprestado'}
										<div class="field is-grouped">
											{#if exemplar.status !== 'Disponível'}
												<form
													action="?/disponivel&exemplar={exemplar.idexemplar}"
													method="POST"
													use:enhance>
													<button title="Disponibilizar" aria-label="Disponibilizar">
														<i class="fa-solid fa-box-open fa-fw"></i>
													</button>
												</form>
											{/if}
											{#if exemplar.status !== 'Arquivado'}
												<form
													action="?/arquivar&exemplar={exemplar.idexemplar}"
													method="POST"
													use:enhance>
													<button title="Arquivar" aria-label="Arquivar">
														<i class="fa-solid fa-box-archive fa-fw"></i>
													</button>
												</form>
											{/if}
											<form
												action="?/excluir&exemplar={exemplar.idexemplar}"
												method="POST"
												use:enhance>
												<button title="Excluir" aria-label="trash">
													<i class="fa-regular fa-trash-can fa-fw"></i>
												</button>
											</form>
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
