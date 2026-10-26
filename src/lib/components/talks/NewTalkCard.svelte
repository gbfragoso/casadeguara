<script lang="ts">
	import { flattenError } from 'zod';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextArea from '#lib/components/forms/TextArea.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import { sendTalkRequest, type TalkRequestContext } from '#lib/talks/requests.js';
	import { suggestTalkTime } from '#lib/talks/schedule.js';
	import type { WeekdayTimes } from '#lib/talks/types.js';
	import { talkCreateSchema } from '#lib/validation/comunicacao/palestras.js';

	type CreateField = 'data' | 'horario' | 'local' | 'reuniaoCom';
	type Props = {
		context: TalkRequestContext;
		hoje: string;
		isAdmin: boolean;
		localPadrao: string;
		reuniaoComPadrao: readonly string[];
		horariosSugeridos: WeekdayTimes;
	};

	const CREATE_FAILURE_MESSAGE = 'Não foi possível criar a palestra. Tente de novo.';
	const MEETING_ACTIVITIES_ROWS = 5;

	let { context, hoje, isAdmin, localPadrao, reuniaoComPadrao, horariosSugeridos }: Props = $props();

	let open = $state(false);
	let data = $state('');
	let horario = $state('');
	let local = $state('');
	let reuniaoCom = $state('');
	let errors = $state<Partial<Record<CreateField, string[]>>>({});
	let formError = $state('');
	let saving = $state(false);
	let restoreFocus = $state(false);
	let timeEdited = false;

	function focusOnMount(element: HTMLElement) {
		element.focus();
	}

	function start() {
		data = '';
		horario = '';
		local = localPadrao;
		reuniaoCom = reuniaoComPadrao.join('\n');
		timeEdited = false;
		errors = {};
		formError = '';
		restoreFocus = false;
		open = true;
	}

	function close() {
		restoreFocus = true;
		open = false;
	}

	function chooseDate(value: string) {
		if (!timeEdited) horario = value ? (suggestTalkTime(value, horariosSugeridos) ?? '') : '';
	}

	function showFailure(message: string, campo: string | undefined) {
		if (campo) errors = { [campo]: [message] };
		else formError = message;
	}

	async function create(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		const fields = { data, horario, local, reuniaoCom };
		const parsed = talkCreateSchema.safeParse(fields);
		errors = parsed.success ? {} : flattenError(parsed.error).fieldErrors;
		if (!parsed.success) return;

		saving = true;
		const result = await sendTalkRequest(context, '?/criar', fields, CREATE_FAILURE_MESSAGE);
		saving = false;
		if (result.ok) close();
		else showFailure(result.message, result.campo);
	}
</script>

{#if open}
	<Card element="form" novalidate aria-labelledby="nova-palestra-titulo" onsubmit={create}>
		<SectionHeading id="nova-palestra-titulo" icon="fa-solid fa-plus">Nova palestra</SectionHeading>
		<div class="mt-4 grid gap-4 tablet:grid-cols-6">
			<Field id="nova-palestra-data" label="Data" errors={errors.data} class="tablet:col-span-2">
				{#snippet control({ describedBy, invalid })}
					<TextInput
						{@attach focusOnMount}
						id="nova-palestra-data"
						name="data"
						type="date"
						min={isAdmin ? undefined : hoje}
						required
						bind:value={data}
						oninput={(event) => chooseDate(event.currentTarget.value)}
						aria-describedby={describedBy}
						aria-invalid={invalid} />
				{/snippet}
			</Field>
			<Field id="nova-palestra-horario" label="Horário" errors={errors.horario} class="tablet:col-span-2">
				{#snippet control({ describedBy, invalid })}
					<TextInput
						id="nova-palestra-horario"
						name="horario"
						type="time"
						required
						bind:value={horario}
						oninput={() => (timeEdited = true)}
						aria-describedby={describedBy}
						aria-invalid={invalid} />
				{/snippet}
			</Field>
			<Field id="nova-palestra-local" label="Local" errors={errors.local} class="tablet:col-span-6">
				{#snippet control({ describedBy, invalid })}
					<TextInput
						id="nova-palestra-local"
						name="local"
						type="text"
						bind:value={local}
						aria-describedby={describedBy}
						aria-invalid={invalid} />
				{/snippet}
			</Field>
			<Field
				id="nova-palestra-reuniao-com"
				label="Reunião com"
				help="Uma atividade por linha"
				errors={errors.reuniaoCom}
				class="tablet:col-span-6">
				{#snippet control({ describedBy, invalid })}
					<TextArea
						id="nova-palestra-reuniao-com"
						name="reuniaoCom"
						rows={MEETING_ACTIVITIES_ROWS}
						bind:value={reuniaoCom}
						aria-describedby={describedBy}
						aria-invalid={invalid} />
				{/snippet}
			</Field>
		</div>
		{#if formError}
			<ErrorMessage class="mt-4" role="alert">{formError}</ErrorMessage>
		{/if}
		<ButtonGroup class="mt-6">
			<Button type="submit" tone="primary" bold loading={saving}>
				<i class="fa-solid fa-check fa-fw" aria-hidden="true"></i>Criar palestra
			</Button>
			<Button type="button" onclick={close}>Cancelar</Button>
		</ButtonGroup>
	</Card>
{:else}
	<Button
		{@attach restoreFocus && focusOnMount}
		type="button"
		tone="primary"
		bold
		class="tablet:self-start"
		onclick={start}>
		<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Nova palestra
	</Button>
{/if}
