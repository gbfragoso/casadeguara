<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Autocomplete from '#lib/components/forms/Autocomplete.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import type { SpeakerChoice } from '#lib/talks/speaker-choice.js';
	import type { SpeakerOption } from '#lib/talks/types.js';

	type Props = {
		id: string;
		options: readonly SpeakerOption[];
		choice: SpeakerChoice;
		errors?: readonly string[];
		class?: ClassValue;
	};

	let { id, options, choice = $bindable(), errors, class: className }: Props = $props();

	const autocompleteOptions = $derived(options.map(({ id, nome }) => ({ value: `${id}`, label: nome })));
	const help = $derived(
		choice.novoPalestrante
			? `«${choice.novoPalestrante}» entra no cadastro de palestrantes ao criar a palestra.`
			: undefined,
	);

	function readTypedText(text: string) {
		choice.texto = text;
		choice.novoPalestrante = '';
	}
</script>

<Field {id} label="Palestrante" {help} {errors} class={className}>
	{#snippet control({ describedBy, invalid })}
		<Autocomplete
			{id}
			name="palestranteId"
			options={autocompleteOptions}
			bind:value={choice.palestranteId}
			placeholder="Digite o nome do palestrante"
			listLabel="Palestrantes sugeridos"
			emptyMessage="Nenhum palestrante encontrado."
			selectionMessage="Selecione um palestrante da lista."
			{describedBy}
			{invalid}
			onSearch={readTypedText}
			createOption={{
				label: (name) => `Cadastrar «${name}»`,
				onCreate: (name) => (choice.novoPalestrante = name),
			}} />
	{/snippet}
</Field>
