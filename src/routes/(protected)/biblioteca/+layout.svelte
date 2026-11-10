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
			href: resolve('biblioteca'),
			label: 'Início',
			icon: 'fa-solid fa-house',
			match: 'exact',
		},
		{
			href: resolve('biblioteca/autores'),
			label: 'Autores',
			icon: 'fa-solid fa-user-pen',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/avisos'),
			label: 'Avisos',
			icon: 'fa-solid fa-inbox',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/cobrancas'),
			label: 'Cobranças',
			icon: 'fa-solid fa-envelopes-bulk',
			match: 'prefix',
			adminOnly: true,
		},
		{
			href: resolve('biblioteca/colecoes'),
			label: 'Coleções',
			icon: 'fa-solid fa-layer-group',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/editoras'),
			label: 'Editoras',
			icon: 'fa-solid fa-landmark-flag',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/emprestimos'),
			label: 'Empréstimos',
			icon: 'fa-solid fa-hand-holding',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/leitores'),
			label: 'Leitores',
			icon: 'fa-solid fa-book-open-reader',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/livros'),
			label: 'Livros',
			icon: 'fa-solid fa-book',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/keywords'),
			label: 'Palavras-chave',
			icon: 'fa-solid fa-key',
			match: 'prefix',
		},
	];
</script>

<ModuleShell
	{items}
	moduleName="Biblioteca"
	isAdmin={data.isAdmin}
	username={data.username}
	userid={data.userid}
	canManageUsers={data.canManageUsers}>
	{@render children()}
</ModuleShell>
