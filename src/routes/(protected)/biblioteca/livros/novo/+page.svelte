<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	const AUTHOR_NAME_MAX_LENGTH = 60;
	const AUTHOR_REQUIRED_MESSAGE = 'Selecione ou cadastre ao menos um autor.';
	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { editoras, colecoes, autores } = $derived(data);
	let values = $derived(form?.values ?? {});
	let errors = $derived(form?.errors ?? {});
	let hasFailureMessage = $derived(Boolean(form?.message && form.outcome !== 'created'));
	let hasErrors = $derived(Object.values(errors).some((messages) => Boolean(messages?.length)));

	const getTextValue = (field: string) => {
		const value = Reflect.get(values, field);
		return typeof value === 'string' ? value : '';
	};
	const getListValue = (field: string) => {
		const value = Reflect.get(values, field);
		return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
	};
	const errorId = (field: string) => `${field}-errors`;

	let currentStep = $state(1);
	let isEnhanced = $state(false);
	let authorClientError = $state('');
	let tomboValue = $state(getTextValue('tombo'));
	let titleValue = $state(getTextValue('titulo'));
	let publisherValue = $state(getTextValue('editora'));
	let collectionValue = $state(getTextValue('colecao'));
	let orderValue = $state(getTextValue('ordem'));
	let authorValues = $state(getListValue('autores'));
	let newAuthorValue = $state(getTextValue('novoAutor'));

	let selectedAuthors = $derived(autores.filter((author) => authorValues.includes(`${author.idautor}`)));
	let selectedPublisher = $derived(editoras.find((publisher) => `${publisher.ideditora}` === publisherValue));
	let selectedCollection = $derived(colecoes.find((collection) => `${collection.idserie}` === collectionValue));

	const initializeStepper = () => {
		isEnhanced = true;
		return () => {
			isEnhanced = false;
		};
	};

	const openAuthorsStep = (event: MouseEvent) => {
		if (!(event.currentTarget instanceof HTMLButtonElement)) return;
		if (event.currentTarget.form?.reportValidity()) currentStep = 2;
	};

	const openReviewStep = () => {
		if (authorValues.length === 0 && newAuthorValue.trim() === '') {
			authorClientError = AUTHOR_REQUIRED_MESSAGE;
			return;
		}
		authorClientError = '';
		currentStep = 3;
	};
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/livros')} aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de livros</h1>
</div>

