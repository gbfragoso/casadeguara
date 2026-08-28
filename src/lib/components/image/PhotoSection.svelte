<script lang="ts">
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import { onDestroy, tick } from 'svelte';

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
	let returnFocusElement: HTMLElement | null = null;
	let handledSuccessForm: PhotoForm | null | undefined;
	const uploadEnhancer = createFormEnhancer();
	const reframeEnhancer = createFormEnhancer();
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
		else document.getElementById('reenquadrar-foto')?.focus();
		returnFocusElement = null;
	}

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

	function cancelEditor() {
		closeEditor();
	}

	$effect(() => {
		const operation = form?.operation;
		if (form?.status !== 200 || !operation || form === handledSuccessForm) return;
		handledSuccessForm = form;
		if (editorMode !== null && (operation === 'photoSaved' || operation === 'photoReframed')) closeEditor();
	});
</script>

<section class="card mt-4 photo-section" aria-labelledby="foto-title">
	<div class="card-content">
		<h2 id="foto-title" class="title is-5">Foto</h2>
		<p class="tag" aria-live="polite">{hasPhoto ? 'Cadastrada' : 'Pendente'}</p>
		{#if hasPhoto}
			<img class="photo-section__current" src={photoUrl} {alt} />
		{/if}

		<form
			method="POST"
			action="?/salvarFoto"
			enctype="multipart/form-data"
			{@attach uploadEnhancer.submitWithLoading}>
			<label class="label" for="foto">Incluir ou substituir foto</label>
			<input
				class="input"
				id="foto"
				name="foto"
				type="file"
				accept="image/jpeg,image/png"
				required
				disabled={uploadEnhancer.loading}
				bind:this={fileInput}
				onchange={(event) => handleFileChange(event)} />
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
			<button
				class={['button is-primary mt-2', { 'is-loading': uploadEnhancer.loading }]}
				type="submit"
				aria-busy={uploadEnhancer.loading}
				disabled={uploadEnhancer.loading}>Salvar foto</button>
		</form>

		{#if editorMode === 'reframe'}
			<form method="POST" action="?/reenquadrarFoto" {@attach reframeEnhancer.submitWithLoading}>
				<PhotoCropper
					src={previewUrl}
					alt={`Prévia de ${alt}`}
					onCancel={cancelEditor}
					disabled={reframeEnhancer.loading} />
			</form>
		{/if}

		<div class="buttons mt-2">
			{#if hasPhoto && editorMode !== 'reframe'}
				<button class="button is-link is-light" id="reenquadrar-foto" type="button" onclick={openReframe}>
					Reenquadrar foto
				</button>
			{/if}
			{#if hasPhoto}
				<form method="POST" action="?/removerFoto" {@attach removeEnhancer.submitWithLoading}>
					<button
						class={['button is-danger', { 'is-loading': removeEnhancer.loading }]}
						type="submit"
						aria-busy={removeEnhancer.loading}
						disabled={removeEnhancer.loading}>Remover foto</button>
				</form>
			{/if}
		</div>

		{#if photoError}
			<div class="notification is-danger" role="alert" aria-live="assertive">{photoError}</div>
		{:else if form?.operation === 'photoSaved' && form.status === 200}
			<div class="notification is-success" role="status" aria-live="polite">Foto salva com sucesso!</div>
		{:else if form?.operation === 'photoReframed' && form.status === 200}
			<div class="notification is-success" role="status" aria-live="polite">Foto reenquadrada com sucesso!</div>
		{:else if form?.operation === 'photoRemoved' && form.status === 200}
			<div class="notification is-success" role="status" aria-live="polite">Foto removida com sucesso!</div>
		{:else if localError}
			<div class="notification is-danger" role="alert" aria-live="assertive">{localError}</div>
		{/if}
	</div>
</section>

<style>
	.photo-section__current {
		display: block;
		width: min(100%, 18rem);
		aspect-ratio: 239 / 300;
		object-fit: cover;
		margin-bottom: 1rem;
	}

	.photo-section form {
		margin-bottom: 0.75rem;
	}

	.photo-section .buttons form {
		margin: 0;
	}
</style>
