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
	import type { ColumnSize } from '#lib/components/layout/column-sizes.js';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	type TextFieldName = Exclude<keyof ReturnType<typeof getValues>, 'trab' | 'status'>;
	type ReaderField = Pick<HTMLInputAttributes, 'autocomplete' | 'inputmode'> & {
		name: TextFieldName;
		label: string;
		maxlength: number;
		type?: 'email';
		required?: boolean;
		size?: ColumnSize;
	};

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	const getValues = () => ({
		nome: form?.values?.nome ?? '',
		rg: form?.values?.rg ?? '',
		cpf: form?.values?.cpf ?? '',
		email: form?.values?.email ?? '',
		celular: form?.values?.celular ?? '',
		telefone: form?.values?.telefone ?? '',
		logradouro: form?.values?.logradouro ?? '',
		bairro: form?.values?.bairro ?? '',
		complemento: form?.values?.complemento ?? '',
		cidade: form?.values?.cidade ?? '',
		cep: form?.values?.cep ?? '',
		trab: form?.values?.trab === 'true',
		status: form?.values?.status !== 'false',
	});
	let values = $state(getValues());
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Leitores', href: resolve('biblioteca/leitores') },
	];
	const fieldRows: ReaderField[][] = [
		[
			{ name: 'nome', label: 'Nome', maxlength: 60, autocomplete: 'name', required: true, size: 'three-fifths' },
			{ name: 'rg', label: 'RG', maxlength: 12, inputmode: 'numeric', autocomplete: 'off' },
			{ name: 'cpf', label: 'CPF', maxlength: 14, inputmode: 'numeric', autocomplete: 'off' },
		],
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

<PageHeader {breadcrumb} icon="fa-solid fa-book-open-reader">Cadastrar leitor</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	{#each fieldRows as row, index (index)}
		<Columns>
			{#each row as field (field.name)}
				<Column size={field.size}>
					<Field id={field.name} label={field.label}>
						{#snippet control()}
							<TextInput
								type={field.type ?? 'text'}
								name={field.name}
								id={field.name}
								bind:value={values[field.name]}
								maxlength={field.maxlength}
								inputmode={field.inputmode}
								autocomplete={field.autocomplete}
								required={field.required}
								{...errorAttributes(field.name)} />
						{/snippet}
					</Field>
				</Column>
			{/each}
		</Columns>
	{/each}
	<ChoiceGroup>
		<input type="hidden" name="trab" value="false" />
		<Checkbox name="trab" id="trab" value="true" bind:checked={values.trab} {...errorAttributes('trab')}
			>Trabalhador</Checkbox>
		<input type="hidden" name="status" value="false" />
		<Checkbox name="status" id="status" value="true" bind:checked={values.status} {...errorAttributes('status')}
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
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold">Cadastrar</Button>
	</div>
</Card>

{#if form?.status === 201}
	<Notification kind="success">Leitor cadastrado com sucesso!</Notification>
{/if}
