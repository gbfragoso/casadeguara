<script lang="ts">
	import { tick } from 'svelte';
	import Autocomplete from '#lib/components/forms/Autocomplete.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import SpeakerAvatar from '#lib/components/talks/SpeakerAvatar.svelte';
	import type { AutocompleteOption } from '#lib/forms/autocomplete.js';
	import type { SpeakerOption, TalkSpeaker } from '#lib/talks/types.js';

	type SpeakerChange = { campo: 'palestranteId' | 'novoPalestrante'; valor: string };
	type SaveResult = { ok: true } | { ok: false; message: string };
	type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

	type Props = {
		id: string;
		speaker: TalkSpeaker | null;
		options: readonly SpeakerOption[];
		readonly?: boolean;
		onSave: (change: SpeakerChange) => Promise<SaveResult>;
	};

	const EMPTY_TEXT = 'a definir';
	const STATUS_TEXT: Record<SaveStatus, string> = { idle: '', saving: 'Salvando…', saved: 'Salvo', error: '' };

	let { id, speaker, options, readonly = false, onSave }: Props = $props();

	let shownName = $derived(speaker?.nome ?? '');
	let editing = $state(false);
	let text = $state('');
	let status = $state<SaveStatus>('idle');
	let errorMessage = $state('');
	let trigger = $state<HTMLButtonElement>();

	const autocompleteOptions = $derived(options.map(({ id, nome }) => ({ value: `${id}`, label: nome })));
	const showsPhoto = $derived(Boolean(speaker?.temFoto && speaker.nome === shownName));
	const errorId = $derived(`${id}-error`);

	function focusCombobox(container: HTMLElement) {
		container.querySelector('input')?.focus();
	}

	function startEditing() {
		text = shownName;
		errorMessage = '';
		status = 'idle';
		editing = true;
	}

	async function stopEditing() {
		editing = false;
		await tick();
		trigger?.focus();
	}

	async function save(change: SpeakerChange, nextName: string) {
		void stopEditing();
		if (nextName === shownName) return;

		shownName = nextName;
		status = 'saving';
		const result = await onSave(change);
		if (result.ok) {
			status = 'saved';
			return;
		}
		shownName = speaker?.nome ?? '';
		errorMessage = result.message;
		status = 'error';
	}

	const selectSpeaker = (option: AutocompleteOption) =>
		save({ campo: 'palestranteId', valor: option.value }, option.label);
	const createSpeaker = (name: string) => save({ campo: 'novoPalestrante', valor: name }, name);
	const clearSpeaker = () => save({ campo: 'palestranteId', valor: '' }, '');

	function handleInput(event: Event) {
		if (event.target instanceof HTMLInputElement) text = event.target.value;
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && !event.defaultPrevented) void stopEditing();
		else if (event.key === 'Enter' && !text.trim()) void clearSpeaker();
	}

	function handleFocusOut() {
		if (!editing) return;
		if (text.trim()) editing = false;
		else void clearSpeaker();
	}
</script>

{#snippet avatar()}
	{#if shownName}
		<SpeakerAvatar id={speaker?.id ?? 0} nome={shownName} temFoto={showsPhoto} />
	{/if}
{/snippet}

<div class="min-w-0">
	{#if readonly}
		<p class={['flex min-h-11 items-center gap-3 wrap-anywhere', !shownName && 'text-ink-muted']}>
			{@render avatar()}{shownName || EMPTY_TEXT}
		</p>
	{:else if editing}
		<div {@attach focusCombobox} role="group" oninput={handleInput} onfocusout={handleFocusOut}>
			<label for={id} class="sr-only">Palestrante</label>
			<Autocomplete
				{id}
				name={`${id}-palestranteId`}
				options={autocompleteOptions}
				value={speaker ? `${speaker.id}` : ''}
				placeholder="Digite o nome do palestrante"
				listLabel="Palestrantes sugeridos"
				emptyMessage="Nenhum palestrante encontrado."
				selectionMessage="Selecione um palestrante da lista."
				onSelect={selectSpeaker}
				onkeydown={handleKey}
				createOption={{ label: (name) => `Cadastrar «${name}»`, onCreate: createSpeaker }} />
		</div>
	{:else}
		<button
			bind:this={trigger}
			type="button"
			aria-label={`Editar palestrante: ${shownName || EMPTY_TEXT}`}
			aria-describedby={status === 'error' ? errorId : undefined}
			class={[
				'-mx-2 flex min-h-11 w-[calc(100%+1rem)] cursor-text items-center gap-3 rounded-md px-2 text-left wrap-anywhere transition-colors hover:bg-surface-muted motion-reduce:transition-none',
				!shownName && 'text-ink-muted',
			]}
			onclick={startEditing}>
			{@render avatar()}{shownName || EMPTY_TEXT}
		</button>
	{/if}
	<p class="text-sm text-ink-muted" role="status">{STATUS_TEXT[status]}</p>
	{#if status === 'error'}
		<ErrorMessage id={errorId} role="alert">{errorMessage}</ErrorMessage>
	{/if}
</div>
