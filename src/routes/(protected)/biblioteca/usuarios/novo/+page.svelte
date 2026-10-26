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
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Usuários', href: resolve('biblioteca/usuarios') },
	];
	const roleOptions = [
		{ value: 'biblioteca', label: 'Biblioteca' },
		{ value: 'biblioteca:admin', label: 'Biblioteca - Coordenação' },
	];
</script>

<PageHeader {breadcrumb}>Cadastro de usuários</PageHeader>

<UserAccountForm {form} {roleOptions} />
