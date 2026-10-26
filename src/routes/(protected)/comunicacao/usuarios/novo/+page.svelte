<script lang="ts">
	import { resolve } from '$app/paths';
	import UserAccountForm from '#lib/components/forms/UserAccountForm.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Usuários', href: resolve('comunicacao/usuarios') },
	];
	const roleOptions = [
		{ value: 'comunicacao', label: 'Comunicação - Voluntário' },
		{ value: 'comunicacao:admin', label: 'Comunicação - Coordenação' },
	];
</script>

<PageHeader {breadcrumb}>Cadastro de usuários</PageHeader>

<UserAccountForm {form} {roleOptions} />
