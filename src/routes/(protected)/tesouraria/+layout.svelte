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
			href: resolve('tesouraria'),
			label: 'Início',
			icon: 'fa-solid fa-house',
			match: 'exact',
		},
		{
			href: resolve('tesouraria/lancamentos'),
			label: 'Lançamentos',
			icon: 'fa-solid fa-wallet',
			match: 'prefix',
		},
		{
			href: resolve('tesouraria/estornos'),
			label: 'Estornos',
			icon: 'fa-solid fa-clock-rotate-left',
			match: 'prefix',
			adminOnly: true,
		},
		{
			href: resolve('tesouraria/caixa'),
			label: 'Caixa',
			icon: 'fa-solid fa-cash-register',
			match: 'prefix',
			adminOnly: true,
		},
		{
			href: resolve('tesouraria/contribuintes'),
			label: 'Contribuintes',
			icon: 'fa-solid fa-user',
			match: 'prefix',
		},
	];
</script>

<ModuleShell
	{items}
	moduleName="Tesouraria"
	isAdmin={data.isAdmin}
	username={data.username}
	userid={data.userid}
	canManageUsers={data.canManageUsers}>
	{@render children()}
</ModuleShell>
