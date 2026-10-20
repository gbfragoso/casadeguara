<script lang="ts">
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { onDestroy, tick } from 'svelte';

	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import { CONTROL_CLASSES, FILE_CONTROL_CLASSES } from '#lib/components/forms/control-classes.js';
	import Field from '#lib/components/forms/Field.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import PhotoCropper from './PhotoCropper.svelte';

	type PhotoForm = {
		operation?: string;
		status?: number;
		errors?: Record<string, string[] | undefined>;
	};

	interface Props {
		hasPhoto: boolean;
		photoUrl?: string;
		originalPhotoUrl?: string;
		alt: string;
		form?: PhotoForm | null;
	}

	const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
	const INVALID_PHOTO_MESSAGE = 'A foto deve ser JPEG ou PNG, ter até 3 MiB e pelo menos 300 × 300 pixels.';

	let { hasPhoto, photoUrl = 'foto', originalPhotoUrl = 'foto/original', alt, form }: Props = $props();
	let editorMode = $state<'upload' | 'reframe' | null>(null);
	let selectedFile = $state<File | null>(null);
	let objectUrl = $state<string | null>(null);
	let localError = $state<string | null>(null);
	let fileInput: HTMLInputElement | undefined;
	let reframeButton: HTMLElement | undefined;
	let returnFocusElement: HTMLElement | null = null;
	const removeEnhancer = createFormEnhancer();

	let previewUrl = $derived(objectUrl ?? (editorMode === 'reframe' ? originalPhotoUrl : photoUrl));
	let photoError = $derived.by(() => {
		if (localError) return localError;
		const field = editorMode === 'reframe' ? 'enquadramento' : 'foto';
		return form?.errors?.[field]?.join(' ') ?? null;
	});

	function revokeObjectUrl() {
		if (!objectUrl) return;
		URL.revokeObjectURL(objectUrl);
		objectUrl = null;
	}

	onDestroy(revokeObjectUrl);

	async function closeEditor(restoreFocus = true) {
		const previousFocusElement = returnFocusElement;
		editorMode = null;
		selectedFile = null;
		if (fileInput) fileInput.value = '';
		revokeObjectUrl();
		if (!restoreFocus) return;
		await tick();
		if (previousFocusElement?.isConnected) previousFocusElement.focus();
		else reframeButton?.focus();
		returnFocusElement = null;
	}

	const uploadEnhancer = createFormEnhancer({
		afterUpdate: async ({ result }) => {
			if (result.type === 'success' && editorMode === 'upload') await closeEditor();
		},
	});
	const reframeEnhancer = createFormEnhancer({
		afterUpdate: async ({ result }) => {
			if (result.type === 'success' && editorMode === 'reframe') await closeEditor();
		},
	});

	function isValidFile(file: File) {
		return ['image/jpeg', 'image/png'].includes(file.type) && file.size > 0 && file.size <= PHOTO_MAX_BYTES;
	}

	function handleFileChange(event: Event) {
		if (!(event.target instanceof HTMLInputElement)) return;
		const file = event.target.files?.[0];
		if (!file) return;
		if (!isValidFile(file)) {
			localError = INVALID_PHOTO_MESSAGE;
			event.target.value = '';
			closeEditor(false);
			return;
		}
		localError = null;
		returnFocusElement = event.target;
		revokeObjectUrl();
		selectedFile = file;
		objectUrl = URL.createObjectURL(file);
		editorMode = 'upload';
	}

	function openReframe(event: MouseEvent) {
		if (event.target instanceof HTMLElement) returnFocusElement = event.target;
		localError = null;
		editorMode = 'reframe';
	}

	function captureReframeButton(element: HTMLElement) {
		reframeButton = element;
		return () => {
			reframeButton = undefined;
		};
	}

	function cancelEditor() {
		closeEditor();
	}
</script>

<Card element="section" class="mt-4" aria-labelledby="foto-title">
	<SectionHeading id="foto-title" class="mb-4">
		Foto <Tag kind={hasPhoto ? 'success' : undefined} aria-live="polite"
			>{hasPhoto ? 'Cadastrada' : 'Pendente'}</Tag>
	</SectionHeading>

	{#if hasPhoto}
		<img class="mb-4 block aspect-239/300 w-full max-w-72 rounded-md object-cover" src={photoUrl} {alt} />
	{/if}

	<form
		class="mb-3 flex flex-col gap-2"
		method="POST"
		action="?/salvarFoto"
		enctype="multipart/form-data"
		{@attach uploadEnhancer.submitWithLoading}>
		<Field id="foto" label="Incluir ou substituir foto">
			{#snippet control()}
				<input
					class={[CONTROL_CLASSES, FILE_CONTROL_CLASSES]}
					id="foto"
					name="foto"
					type="file"
					accept="image/jpeg,image/png"
					required
					disabled={uploadEnhancer.loading}
					bind:this={fileInput}
					onchange={(event) => handleFileChange(event)} />
			{/snippet}
		</Field>
		{#if editorMode !== 'upload' || !selectedFile || !objectUrl}
			<input type="hidden" name="focalX" value="0.5" />
			<input type="hidden" name="focalY" value="0.5" />
			<input type="hidden" name="zoom" value="1" />
		{/if}
		{#if editorMode === 'upload' && selectedFile && objectUrl}
			<PhotoCropper
				src={objectUrl}
				alt={`Prévia de ${alt}`}
				onCancel={cancelEditor}
				disabled={uploadEnhancer.loading} />
		{/if}
		<div>
			<Button tone="primary" type="submit" loading={uploadEnhancer.loading}>Salvar foto</Button>
		</div>
	</form>

	{#if editorMode === 'reframe'}
		<form class="mb-3" method="POST" action="?/reenquadrarFoto" {@attach reframeEnhancer.submitWithLoading}>
			<PhotoCropper
				src={previewUrl}
				alt={`Prévia de ${alt}`}
				onCancel={cancelEditor}
				disabled={reframeEnhancer.loading} />
		</form>
	{/if}

	<ButtonGroup class="mt-2">
		{#if hasPhoto && editorMode !== 'reframe'}
			<Button
				tone="light"
				id="reenquadrar-foto"
				type="button"
				{@attach captureReframeButton}
				onclick={openReframe}>
				Reenquadrar foto
			</Button>
		{/if}
		{#if hasPhoto}
			<form method="POST" action="?/removerFoto" {@attach removeEnhancer.submitWithLoading}>
				<Button tone="danger" type="submit" loading={removeEnhancer.loading}>Remover foto</Button>
			</form>
		{/if}
	</ButtonGroup>

	{#if photoError}
		<InlineNotification kind="danger" class="mt-4" role="alert" aria-live="assertive"
			>{photoError}</InlineNotification>
	{:else if form?.operation === 'photoSaved' && form.status === 200}
		<InlineNotification kind="success" class="mt-4" role="status" aria-live="polite">
			Foto salva com sucesso!
		</InlineNotification>
	{:else if form?.operation === 'photoReframed' && form.status === 200}
		<InlineNotification kind="success" class="mt-4" role="status" aria-live="polite">
			Foto reenquadrada com sucesso!
		</InlineNotification>
	{:else if form?.operation === 'photoRemoved' && form.status === 200}
		<InlineNotification kind="success" class="mt-4" role="status" aria-live="polite">
			Foto removida com sucesso!
		</InlineNotification>
	{:else if localError}
		<InlineNotification kind="danger" class="mt-4" role="alert" aria-live="assertive"
			>{localError}</InlineNotification>
	{/if}
</Card>