<form class="card" method="POST" {@attach initializeStepper} {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<nav class="tabs is-boxed" aria-label="Etapas do cadastro">
			<ul>
				<li
					class={[{ 'has-text-weight-bold': currentStep === 1 }]}
					aria-current={currentStep === 1 ? 'step' : undefined}>
					<span>1. Dados do livro&nbsp;&nbsp;</span>
				</li>
				<li
					class={[{ 'has-text-weight-bold': currentStep === 2 }]}
					aria-current={currentStep === 2 ? 'step' : undefined}>
					<span>2. Autores&nbsp;&nbsp;</span>
				</li>
				<li
					class={[{ 'has-text-weight-bold': currentStep === 3 }]}
					aria-current={currentStep === 3 ? 'step' : undefined}>
					<span>3. Revisão</span>
				</li>
			</ul>
		</nav>

		<fieldset class={['book-step', { 'is-hidden': isEnhanced && currentStep !== 1 }]}>
			<legend class="is-size-5 has-text-weight-semibold mb-4">Dados do livro</legend>
			<div class="field">
				<label class="label" for="tombo">Tombo</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="tombo"
						id="tombo"
						inputmode="numeric"
						maxlength="8"
						bind:value={tomboValue}
						placeholder="Digite o tombo do livro"
						required
						aria-describedby={errors.tombo?.length ? errorId('tombo') : undefined}
						aria-invalid={errors.tombo?.length ? 'true' : undefined} />
				</div>
				{#if errors.tombo?.length}<div id={errorId('tombo')} class="help is-danger">
						{#each errors.tombo as message, index (`tombo-${index}`)}<p>{message}</p>{/each}
					</div>{/if}
			</div>

			<div class="field">
				<label class="label" for="titulo">Título</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="titulo"
						id="titulo"
						maxlength="80"
						bind:value={titleValue}
						placeholder="Digite o título do livro"
						required
						aria-describedby={errors.titulo?.length ? errorId('titulo') : undefined}
						aria-invalid={errors.titulo?.length ? 'true' : undefined} />
				</div>
				{#if errors.titulo?.length}<div id={errorId('titulo')} class="help is-danger">
						{#each errors.titulo as message, index (`titulo-${index}`)}<p>{message}</p>{/each}
					</div>{/if}
			</div>

			<div class="field">
				<label class="label" for="editora">Editora</label>
				<div class="select is-fullwidth">
					<select
						name="editora"
						id="editora"
						bind:value={publisherValue}
						required
						aria-describedby={errors.editora?.length ? errorId('editora') : undefined}
						aria-invalid={errors.editora?.length ? 'true' : undefined}>
						<option value="">Selecione uma editora</option>
						{#each editoras as editora (editora.ideditora)}<option value={`${editora.ideditora}`}
								>{editora.nome}</option
							>{/each}
					</select>
				</div>
				{#if errors.editora?.length}<div id={errorId('editora')} class="help is-danger">
						{#each errors.editora as message, index (`editora-${index}`)}<p>{message}</p>{/each}
					</div>{/if}
			</div>

			<div class="columns">
				<div class="column is-half">
					<div class="field">
						<label class="label" for="colecao">Coleção</label>
						<div class="select is-fullwidth">
							<select
								name="colecao"
								id="colecao"
								bind:value={collectionValue}
								aria-describedby={errors.colecao?.length ? errorId('colecao') : undefined}
								aria-invalid={errors.colecao?.length ? 'true' : undefined}>
								<option value="">Sem coleção</option>
								{#each colecoes as colecao (colecao.idserie)}<option value={`${colecao.idserie}`}
										>{colecao.nome}</option
									>{/each}
							</select>
						</div>
						{#if errors.colecao?.length}<div id={errorId('colecao')} class="help is-danger">
								{#each errors.colecao as message, index (`colecao-${index}`)}<p>{message}</p>{/each}
							</div>{/if}
					</div>
				</div>
				<div class="column">
					<div class="field">
						<label class="label" for="ordem">Ordem na coleção</label>
						<div class="control">
							<input
								class="input"
								type="number"
								name="ordem"
								id="ordem"
								min="1"
								step="1"
								bind:value={orderValue}
								placeholder="Ordem na coleção"
								aria-describedby={errors.ordem?.length ? 'ordem-help ordem-errors' : 'ordem-help'}
								aria-invalid={errors.ordem?.length ? 'true' : undefined} />
						</div>
						<p id="ordem-help" class="help">Informe a ordem somente quando houver coleção.</p>
						{#if errors.ordem?.length}<div id={errorId('ordem')} class="help is-danger">
								{#each errors.ordem as message, index (`ordem-${index}`)}<p>{message}</p>{/each}
							</div>{/if}
					</div>
				</div>
			</div>

			<div class={['buttons is-right', { 'is-hidden': !isEnhanced }]}>
				<button class="button is-primary" type="button" onclick={openAuthorsStep}>Próximo: autores</button>
			</div>
		</fieldset>

		<fieldset class={['book-step', { 'is-hidden': isEnhanced && currentStep !== 2 }]}>
			<legend class="is-size-5 has-text-weight-semibold mb-4">Autores</legend>
			<div class="field">
				<label class="label" for="autores">Autores cadastrados</label>
				<div class="select is-multiple is-fullwidth">
					<select
						name="autores"
						id="autores"
						multiple
						size="6"
						bind:value={authorValues}
						aria-describedby="autores-help autores-errors"
						aria-invalid={errors.autores?.length || authorClientError ? 'true' : undefined}>
						{#each autores as autor (autor.idautor)}<option value={`${autor.idautor}`}>{autor.nome}</option
							>{/each}
					</select>
				</div>
				<p id="autores-help" class="help">Use Ctrl ou Cmd para selecionar mais de um autor.</p>
				{#if errors.autores?.length || authorClientError}
					<div id="autores-errors" class="help is-danger">
						{#each errors.autores ?? [] as message, index (`autores-${index}`)}<p>{message}</p>{/each}
						{#if authorClientError}<p>{authorClientError}</p>{/if}
					</div>
				{/if}
			</div>

			<div class="field">
				<label class="label" for="novoAutor">Novo autor (opcional)</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="novoAutor"
						id="novoAutor"
						maxlength={AUTHOR_NAME_MAX_LENGTH}
						bind:value={newAuthorValue}
						placeholder="Digite o nome completo do novo autor"
						aria-describedby={errors.novoAutor?.length
							? 'novo-autor-help novoAutor-errors'
							: 'novo-autor-help'}
						aria-invalid={errors.novoAutor?.length ? 'true' : undefined} />
				</div>
				<p id="novo-autor-help" class="help">Preencha somente se o autor ainda não estiver cadastrado.</p>
				{#if errors.novoAutor?.length}<div id={errorId('novoAutor')} class="help is-danger">
						{#each errors.novoAutor as message, index (`novoAutor-${index}`)}<p>{message}</p>{/each}
					</div>{/if}
			</div>

			<div class={['buttons is-justify-content-space-between', { 'is-hidden': !isEnhanced }]}>
				<button class="button" type="button" onclick={() => (currentStep = 1)}>Voltar</button>
				<button class="button is-primary" type="button" onclick={openReviewStep}>Próximo: revisão</button>
			</div>
		</fieldset>

		<fieldset class={['book-step', { 'is-hidden': isEnhanced && currentStep !== 3 }]}>
			<legend class="is-size-5 has-text-weight-semibold mb-4">Revisão</legend>
			{#if isEnhanced}
				<div class="content">
					<p><strong>Tombo:</strong> {tomboValue || 'Não informado'}</p>
					<p><strong>Título:</strong> {titleValue || 'Não informado'}</p>
					<p><strong>Editora:</strong> {selectedPublisher?.nome ?? 'Não informada'}</p>
					<p><strong>Coleção:</strong> {selectedCollection?.nome ?? 'Sem coleção'}</p>
					<p><strong>Ordem:</strong> {orderValue || 'Não informada'}</p>
					<strong>Autores:</strong>
					<ul>
						{#each selectedAuthors as author (author.idautor)}<li>{author.nome}</li>{/each}
						{#if newAuthorValue.trim()}<li>{newAuthorValue.trim()} (novo)</li>{/if}
					</ul>
					<p><strong>Exemplar inicial:</strong> nº 1 — Disponível</p>
				</div>
			{:else}
				<p class="mb-4">
					Revise os dados preenchidos nas seções anteriores. O cadastro criará o exemplar inicial nº 1 —
					Disponível.
				</p>
			{/if}

			{#if hasErrors && currentStep === 3}
				<div class="notification is-danger" role="alert">
					<p>O cadastro não foi concluído. Volte às etapas anteriores e corrija os campos indicados.</p>
				</div>
			{/if}

			<div class="buttons is-justify-content-space-between">
				<button class={['button', { 'is-hidden': !isEnhanced }]} type="button" onclick={() => (currentStep = 2)}
					>Voltar aos autores</button>
				<button
					aria-busy={formEnhancer.loading}
					disabled={formEnhancer.loading}
					formnovalidate={isEnhanced}
					class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
					type="submit">
					<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Cadastrar livro
				</button>
			</div>
		</fieldset>
	</div>
</form>

{#if form?.outcome === 'created'}
	<Notification class="is-success">{form.message ?? 'Livro cadastrado com sucesso.'}</Notification>
{:else if hasFailureMessage}
	<Notification class="is-danger">{form?.message}</Notification>
{/if}
