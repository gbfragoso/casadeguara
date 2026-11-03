<script lang="ts">
	import { resolve } from '$app/paths';
	import UserAccountForm from '#lib/components/forms/UserAccountForm.svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const breadcrumb = [
		{ label: 'Módulos', href: resolve('sistemas') },
		{ label: 'Usuários', href: resolve('usuarios') },
		{ label: 'Novo usuário', href: resolve('usuarios/novo') },
	];
</script>

<main>
	<Section class="mx-auto max-w-2xl">
		<PageHeader {breadcrumb}>Novo usuário</PageHeader>

		<UserAccountForm {form} />
	</Section>
</main>
