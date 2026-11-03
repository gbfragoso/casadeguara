<script lang="ts">
	import { resolve } from '$app/paths';
	import UserAccountForm from '#lib/components/forms/UserAccountForm.svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let { usuario } = $derived(data);
	let breadcrumb = $derived([
		{ label: 'Módulos', href: resolve('sistemas') },
		{ label: 'Usuários', href: resolve('usuarios') },
		{ label: usuario.name, href: resolve('/(protected)/usuarios/[id=alphanumeric]', { id: usuario.id }) },
	]);
</script>

<main>
	<Section class="mx-auto max-w-2xl">
		<PageHeader {breadcrumb}>Editar usuário</PageHeader>

		<UserAccountForm {form} user={usuario} />
	</Section>
</main>
