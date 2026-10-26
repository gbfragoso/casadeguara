<script lang="ts">
	import { tick } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import TextArea from '#lib/components/forms/TextArea.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';

	type SaveResult = { ok: true } | { ok: false; message: string };
	type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

	type Props = {
		id: string;
		label: string;
		value: string | null;
		type?: 'text' | 'date' | 'time' | 'textarea';
		min?: string;
		readonly?: boolean;
		emptyText?: string;
		help?: string;
		format?: (value: string) => string;
		validate?: (value: string) => string | null;
		onSave: (value: string) => Promise<SaveResult>;
		class?: ClassValue;
	};

	const STATUS_TEXT: Record<SaveStatus, string> = { idle: '', saving: 'Salvando…', saved: 'Salvo', error: '' };

	let {
		id,
		label,
		value,
		type = 'text',
		min,
		readonly = false,
		emptyText = 'a definir',
		help,
		format = (text) => text,
		validate = () => null,
		onSave,
		class: className,
	}: Props = $props();

	let current = $derived(value ?? '');
	let editing = $state(false);
	let draft = $state('');
	let status = $state<SaveStatus>('idle');
	let errorMessage = $state('');
	let trigger = $state<HTMLButtonElement>();

	const displayText = $derived(current ? format(current) : emptyText);
	const errorId = $derived(`${id}-error`);
	const helpId = $derived(help ? `${id}-help` : undefined);
	const triggerDescription = $derived([helpId, status === 'error' && errorId].filter(Boolean).join(' ') || undefined);

	function focusOnMount(element: HTMLElement) {
		element.focus();
	}

	function startEditing() {
		draft = current;
		errorMessage = '';
		status = 'idle';
		editing = true;
	}

	async function stopEditing(restoreFocus: boolean) {
		editing = false;
		if (!restoreFocus) return;
		await tick();
		trigger?.focus();
	}

	function reject(message: string) {
		current = value ?? '';
		errorMessage = message;
		status = 'error';
	}

	async function save(submitted: string) {
		const invalid = validate(submitted);
		if (invalid) return reject(invalid);

		current = submitted;
		status = 'saving';
		const result = await onSave(submitted);
		if (result.ok) status = 'saved';
		else reject(result.message);
	}

	async function commit(restoreFocus: boolean) {
		if (!editing) return;
		const submitted = draft;
		const stopped = stopEditing(restoreFocus);
		if (submitted !== current) await save(submitted);
		await stopped;
	}

	function handleKey(event: KeyboardEvent) {
		if (event.isComposing) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			void stopEditing(true);
		} else if (event.key === 'Enter' && type !== 'textarea') {
			event.preventDefault();
			void commit(true);
		}
	}
</script>

<div class={['min-w-0', className]}>
	{#if readonly}
		<p class={['wrap-anywhere', type === 'textarea' && 'whitespace-pre-line', !current && 'text-ink-muted']}>
			{displayText}
		</p>
	{:else if editing}
		{#if type === 'textarea'}
			<TextArea
				{@attach focusOnMount}
				{id}
				aria-label={label}
				rows={4}
				aria-describedby={helpId}
				bind:value={draft}
				onblur={() => commit(false)}
				onkeydown={handleKey} />
		{:else}
			<TextInput
				{@attach focusOnMount}
				{id}
				{type}
				{min}
				aria-label={label}
				aria-describedby={helpId}
				bind:value={draft}
				onblur={() => commit(false)}
				onkeydown={handleKey} />
		{/if}
	{:else}
		<button
			bind:this={trigger}
			type="button"
			aria-label={`Editar ${label.toLocaleLowerCase('pt-BR')}: ${displayText}`}
			aria-describedby={triggerDescription}
			class={[
				'-mx-2 flex min-h-11 w-[calc(100%+1rem)] cursor-text items-center rounded-md px-2 text-left wrap-anywhere transition-colors hover:bg-surface-muted motion-reduce:transition-none',
				type === 'textarea' && 'whitespace-pre-line',
				!current && 'text-ink-muted',
			]}
			onclick={startEditing}>
			{displayText}
		</button>
	{/if}
	{#if help}
		<p id={helpId} class="text-sm text-ink-muted">{help}</p>
	{/if}
	<p class="text-sm text-ink-muted" role="status">{STATUS_TEXT[status]}</p>
	{#if status === 'error'}
		<ErrorMessage id={errorId} role="alert">{errorMessage}</ErrorMessage>
	{/if}
</div>
