<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	const AUTHOR_NAME_MAX_LENGTH = 60;
	const AUTHOR_REQUIRED_MESSAGE = 'Selecione ou cadastre ao menos um autor.';
	const STEPS = ['1. Dados do livro', '2. Autores', '3. Revisão'];
	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { editoras, colecoes, autores } = $derived(data);
	let values = $derived(form?.values ?? {});
	let errors = $derived(form?.errors ?? {});
	let hasFailureMessage = $derived(Boolean(form?.message && form.outcome !== 'created'));
	let hasErrors = $derived(Object.values(errors).some((messages) => Boolean(messages?.length)));
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
	];

	const getTextValue = (field: string) => {
		const value = Reflect.get(values, field);
		return typeof value === 'string' ? value : '';
	};
	const getListValue = (field: string) => {
		const value = Reflect.get(values, field);
		return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
	};

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

	let authorErrors = $derived([...(errors.autores ?? []), ...(authorClientError ? [authorClientError] : [])]);
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

<PageHeader {breadcrumb} icon="fa-solid fa-book">Cadastro de livros</PageHeader>

<Card element="form" method="POST" {@attach initializeStepper} {@attach formEnhancer.submitWithLoading}>
	<nav aria-label="Etapas do cadastro" class="mb-8">
		<ol class="grid grid-cols-3 gap-2 tablet:gap-4">
			{#each STEPS as step, index (step)}
				<li
					aria-current={currentStep === index + 1 ? 'step' : undefined}
					class="border-t-4 border-divider pt-2 text-sm text-ink-muted aria-[current=step]:border-primary-600 aria-[current=step]:font-bold aria-[current=step]:text-primary-ink">
					<span>{step}</span>
				</li>
			{/each}
		</ol>
	</nav>

	<fieldset class="flex flex-col gap-5" hidden={isEnhanced && currentStep !== 1}>
		<SectionHeading element="legend" icon="fa-solid fa-book" class="mb-5">Dados do livro</SectionHeading>
		<Field id="tombo" label="Tombo" errors={errors.tombo}>
			{#snippet control({ describedBy, invalid })}
				<TextInput
					type="text"
					name="tombo"
					id="tombo"
					inputmode="numeric"
					maxlength={8}
					bind:value={tomboValue}
					placeholder="Digite o tombo do livro"
					required
					aria-describedby={describedBy}
					aria-invalid={invalid} />
			{/snippet}
		</Field>
		<Field id="titulo" label="Título" errors={errors.titulo}>
			{#snippet control({ describedBy, invalid })}
				<TextInput
					type="text"
					name="titulo"
					id="titulo"
					maxlength={80}
					bind:value={titleValue}
					placeholder="Digite o título do livro"
					required
					aria-describedby={describedBy}
					aria-invalid={invalid} />
			{/snippet}
		</Field>
		<Field id="editora" label="Editora" errors={errors.editora}>
			{#snippet control({ describedBy, invalid })}
				<Select
					name="editora"
					id="editora"
					bind:value={publisherValue}
					required
					aria-describedby={describedBy}
					aria-invalid={invalid}>
					<option value="">Selecione uma editora</option>
					{#each editoras as editora (editora.ideditora)}
						<option value={`${editora.ideditora}`}>{editora.nome}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>
		<Columns>
			<Column size="half">
				<Field id="colecao" label="Coleção" errors={errors.colecao}>
					{#snippet control({ describedBy, invalid })}
						<Select
							name="colecao"
							id="colecao"
							bind:value={collectionValue}
							aria-describedby={describedBy}
							aria-invalid={invalid}>
							<option value="">Sem coleção</option>
							{#each colecoes as colecao (colecao.idserie)}
								<option value={`${colecao.idserie}`}>{colecao.nome}</option>
							{/each}
						</Select>
					{/snippet}
				</Field>
			</Column>
			<Column>
				<Field
					id="ordem"
					label="Ordem na coleção"
					help="Informe a ordem somente quando houver coleção."
					helpId="ordem-help"
					errors={errors.ordem}>
					{#snippet control({ describedBy, invalid })}
						<TextInput
							type="number"
							name="ordem"
							id="ordem"
							min="1"
							step="1"
							bind:value={orderValue}
							placeholder="Ordem na coleção"
							aria-describedby={describedBy}
							aria-invalid={invalid} />
					{/snippet}
				</Field>
			</Column>
		</Columns>

		<ButtonGroup align="end" class="border-t border-divider pt-5" hidden={!isEnhanced}>
			<Button tone="primary" type="button" onclick={openAuthorsStep}>Próximo: autores</Button>
		</ButtonGroup>
	</fieldset>

	<fieldset class="flex flex-col gap-5" hidden={isEnhanced && currentStep !== 2}>
		<SectionHeading element="legend" icon="fa-solid fa-user-pen" class="mb-5">Autores</SectionHeading>
		<Field
			id="autores"
			label="Autores cadastrados"
			help="Use Ctrl ou Cmd para selecionar mais de um autor."
			helpId="autores-help"
			errors={authorErrors}>
			{#snippet control({ describedBy, invalid })}
				<Select
					name="autores"
					id="autores"
					multiple
					size={6}
					bind:value={authorValues}
					aria-describedby={describedBy}
					aria-invalid={invalid}>
					{#each autores as autor (autor.idautor)}
						<option value={`${autor.idautor}`}>{autor.nome}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>
		<Field
			id="novoAutor"
			label="Novo autor (opcional)"
			help="Preencha somente se o autor ainda não estiver cadastrado."
			helpId="novo-autor-help"
			errors={errors.novoAutor}>
			{#snippet control({ describedBy, invalid })}
				<TextInput
					type="text"
					name="novoAutor"
					id="novoAutor"
					maxlength={AUTHOR_NAME_MAX_LENGTH}
					bind:value={newAuthorValue}
					placeholder="Digite o nome completo do novo autor"
					aria-describedby={describedBy}
					aria-invalid={invalid} />
			{/snippet}
		</Field>

		<ButtonGroup align="between" class="border-t border-divider pt-5" hidden={!isEnhanced}>
			<Button type="button" onclick={() => (currentStep = 1)}>Voltar</Button>
			<Button tone="primary" type="button" onclick={openReviewStep}>Próximo: revisão</Button>
		</ButtonGroup>
	</fieldset>

	<fieldset class="flex flex-col gap-5" hidden={isEnhanced && currentStep !== 3}>
		<SectionHeading element="legend" icon="fa-solid fa-list-check" class="mb-5">Revisão</SectionHeading>
		{#if isEnhanced}
			<div class="flex flex-col gap-2">
				<p><strong>Tombo:</strong> {tomboValue || 'Não informado'}</p>
				<p><strong>Título:</strong> {titleValue || 'Não informado'}</p>
				<p><strong>Editora:</strong> {selectedPublisher?.nome ?? 'Não informada'}</p>
				<p><strong>Coleção:</strong> {selectedCollection?.nome ?? 'Sem coleção'}</p>
				<p><strong>Ordem:</strong> {orderValue || 'Não informada'}</p>
				<strong>Autores:</strong>
				<ul class="list-disc pl-6">
					{#each selectedAuthors as author (author.idautor)}<li>{author.nome}</li>{/each}
					{#if newAuthorValue.trim()}<li>{newAuthorValue.trim()} (novo)</li>{/if}
				</ul>
				<p><strong>Exemplar inicial:</strong> nº 1 — Disponível</p>
			</div>
		{:else}
			<p>
				Revise os dados preenchidos nas seções anteriores. O cadastro criará o exemplar inicial nº 1 —
				Disponível.
			</p>
		{/if}

		{#if hasErrors && currentStep === 3}
			<InlineNotification kind="danger" role="alert">
				<p>O cadastro não foi concluído. Volte às etapas anteriores e corrija os campos indicados.</p>
			</InlineNotification>
		{/if}

		<ButtonGroup align="between" class="border-t border-divider pt-5">
			<Button type="button" hidden={!isEnhanced} onclick={() => (currentStep = 2)}>Voltar aos autores</Button>
			<Button tone="primary" type="submit" loading={formEnhancer.loading} formnovalidate={isEnhanced} bold>
				<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Cadastrar livro
			</Button>
		</ButtonGroup>
	</fieldset>
</Card>

{#if form?.outcome === 'created'}
	<Notification kind="success">{form.message ?? 'Livro cadastrado com sucesso.'}</Notification>
{:else if hasFailureMessage}
	<Notification kind="danger">{form?.message}</Notification>
{/if}
