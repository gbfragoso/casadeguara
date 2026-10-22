<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import { FIELD_WIDTHS, type FieldWidth } from '#lib/components/layout/field-widths.js';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	type ContactFieldName =
		'email' | 'celular' | 'telefone' | 'logradouro' | 'bairro' | 'complemento' | 'cidade' | 'cep';
	type ContactField = Pick<HTMLInputAttributes, 'autocomplete' | 'inputmode'> & {
		name: ContactFieldName;
		label: string;
		maxlength: number;
		type?: 'email';
		width?: FieldWidth;
	};
	type IdentifierField = { name: 'rg' | 'cpf'; label: string; maxlength: number; registered: string };
	type RemovalField = { name: 'removeRg' | 'removeCpf'; label: string };

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let leitor = $derived(data.leitor);
	let statusChecked = $derived(
		form?.values?.status === 'true' || (form?.values?.status === undefined && leitor.status),
	);
	let workerChecked = $derived(form?.values?.trab === 'true' || (form?.values?.trab === undefined && leitor.trab));
	let identifierFields: [IdentifierField, RemovalField][] = $derived([
		[
			{
				name: 'rg',
				label: 'Novo RG',
				maxlength: 12,
				registered: `RG cadastrado: ${leitor.rgMask ?? 'Não informado.'}`,
			},
			{ name: 'removeRg', label: 'Remover RG cadastrado' },
		],
		[
			{
				name: 'cpf',
				label: 'Novo CPF',
				maxlength: 14,
				registered: `CPF cadastrado: ${leitor.cpfMask ?? 'Não informado.'}`,
			},
			{ name: 'removeCpf', label: 'Remover CPF cadastrado' },
		],
	]);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Leitores', href: resolve('biblioteca/leitores') },
	];
	const contactRows: ContactField[][] = [
		[
			{ name: 'email', label: 'E-mail', maxlength: 60, type: 'email', autocomplete: 'email' },
			{ name: 'celular', label: 'Celular', maxlength: 15, inputmode: 'tel', autocomplete: 'tel-national' },
			{ name: 'telefone', label: 'WhatsApp', maxlength: 15, inputmode: 'tel', autocomplete: 'tel-national' },
		],
		[
			{ name: 'logradouro', label: 'Logradouro', maxlength: 80, autocomplete: 'street-address', width: 'medium' },
			{ name: 'bairro', label: 'Bairro', maxlength: 30, autocomplete: 'address-level3' },
			{ name: 'complemento', label: 'Complemento', maxlength: 100, autocomplete: 'address-line2' },
			{ name: 'cidade', label: 'Cidade', maxlength: 100, autocomplete: 'address-level2' },
			{ name: 'cep', label: 'CEP', maxlength: 9, inputmode: 'numeric', autocomplete: 'postal-code' },
		],
	];
	const errorAttributes = (field: string) =>
		form?.errors?.[field]?.length ? { 'aria-describedby': `${field}-errors`, 'aria-invalid': 'true' as const } : {};
</script>

<PageHeader {breadcrumb}>Atualizar dados do leitor</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Columns class="flex-wrap">
		<Column class={FIELD_WIDTHS.wide}>
			<Field id="nome" label="Nome">
				{#snippet control()}
					<TextInput
						type="text"
						name="nome"
						id="nome"
						value={form?.values?.nome ?? leitor.nome}
						autocomplete="name"
						maxlength={60}
						required
						{...errorAttributes('nome')} />
				{/snippet}
			</Field>
		</Column>
		{#each identifierFields as [identifier, removal] (identifier.name)}
			<Column class={[FIELD_WIDTHS.regular, 'flex flex-col gap-2']}>
				<Field id={identifier.name} label={identifier.label} help={identifier.registered}>
					{#snippet control()}
						<TextInput
							type="text"
							name={identifier.name}
							id={identifier.name}
							value=""
							maxlength={identifier.maxlength}
							inputmode="numeric"
							autocomplete="off"
							{...errorAttributes(identifier.name)} />
					{/snippet}
				</Field>
				<Checkbox
					name={removal.name}
					id={removal.name}
					value="true"
					checked={form?.values?.[removal.name] === 'true'}
					{...errorAttributes(removal.name)}>{removal.label}</Checkbox>
			</Column>
		{/each}
	</Columns>
	{#each contactRows as row, index (index)}
		<Columns class="flex-wrap">
			{#each row as field (field.name)}
				<Column class={FIELD_WIDTHS[field.width ?? 'narrow']}>
					<Field id={field.name} label={field.label}>
						{#snippet control()}
							<TextInput
								type={field.type ?? 'text'}
								name={field.name}
								id={field.name}
								value={form?.values?.[field.name] ?? leitor[field.name] ?? ''}
								maxlength={field.maxlength}
								inputmode={field.inputmode}
								autocomplete={field.autocomplete}
								{...errorAttributes(field.name)} />
						{/snippet}
					</Field>
				</Column>
			{/each}
		</Columns>
	{/each}
	<ChoiceGroup>
		<input type="hidden" name="trab" value="false" />
		<Checkbox name="trab" id="trab" value="true" checked={workerChecked} {...errorAttributes('trab')}
			>Trabalhador</Checkbox>
		<input type="hidden" name="status" value="false" />
		<Checkbox name="status" id="status" value="true" checked={statusChecked} {...errorAttributes('status')}
			>Ativo</Checkbox>
	</ChoiceGroup>
	{#if form?.errors}
		<InlineNotification kind="danger" aria-live="polite">
			<div>
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={`${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		</InlineNotification>
	{/if}
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Atualizar</Button>
	</div>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Leitor atualizado com sucesso!</Notification>
{/if}
