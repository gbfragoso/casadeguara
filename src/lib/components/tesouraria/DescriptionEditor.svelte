<script lang="ts">
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import {
		descriptionSchema,
		INVALID_DESCRIPTION_MESSAGE,
		MAX_TEXT_LENGTH,
	} from '#lib/validation/tesouraria/common.js';

	type SaveResult = { ok: true } | { ok: false; message: string };
	type Props = {
		lancamentoId: number;
		value: string;
		onSave: (descricao: string) => Promise<SaveResult>;
		onCancel: () => void;
	};

	let { lancamentoId, value, onSave, onCancel }: Props = $props();

	let draft = $derived(value);
	let saving = $state(false);
	let errorMessage = $state('');

	const inputId = $derived(`descricao-lancamento-${lancamentoId}`);
	const errorId = $derived(`${inputId}-erro`);

	function focusOnMount(element: HTMLElement) {
		element.focus();
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		const parsed = descriptionSchema.safeParse(draft);
		if (!parsed.success) {
			errorMessage = parsed.error.issues[0]?.message ?? INVALID_DESCRIPTION_MESSAGE;
			return;
		}
		if (parsed.data === value) return onCancel();

		saving = true;
		errorMessage = '';
		const result = await onSave(parsed.data);
		saving = false;
		if (!result.ok) errorMessage = result.message;
	}

	function handleKey(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.isComposing) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			if (!saving) onCancel();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	}
</script>

<form class="flex min-w-48 flex-col gap-1" novalidate onsubmit={save}>
	<div class="flex items-center gap-1">
		<TextInput
			{@attach focusOnMount}
			id={inputId}
			name="descricao"
			type="text"
			aria-label={`Descrição do lançamento ${lancamentoId}`}
			maxlength={MAX_TEXT_LENGTH}
			bind:value={draft}
			aria-busy={saving}
			aria-invalid={Boolean(errorMessage)}
			aria-describedby={errorMessage ? errorId : undefined}
			onkeydown={handleKey} />
		<IconAction
			type="submit"
			icon="fa-solid fa-check"
			title="Salvar descrição"
			aria-label="Salvar descrição"
			disabled={saving} />
		<IconAction
			icon="fa-solid fa-xmark"
			title="Cancelar edição"
			aria-label="Cancelar edição"
			disabled={saving}
			onclick={onCancel} />
	</div>
	{#if errorMessage}
		<ErrorMessage id={errorId} role="alert">{errorMessage}</ErrorMessage>
	{/if}
</form>
