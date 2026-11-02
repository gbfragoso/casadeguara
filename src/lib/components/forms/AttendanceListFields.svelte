<script lang="ts">
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import type { AttendanceField, AttendanceListIssue } from '#lib/validation/pdf/attendance-list.js';

	type Props = { issues?: readonly AttendanceListIssue[] };

	let { issues = [] }: Props = $props();

	const weekdays = [
		{ value: '1', label: 'Segunda', checked: true },
		{ value: '2', label: 'Terça', checked: true },
		{ value: '3', label: 'Quarta', checked: false },
		{ value: '4', label: 'Quinta', checked: true },
		{ value: '5', label: 'Sexta', checked: false },
		{ value: '6', label: 'Sábado', checked: false },
		{ value: '0', label: 'Domingo', checked: false },
	];
	const WEEKDAY_ERRORS_ID = 'dias-errors';

	const readMessages = (field: AttendanceField) =>
		issues.filter((issue) => issue.field === field).map((issue) => issue.message);

	let startDate = $state('');
	let weekdayMessages = $derived(readMessages('dias'));
</script>

<Field id="titulo" label="Título da lista" errors={readMessages('titulo')}>
	{#snippet control({ describedBy, invalid })}
		<TextInput
			type="text"
			name="titulo"
			id="titulo"
			required
			aria-describedby={describedBy}
			aria-invalid={invalid} />
	{/snippet}
</Field>
<Columns>
	<Column>
		<Field id="dataInicio" label="Data inicial">
			{#snippet control()}
				<TextInput type="date" name="dataInicio" id="dataInicio" bind:value={startDate} required />
			{/snippet}
		</Field>
	</Column>
	<Column>
		<Field id="dataFim" label="Data final" errors={readMessages('periodo')}>
			{#snippet control({ describedBy, invalid })}
				<TextInput
					type="date"
					name="dataFim"
					id="dataFim"
					min={startDate || undefined}
					required
					aria-describedby={describedBy}
					aria-invalid={invalid} />
			{/snippet}
		</Field>
	</Column>
</Columns>
<fieldset
	class="flex min-w-0 flex-col gap-1.5"
	aria-describedby={weekdayMessages.length > 0 ? WEEKDAY_ERRORS_ID : undefined}>
	<legend class="mb-1.5 text-sm font-medium text-ink-strong">Dias da semana</legend>
	<ChoiceGroup>
		{#each weekdays as weekday (weekday.value)}
			<Checkbox name="dias" value={weekday.value} checked={weekday.checked}>{weekday.label}</Checkbox>
		{/each}
	</ChoiceGroup>
	{#if weekdayMessages.length > 0}
		<ErrorMessage element="div" id={WEEKDAY_ERRORS_ID}>
			<div>
				{#each weekdayMessages as message (message)}
					<p>{message}</p>
				{/each}
			</div>
		</ErrorMessage>
	{/if}
</fieldset>
