<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import PhotoSection from '#lib/components/image/PhotoSection.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { SPEAKER_NAME_MAX_LENGTH } from '#lib/validation/comunicacao/palestrantes.js';
	import type { ActionData, PageServerData } from './$types';

	type Props = { data: PageServerData; form: ActionData };

	const PHOTO_INSTRUCTIONS =
		'Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá na foto do palestrante.';
	const DELETE_DIALOG_ID = 'excluir-palestrante';

	let { data, form }: Props = $props();
	let deleteDialog = $state<HTMLElement>();

	const nameEnhancer = createFormEnhancer({ reset: false });
	const deleteEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestrantes', href: resolve('comunicacao/palestrantes') },
	];

	let palestrante = $derived(data.palestrante);
	let photoBase = $derived(`/comunicacao/palestrantes/${palestrante.id}/foto`);
	let photoQuery = $derived(palestrante.fotoVersao ? `?versao=${palestrante.fotoVersao}` : '');
	let nameErrors = $derived(form && 'errors' in form ? form.errors?.nome : undefined);
	let nameSaved = $derived(form !== null && form !== undefined && !('operation' in form) && 'status' in form);
	let deleteMessage = $derived(form && 'mensagem' in form ? form.mensagem : undefined);
	let photoForm = $derived(form && 'operation' in form ? form : null);
</script>

<PageHeader {breadcrumb}>{palestrante.nome}</PageHeader>

<Card
	element="form"
	method="POST"
	action="?/salvar"
	class="flex flex-col gap-5"
	aria-labelledby="dados-titulo"
	{@attach nameEnhancer.submitWithLoading}>
	<SectionHeading id="dados-titulo">
		Dados do palestrante
		{#if palestrante.importado}<Tag kind="info">Importado do cadastro</Tag>{/if}
	</SectionHeading>
	<Field id="nome" label="Nome" errors={nameErrors}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				value={palestrante.nome}
				maxlength={SPEAKER_NAME_MAX_LENGTH}
				autocomplete="off"
				required
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	{#if nameSaved}
		<InlineNotification kind="success" role="status" aria-live="polite">Nome salvo com sucesso!</InlineNotification>
	{/if}
	<div>
		<Button type="submit" tone="primary" loading={nameEnhancer.loading} bold>Salvar nome</Button>
	</div>
</Card>

<PhotoSection
	hasPhoto={palestrante.temFoto}
	photoUrl={`${photoBase}${photoQuery}`}
	originalPhotoUrl={`${photoBase}/original${photoQuery}`}
	alt={`Foto de ${palestrante.nome}`}
	form={photoForm}
	aspectRatio={1}
	instructions={PHOTO_INSTRUCTIONS} />

{#if data.isAdmin}
	<Card element="section" class="mt-4 flex flex-col gap-4" aria-labelledby="exclusao-titulo">
		<SectionHeading id="exclusao-titulo">Exclusão</SectionHeading>
		<p>Só é possível excluir um palestrante que não esteja em nenhuma palestra.</p>
		<form method="POST" action="?/excluir" {@attach deleteEnhancer.submitWithLoading}>
			<Button tone="danger" type="button" popovertarget={DELETE_DIALOG_ID} loading={deleteEnhancer.loading}>
				Excluir palestrante
			</Button>
			<div
				id={DELETE_DIALOG_ID}
				bind:this={deleteDialog}
				popover="auto"
				role="dialog"
				aria-labelledby={`${DELETE_DIALOG_ID}-titulo`}
				class="m-auto w-[calc(100%-2rem)] max-w-lg flex-col gap-4 rounded-xl bg-surface p-6 text-left text-ink shadow-raised backdrop:bg-overlay/60 open:flex">
				<SectionHeading
					element="p"
					id={`${DELETE_DIALOG_ID}-titulo`}
					icon="fa-solid fa-trash-can"
					iconTone="danger">
					Excluir palestrante
				</SectionHeading>
				<p class="wrap-anywhere">
					Confirma a exclusão do palestrante “{palestrante.nome}”? Esta ação não pode ser desfeita.
				</p>
				<div class="mt-2 flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end">
					<Button type="button" popovertarget={DELETE_DIALOG_ID} popovertargetaction="hide">Cancelar</Button>
					<Button tone="danger" type="submit" onclick={() => deleteDialog?.hidePopover()}
						>Confirmar exclusão</Button>
				</div>
			</div>
		</form>
		{#if deleteMessage}
			<InlineNotification kind="danger" role="alert" aria-live="assertive">{deleteMessage}</InlineNotification>
		{/if}
	</Card>
{/if}
