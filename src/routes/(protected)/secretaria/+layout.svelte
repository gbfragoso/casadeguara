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
			title: 'Página Inicial',
			ariaLabel: 'home',
			icon: 'fa-solid fa-house',
			match: 'exact',
		},
		{
			href: resolve('secretaria/frequencia'),
			label: 'Frequência',
			title: 'Frequência',
			ariaLabel: 'frequência',
			icon: 'fa-solid fa-list-check',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/aniversariantes'),
			label: 'Aniversariantes',
			title: 'Aniversariantes',
			ariaLabel: 'aniversariantes',
			icon: 'fa-solid fa-cake-candles',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/cadastros'),
			label: 'Cadastros',
			title: 'Cadastros',
			ariaLabel: 'cadastros',
			icon: 'fa-brands fa-wpforms',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/amigofraterno'),
			label: 'Amigo Fraterno',
			title: 'Amigo Fraterno',
			ariaLabel: 'amigo fraterno',
			icon: 'fa-solid fa-people-group',
			match: 'prefix',
		},
		{
			href: resolve('secretaria/usuarios'),
			label: 'Usuários',
			title: 'Usuários',
			ariaLabel: 'usuários',
			icon: 'fa-solid fa-user-plus',
			match: 'prefix',
			adminOnly: true,
		},
	];
</script>

<ModuleShell {items} moduleName="Secretaria" isAdmin={data.isAdmin} username={data.username} userid={data.userid}>
	{@render children()}
</ModuleShell>
