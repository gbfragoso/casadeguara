<script lang="ts">
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';

	const weekdays = [
		{ value: '1', label: 'Segunda', checked: true },
		{ value: '2', label: 'Terça', checked: true },
		{ value: '3', label: 'Quarta', checked: false },
		{ value: '4', label: 'Quinta', checked: true },
		{ value: '5', label: 'Sexta', checked: false },
		{ value: '6', label: 'Sábado', checked: false },
		{ value: '0', label: 'Domingo', checked: false },
	];

	let startDate = $state('');
</script>

<Columns>
	<Column>
		<Field id="dataInicio" label="Data inicial">
			{#snippet control()}
				<TextInput type="date" name="dataInicio" id="dataInicio" bind:value={startDate} required />
			{/snippet}
		</Field>
	</Column>
	<Column>
		<Field id="dataFim" label="Data final">
			{#snippet control()}
				<TextInput type="date" name="dataFim" id="dataFim" min={startDate || undefined} required />
			{/snippet}
		</Field>
	</Column>
</Columns>
<ChoiceGroup>
	{#each weekdays as weekday (weekday.value)}
		<Checkbox name="dias" value={weekday.value} checked={weekday.checked}>{weekday.label}</Checkbox>
	{/each}
</ChoiceGroup>
