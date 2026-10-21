<script lang="ts">
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';

	const dateFields = [
		{ id: 'dataInicio', label: 'Data inicial' },
		{ id: 'dataFim', label: 'Data final' },
	];
	const weekdays = [
		{ value: '1', label: 'Segunda', checked: true },
		{ value: '2', label: 'Terça', checked: true },
		{ value: '3', label: 'Quarta', checked: false },
		{ value: '4', label: 'Quinta', checked: true },
		{ value: '5', label: 'Sexta', checked: false },
		{ value: '6', label: 'Sábado', checked: false },
		{ value: '0', label: 'Domingo', checked: false },
	];
</script>

<Columns>
	{#each dateFields as field (field.id)}
		<Column>
			<Field id={field.id} label={field.label}>
				{#snippet control()}
					<TextInput type="date" name={field.id} id={field.id} aria-label="Date" required />
				{/snippet}
			</Field>
		</Column>
	{/each}
</Columns>
<ChoiceGroup>
	{#each weekdays as weekday (weekday.value)}
		<Checkbox name="dias" value={weekday.value} checked={weekday.checked}>{weekday.label}</Checkbox>
	{/each}
</ChoiceGroup>
