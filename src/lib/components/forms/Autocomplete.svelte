<script lang="ts">
	import { filterOptions, indexOptions, type AutocompleteOption } from '$lib/forms/autocomplete';

	interface Props {
		id: string;
		name: string;
		options: AutocompleteOption[];
		value?: string;
		required?: boolean;
		placeholder?: string;
		invalid?: 'true';
		describedBy?: string;
		listLabel?: string;
		emptyMessage?: string;
		selectionMessage?: string;
	}

	let {
		id,
		name,
		options,
		value = $bindable(''),
		required = false,
		placeholder,
		invalid,
		describedBy,
		listLabel = 'Cadastros sugeridos',
		emptyMessage = 'Nenhum cadastro encontrado.',
		selectionMessage = 'Selecione um cadastro da lista.',
	}: Props = $props();
	let draft = $state('');
	let open = $state(false);
	let active = $state(-1);
	let input: HTMLInputElement;
	const indexed = $derived(indexOptions(options));
	const selected = $derived(options.find((option) => option.value === value));
	const query = $derived(selected?.label ?? draft);
	const suggestions = $derived(filterOptions(indexed, selected ? '' : query));
	const activeOption = $derived(open ? suggestions[active] : undefined);
	const listId = $derived(`${id}-options`);
	const optionId = (option: AutocompleteOption) => `${id}-option-${option.value}`;

	function validateInput(element: HTMLInputElement) {
		$effect(() => {
			element.setCustomValidity(query && !selected ? selectionMessage : '');
		});
	}

	function revealOption(element: HTMLButtonElement, index: number) {
		$effect(() => {
			if (active === index) element.scrollIntoView({ block: 'nearest' });
		});
	}

	function search(text: string) {
		draft = text;
		value = '';
		active = -1;
		open = true;
	}

	function select(option: AutocompleteOption) {
		value = option.value;
		draft = '';
		input.focus();
		open = false;
		active = -1;
	}

	function handleKey(event: KeyboardEvent) {
		if (event.isComposing) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			open = true;
			const last = suggestions.length - 1;
			active =
				event.key === 'ArrowDown' ? Math.min(active + 1, last) : active < 0 ? last : Math.max(active - 1, 0);
		} else if (event.key === 'Enter' && open) {
			event.preventDefault();
			if (activeOption) select(activeOption);
		} else if (event.key === 'Escape' || event.key === 'Tab') {
			if (event.key === 'Escape' && open) event.preventDefault();
			open = false;
			active = -1;
		}
	}
</script>

<div class="control autocomplete">
	<input
		bind:this={input}
		{@attach validateInput}
		{id}
		class="input"
		type="text"
		role="combobox"
		autocomplete="off"
		{required}
		{placeholder}
		value={query}
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={open ? listId : undefined}
		aria-activedescendant={activeOption ? optionId(activeOption) : undefined}
		aria-invalid={invalid}
		aria-describedby={describedBy}
		oninput={(event) => search(event.currentTarget.value)}
		onfocus={() => {
			open = true;
			active = -1;
		}}
		onblur={() => {
			open = false;
			active = -1;
		}}
		onkeydown={handleKey} />
	<input type="hidden" {name} value={selected?.value ?? ''} />
	{#if open}
		<div class="suggestions" id={listId} role="listbox" aria-label={listLabel}>
			{#each suggestions as option, index (option.value)}
				<button
					{@attach (element) => revealOption(element, index)}
					id={optionId(option)}
					type="button"
					role="option"
					tabindex="-1"
					aria-selected={active === index}
					onpointerdown={(event) => event.preventDefault()}
					onclick={() => select(option)}>
					{option.label}
				</button>
			{/each}
		</div>
		{#if suggestions.length === 0}<p class="help" role="status">{emptyMessage}</p>{/if}
	{/if}
</div>

<style>
	.autocomplete {
		position: relative;
	}
	.suggestions {
		position: absolute;
		z-index: 10;
		width: 100%;
		max-height: 16rem;
		overflow-y: auto;
		background: var(--bulma-scheme-main);
		border: 1px solid var(--bulma-border);
		border-radius: var(--bulma-radius);
		box-shadow: var(--bulma-shadow);
	}
	.suggestions:empty {
		display: none;
	}
	button {
		display: block;
		width: 100%;
		border: 0;
		padding: 0.5rem 0.75rem;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	button:hover,
	button[aria-selected='true'] {
		background: var(--bulma-scheme-main-ter);
	}
</style>
