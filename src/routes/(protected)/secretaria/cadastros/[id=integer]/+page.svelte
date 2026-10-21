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
	import PhotoSection from '#lib/components/image/PhotoSection.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import type { ColumnSize } from '#lib/components/layout/column-sizes.js';
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
		size?: ColumnSize;
	};
	type IdentifierField = { name: 'rg' | 'cpf'; label: string; maxlength: number; registered: string };
	type RemovalField = { name: 'removeRg' | 'removeCpf'; label: string };

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let trabalhador = $derived(data.trabalhador);
	let photoVersionQuery = $derived(trabalhador.photoVersion ? `?versao=${trabalhador.photoVersion}` : '');
	let photoUrl = $derived(`${resolve(`secretaria/cadastros/${data.id}/foto`)}${photoVersionQuery}`);
	let originalPhotoUrl = $derived(`${resolve(`secretaria/cadastros/${data.id}/foto/original`)}${photoVersionQuery}`);
	let workerChecked = $derived(
		form?.values?.trab === 'true' || (form?.values?.trab === undefined && trabalhador.trab),
	);
	let identifierFields: [IdentifierField, RemovalField][] = $derived([
		[
			{
				name: 'rg',
				label: 'Novo RG',
				maxlength: 12,
				registered: `RG cadastrado: ${trabalhador.rgMask ?? 'Não informado.'}`,
			},
			{ name: 'removeRg', label: 'Remover RG cadastrado' },
		],
		[
			{
				name: 'cpf',
				label: 'Novo CPF',
				maxlength: 14,
				registered: `CPF cadastrado: ${trabalhador.cpfMask ?? 'Não informado.'}`,
			},
			{ name: 'removeCpf', label: 'Remover CPF cadastrado' },
		],
	]);
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Cadastros', href: resolve('secretaria/cadastros') },
	];
	const contactRows: ContactField[][] = [
		[
			{ name: 'email', label: 'E-mail', maxlength: 60, type: 'email', autocomplete: 'email' },
			{ name: 'celular', label: 'Celular', maxlength: 15, inputmode: 'tel', autocomplete: 'tel-national' },
			{ name: 'telefone', label: 'WhatsApp', maxlength: 15, inputmode: 'tel', autocomplete: 'tel-national' },
		],
		[
			{ name: 'logradouro', label: 'Logradouro', maxlength: 80, autocomplete: 'street-address', size: 'half' },
			{ name: 'bairro', label: 'Bairro', maxlength: 30, autocomplete: 'address-level3' },
			{ name: 'complemento', label: 'Complemento', maxlength: 100, autocomplete: 'address-line2' },
			{ name: 'cidade', label: 'Cidade', maxlength: 100, autocomplete: 'address-level2' },
			{ name: 'cep', label: 'CEP', maxlength: 9, inputmode: 'numeric', autocomplete: 'postal-code' },
		],
	];
	const errorAttributes = (field: string) =>
		form?.errors?.[field]?.length ? { 'aria-describedby': `${field}-errors`, 'aria-invalid': 'true' as const } : {};
</script>

<PageHeader {breadcrumb} icon="fa-brands fa-wpforms">Atualizar dados do trabalhador</PageHeader>

<Card
	element="form"
	method="POST"
	action="?/salvarCadastro"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<Columns>
		<Column size="three-fifths">
			<Field id="nome" label="Nome">
				{#snippet control()}
					<TextInput
						type="text"
						name="nome"
						id="nome"
						value={form?.values?.nome ?? trabalhador.nome}
						autocomplete="name"
						maxlength={60}
						required
						{...errorAttributes('nome')} />
				{/snippet}
			</Field>
		</Column>
		{#each identifierFields as [identifier, removal] (identifier.name)}
			<Column class="flex flex-col gap-2">
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
		<Column>
			<Field id="aniversario" label="Aniversário">
				{#snippet control()}
					<TextInput
						type="date"
						name="aniversario"
						id="aniversario"
						value={form?.values?.aniversario ?? trabalhador.aniversario ?? ''}
						{...errorAttributes('aniversario')} />
				{/snippet}
			</Field>
		</Column>
	</Columns>
	{#each contactRows as row, index (index)}
		<Columns>
			{#each row as field (field.name)}
				<Column size={field.size}>
					<Field id={field.name} label={field.label}>
						{#snippet control()}
							<TextInput
								type={field.type ?? 'text'}
								name={field.name}
								id={field.name}
								value={form?.values?.[field.name] ?? trabalhador[field.name] ?? ''}
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
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold">Atualizar</Button>
	</div>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Trabalhador atualizado com sucesso!</Notification>
{/if}

<PhotoSection
	hasPhoto={trabalhador.hasPhoto}
	{photoUrl}
	{originalPhotoUrl}
	alt={`Foto de ${trabalhador.nome}`}
	{form} />
