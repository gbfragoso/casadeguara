<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { colecoes, isAdmin } = $derived(data);
	let errors = $derived(form?.errors ?? {});
	const getValue = (field: string) => {
		const value = form?.values;
		if (!value) return '';
		const candidate = Reflect.get(value, field);
		return typeof candidate === 'string' ? candidate : '';
	};
	let collectionValue = $derived(getValue('colecao') || getValue('serie'));
	let hasDeleteFailure = $derived(Boolean(form?.message && form.outcome !== 'deleted'));

	const errorId = (field: string) => `${field}-errors`;
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/livros')} aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de livros</h1>
</div>

<form class="card" action="?/pesquisar" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field columns">
			<div class="column">
				<label class="label" for="tombo">Tombo</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="tombo"
						id="tombo"
						inputmode="numeric"
						maxlength="8"
						value={getValue('tombo')}
						placeholder="Digite o tombo do livro"
						aria-describedby={errors.tombo?.length ? errorId('tombo') : undefined}
						aria-invalid={errors.tombo?.length ? 'true' : undefined} />
				</div>
				{#if errors.tombo?.length}
					<div id={errorId('tombo')} class="help is-danger">
						{#each errors.tombo as message, index (`tombo-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
			<div class="column">
				<label class="label" for="titulo">Título</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="titulo"
						id="titulo"
						maxlength="80"
						value={getValue('titulo')}
						placeholder="Digite o título do livro"
						aria-describedby={errors.titulo?.length ? errorId('titulo') : undefined}
						aria-invalid={errors.titulo?.length ? 'true' : undefined} />
				</div>
				{#if errors.titulo?.length}
					<div id={errorId('titulo')} class="help is-danger">
						{#each errors.titulo as message, index (`titulo-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
			<div class="column">
				<label class="label" for="autor">Autor</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="autor"
						id="autor"
						maxlength="60"
						value={getValue('autor')}
						placeholder="Digite o nome do autor"
						aria-describedby={errors.autor?.length ? errorId('autor') : undefined}
						aria-invalid={errors.autor?.length ? 'true' : undefined} />
				</div>
				{#if errors.autor?.length}
					<div id={errorId('autor')} class="help is-danger">
						{#each errors.autor as message, index (`autor-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="field columns">
			<div class="column">
				<label class="label" for="editora">Editora</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="editora"
						id="editora"
						maxlength="60"
						value={getValue('editora')}
						placeholder="Digite o nome da editora"
						aria-describedby={errors.editora?.length ? errorId('editora') : undefined}
						aria-invalid={errors.editora?.length ? 'true' : undefined} />
				</div>
				{#if errors.editora?.length}
					<div id={errorId('editora')} class="help is-danger">
						{#each errors.editora as message, index (`editora-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
			<div class="column">
				<label class="label" for="colecao">Coleção</label>
				<div class="select is-fullwidth">
					<select
						name="colecao"
						id="colecao"
						value={collectionValue}
						aria-describedby={errors.colecao?.length ? errorId('colecao') : undefined}
						aria-invalid={errors.colecao?.length ? 'true' : undefined}>
						<option value="" selected={collectionValue === ''}>Todas as coleções</option>
						{#each colecoes as colecao (colecao.idserie)}
							<option value={colecao.idserie} selected={collectionValue === `${colecao.idserie}`}
								>{colecao.nome}</option>
						{/each}
					</select>
				</div>
				{#if errors.colecao?.length}
					<div id={errorId('colecao')} class="help is-danger">
						{#each errors.colecao as message, index (`colecao-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
			<div class="column">
				<label class="label" for="keyword">Palavra-chave</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="keyword"
						id="keyword"
						maxlength="30"
						value={getValue('keyword')}
						placeholder="Digite uma palavra-chave"
						aria-describedby={errors.keyword?.length ? errorId('keyword') : undefined}
						aria-invalid={errors.keyword?.length ? 'true' : undefined} />
				</div>
				{#if errors.keyword?.length}
					<div id={errorId('keyword')} class="help is-danger">
						{#each errors.keyword as message, index (`keyword-${index}`)}<p>{message}</p>{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={formEnhancer.loading}
					disabled={formEnhancer.loading}
					class={[
						'button is-primary is-fullwidth has-text-weight-semibold',
						{ 'is-loading': formEnhancer.loading },
					]}
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					class="button is-fullwidth has-text-weight-semibold is-warning"
					href={resolve('/biblioteca/livros/novo')}
					><i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.outcome === 'deleted'}
	<Notification class="is-success">{form.message ?? 'Livro excluído com sucesso.'}</Notification>
{:else if hasDeleteFailure}
	<Notification class="is-danger">{form?.message}</Notification>
{/if}

{#if form?.livros !== undefined}
	<div class="card">
		<div class="card-content">
			{#if form.livros.length === 0}
				<p role="status">Nenhum livro encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<caption class="is-sr-only">Resultados da consulta de livros</caption>
						<thead>
							<tr>
								<th>Tombo</th>
								<th>Título</th>
								<th>Palavra-chave</th>
								<th>Referência</th>
								<th class="table-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{#each form.livros as livro, index (`${livro.idlivro}-${livro.keyword ?? ''}-${livro.referencia ?? ''}`)}
								{@const confirmationId = `delete-book-${livro.idlivro}-${index}`}
								<tr>
									<td>{livro.tombo}</td>
									<td>{livro.titulo}</td>
									<td>{livro.keyword ?? '—'}</td>
									<td>{livro.referencia ?? '—'}</td>
									<td class="table-actions">
										<div class="field is-grouped is-align-items-center">
											<a
												aria-label={`Editar livro ${livro.titulo}`}
												title="Editar"
												class="control"
												target="_blank"
												href={resolve('/(protected)/biblioteca/livros/[id=integer]', {
													id: `${livro.idlivro}`,
												})}>
												<i class="fa-solid fa-pen-to-square fa-fw" aria-hidden="true"></i>
											</a>
											<a
												aria-label={`Autores do livro ${livro.titulo}`}
												title="Autores"
												class="control"
												target="_blank"
												href={resolve('/(protected)/biblioteca/livros/[id=integer]/autores', {
													id: `${livro.idlivro}`,
												})}>
												<i class="fa-solid fa-user-pen fa-fw" aria-hidden="true"></i>
											</a>
											<a
												aria-label={`Exemplares do livro ${livro.titulo}`}
												title="Exemplares"
												class="control"
												target="_blank"
												href={resolve(
													'/(protected)/biblioteca/livros/[id=integer]/exemplares',
													{
														id: `${livro.idlivro}`,
													},
												)}>
												<i class="fa-solid fa-book fa-fw" aria-hidden="true"></i>
											</a>
											<a
												aria-label={`Palavras-chave do livro ${livro.titulo}`}
												title="Palavras-chave"
												class="control"
												target="_blank"
												href={resolve('/(protected)/biblioteca/livros/[id=integer]/keywords', {
													id: `${livro.idlivro}`,
												})}>
												<i class="fa-solid fa-key fa-fw" aria-hidden="true"></i>
											</a>
											{#if isAdmin}
												<button
													class="button is-ghost is-small control p-0"
													type="button"
													popovertarget={confirmationId}
													aria-label={`Excluir livro ${livro.titulo}`}
													title="Excluir">
													<i
														class="fa-regular fa-trash-can fa-fw delete-trigger"
														aria-hidden="true"></i>
												</button>
												<div
													id={confirmationId}
													class="modal delete-confirmation"
													popover="auto"
													role="dialog"
													aria-labelledby={`${confirmationId}-title`}>
													<div class="modal-background"></div>
													<div class="modal-card">
														<header class="modal-card-head">
															<p id={`${confirmationId}-title`} class="modal-card-title">
																Excluir livro
															</p>
														</header>
														<section class="modal-card-body">
															<p>
																Para finalizar a exclusão dos livros é necessário antes
																excluir os exemplares. Confirma a exclusão de “{livro.titulo}”?
															</p>
														</section>
														<footer class="modal-card-foot">
															<div class="buttons">
																<button
																	class="button"
																	type="button"
																	popovertarget={confirmationId}
																	popovertargetaction="hide">Cancelar</button>
																<form action="?/excluir" method="POST">
																	<input
																		type="hidden"
																		name="idlivro"
																		value={livro.idlivro} />
																	<button
																		class="button is-danger"
																		type="submit"
																		aria-label={`Confirmar exclusão do livro ${livro.titulo}`}>
																		Excluir
																	</button>
																</form>
															</div>
														</footer>
													</div>
												</div>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.delete-trigger {
		color: var(--bulma-danger);
	}

	.delete-confirmation:popover-open {
		display: flex;
		width: 100vw;
		height: 100vh;
		max-width: none;
		max-height: none;
		padding: 0;
		border: 0;
		background: transparent;
	}
</style>
