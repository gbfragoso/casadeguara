<script lang="ts">
	import { CONTROL_CLASSES } from '#lib/components/forms/control-classes.js';
	import { filterOptions, indexOptions, normalizeSearch, type AutocompleteOption } from '#lib/forms/autocomplete.js';

	type CreateOption = { label: (text: string) => string; onCreate: (text: string) => void };

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
		onSelect?: (option: AutocompleteOption) => void;
		onSearch?: (text: string) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		createOption?: CreateOption;
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
		onSelect,
		onSearch,
		onkeydown,
		createOption,
	}: Props = $props();
	let draft = $state('');
	let open = $state(false);
	let active = $state(-1);
	let input: HTMLInputElement;
	const MAX_VISIBLE_SUGGESTIONS = 50;
	const indexed = $derived(indexOptions(options));
	const selected = $derived(options.find((option) => option.value === value));
	const query = $derived(selected?.label ?? draft);
	const matches = $derived(filterOptions(indexed, selected ? '' : query));
	const suggestions = $derived(matches.slice(0, MAX_VISIBLE_SUGGESTIONS));
	const createText = $derived(draft.trim());
	const canCreate = $derived.by(() => {
		if (!createOption || selected || !createText) return false;
		const search = normalizeSearch(createText);
		return !indexed.some((option) => option.search === search);
	});
	const optionCount = $derived(suggestions.length + (canCreate ? 1 : 0));
	const activeOption = $derived(open ? suggestions[active] : undefined);
	const createActive = $derived(open && canCreate && active === suggestions.length);
	const listId = $derived(`${id}-options`);
	const createId = $derived(`${id}-create`);
	const activeDescendant = $derived.by(() => {
		if (activeOption) return optionId(activeOption);
		return createActive ? createId : undefined;
	});
	const optionId = (option: AutocompleteOption) => `${id}-option-${option.value}`;

	function validateInput(element: HTMLInputElement) {
		element.setCustomValidity(query && !selected ? selectionMessage : '');
	}

	function revealActiveOption(element: HTMLButtonElement) {
		element.scrollIntoView({ block: 'nearest' });
	}

	function search(text: string) {
		draft = text;
		value = '';
		active = -1;
		open = true;
		onSearch?.(text);
	}

	function select(option: AutocompleteOption) {
		value = option.value;
		draft = '';
		input.focus();
		open = false;
		active = -1;
		onSelect?.({ value: option.value, label: option.label });
	}

	function create() {
		open = false;
		active = -1;
		createOption?.onCreate(createText);
	}

	function handleKey(event: KeyboardEvent) {
		if (event.isComposing) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			open = true;
			const last = optionCount - 1;
			active =
				event.key === 'ArrowDown' ? Math.min(active + 1, last) : active < 0 ? last : Math.max(active - 1, 0);
		} else if (event.key === 'Enter' && open) {
			event.preventDefault();
			if (activeOption) select(activeOption);
			else if (createActive) create();
		} else if (event.key === 'Escape' || event.key === 'Tab') {
			if (event.key === 'Escape' && open) event.preventDefault();
			open = false;
			active = -1;
		}
	}
</script>

<div class="relative">
	<input
		bind:this={input}
		{@attach validateInput}
		{id}
		class={CONTROL_CLASSES}
		type="text"
		role="combobox"
		autocomplete="off"
		{required}
		{placeholder}
		value={query}
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={open ? listId : undefined}
		aria-activedescendant={activeDescendant}
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
		onkeydown={(event) => {
			handleKey(event);
			onkeydown?.(event);
		}} />
	<input type="hidden" {name} value={selected?.value ?? ''} />
	{#if open}
		<div
			class="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-divider bg-surface shadow-raised"
			hidden={optionCount === 0}>
			<div class="max-h-64 overflow-y-auto" id={listId} role="listbox" aria-label={listLabel}>
				{#each suggestions as option, index (option.value)}
					<button
						{@attach active === index && revealActiveOption}
						id={optionId(option)}
						type="button"
						role="option"
						tabindex="-1"
						aria-selected={active === index}
						class="block w-full cursor-pointer px-3 py-2 text-left text-ink hover:bg-surface-muted aria-selected:bg-surface-muted"
						onpointerdown={(event) => event.preventDefault()}
						onclick={() => select(option)}>
						{option.label}
					</button>
				{/each}
				{#if canCreate && createOption}
					<button
						id={createId}
						type="button"
						role="option"
						tabindex="-1"
						aria-selected={createActive}
						class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left font-medium text-primary-ink hover:bg-surface-muted aria-selected:bg-surface-muted"
						onpointerdown={(event) => event.preventDefault()}
						onclick={create}>
						<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>{createOption.label(createText)}
					</button>
				{/if}
			</div>
			{#if matches.length > suggestions.length}
				<p class="border-t border-divider px-3 py-2 text-sm text-ink-muted">
					{`Mostrando ${suggestions.length} de ${matches.length} resultados. Continue digitando para refinar.`}
				</p>
			{/if}
		</div>
		{#if optionCount === 0}<p class="mt-1.5 text-sm text-ink-muted" role="status">{emptyMessage}</p>{/if}
	{/if}
</div>
