<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { afterNavigate } from '$app/navigation';
	import { setModuleName } from '#lib/components/layout/module-context.js';
	import Section from '#lib/components/layout/Section.svelte';
	import ModuleSidebar from '#lib/components/navigation/ModuleSidebar.svelte';
	import Navbar from '#lib/components/navigation/Navbar.svelte';
	import type { ModuleMenuItem } from '#lib/components/navigation/module-menu.js';
	import { DESKTOP_MEDIA_QUERY } from '#lib/styles/breakpoints.js';

	type Props = {
		items: readonly ModuleMenuItem[];
		moduleName: string;
		isAdmin: boolean;
		username: string;
		userid: string;
		canManageUsers: boolean;
		children: Snippet;
	};

	let { items, moduleName, isAdmin, username, userid, canManageUsers, children }: Props = $props();
	const desktopViewport = new MediaQuery(DESKTOP_MEDIA_QUERY, false);
	let sidebarExpanded = $derived.by(() => {
		void desktopViewport.current;
		return false;
	});
	let drawerOpen = $derived(sidebarExpanded && !desktopViewport.current);

	setModuleName(() => moduleName);

	afterNavigate(() => {
		sidebarExpanded = false;
	});
</script>

<a
	href="#conteudo"
	class="sr-only rounded-md border border-divider bg-surface font-medium text-primary-ink shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 print:hidden">
	Pular para o conteúdo
</a>
<div class="flex min-h-dvh">
	<ModuleSidebar {items} {moduleName} {isAdmin} expanded={drawerOpen} onClose={() => (sidebarExpanded = false)} />
	<div class="min-w-0 flex-1">
		<Navbar
			{username}
			{userid}
			{canManageUsers}
			sidebarExpanded={drawerOpen}
			onToggleSidebar={() => (sidebarExpanded = !drawerOpen)} />
		<main id="conteudo" inert={drawerOpen}>
			<Section>
				{@render children()}
			</Section>
		</main>
	</div>
</div>
