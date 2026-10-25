<script lang="ts">
	import { resolve } from '$app/paths';
	import UserAccountForm from '#lib/components/forms/UserAccountForm.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Usuários', href: resolve('secretaria/usuarios') },
	];
	const roleOptions = [
		{ value: 'secretaria', label: 'Secretaria' },
		{ value: 'secretaria:admin', label: 'Secretaria - Coordenação' },
		{ value: 'tesouraria', label: 'Tesouraria' },
		{ value: 'tesouraria:admin', label: 'Tesouraria - Coordenação' },
	];
</script>

<PageHeader {breadcrumb}>Cadastro de usuários</PageHeader>

<UserAccountForm {form} {roleOptions} user={data.usuario} />
