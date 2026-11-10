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
			href: resolve('secretaria'),
			label: 'Início',
			icon: 'fa-solid fa-house',
			match: 'exact',
		},
		{
			href: resolve('secretaria/frequencia'),
			label: 'Frequência',
			icon: 'fa-solid fa-list-check',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/aniversariantes'),
			label: 'Aniversariantes',
			icon: 'fa-solid fa-cake-candles',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/cadastros'),
			label: 'Cadastros',
			icon: 'fa-brands fa-wpforms',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/amigofraterno'),
			label: 'Amigo Fraterno',
			icon: 'fa-solid fa-people-group',
			match: 'prefix',
		},
	];
</script>

<ModuleShell
	{items}
	moduleName="Secretaria"
	isAdmin={data.isAdmin}
	username={data.username}
	userid={data.userid}
	canManageUsers={data.canManageUsers}>
	{@render children()}
</ModuleShell>
