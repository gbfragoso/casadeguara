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
			title: 'Página inicial',
			ariaLabel: 'home',
			icon: 'fa-solid fa-house',
			match: 'exact',
		},
		{
			href: resolve('biblioteca/autores'),
			label: 'Autores',
			title: 'Autores',
			ariaLabel: 'autores',
			icon: 'fa-solid fa-user-pen',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/avisos'),
			label: 'Avisos',
			title: 'Avisos',
			ariaLabel: 'avisos',
			icon: 'fa-solid fa-inbox',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/cobrancas'),
			label: 'Cobranças',
			title: 'Cobranças',
			ariaLabel: 'cobranças',
			icon: 'fa-solid fa-envelopes-bulk',
			match: 'prefix',
			adminOnly: true,
		},
		{
			href: resolve('biblioteca/colecoes'),
			label: 'Coleções',
			title: 'Coleções',
			ariaLabel: 'coleções',
			icon: 'fa-solid fa-layer-group',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/editoras'),
			label: 'Editoras',
			title: 'Editoras',
			ariaLabel: 'editoras',
			icon: 'fa-solid fa-landmark-flag',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/emprestimos'),
			label: 'Empréstimos',
			title: 'Empréstimos',
			ariaLabel: 'empréstimos',
			icon: 'fa-solid fa-hand-holding',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/leitores'),
			label: 'Leitores',
			title: 'Leitores',
			ariaLabel: 'leitores',
			icon: 'fa-solid fa-book-open-reader',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/livros'),
			label: 'Livros',
			title: 'Livros',
			ariaLabel: 'livros',
			icon: 'fa-solid fa-book',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/keywords'),
			label: 'Palavras-chave',
			title: 'Palavras-chave',
			ariaLabel: 'keywords',
			icon: 'fa-solid fa-key',
			match: 'prefix',
		},
		{
			href: resolve('biblioteca/usuarios'),
			label: 'Usuários',
			title: 'Usuários',
			ariaLabel: 'usuários',
			icon: 'fa-solid fa-user-plus',
			match: 'prefix',
			adminOnly: true,
		},
	];
</script>

<ModuleShell {items} isAdmin={data.isAdmin} username={data.username} userid={data.userid}>
	{@render children()}
</ModuleShell>
