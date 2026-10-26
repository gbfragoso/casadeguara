<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import ModuleShell from '#lib/components/layout/ModuleShell.svelte';
	import type { ModuleMenuItem } from '#lib/components/navigation/module-menu.js';
	import type { LayoutServerData } from './$types';

	type Props = { data: LayoutServerData; children: Snippet };

	let { data, children }: Props = $props();

	const items: readonly ModuleMenuItem[] = [
		{
			href: resolve('comunicacao/palestras'),
			label: 'Palestras',
			title: 'Palestras',
			ariaLabel: 'palestras',
			icon: 'fa-solid fa-microphone',
			match: 'prefix',
		},
		{
			href: resolve('comunicacao/palestrantes'),
			label: 'Palestrantes',
			title: 'Palestrantes',
			ariaLabel: 'palestrantes',
			icon: 'fa-solid fa-user-tie',
			match: 'prefix',
		},
		{
			href: resolve('comunicacao/usuarios'),
			label: 'Usuários',
			title: 'Usuários',
			ariaLabel: 'usuários',
			icon: 'fa-solid fa-user-plus',
			match: 'prefix',
			adminOnly: true,
		},
	];
</script>

<ModuleShell {items} moduleName="Comunicação" isAdmin={data.isAdmin} username={data.username} userid={data.userid}>
	{@render children()}
</ModuleShell>
