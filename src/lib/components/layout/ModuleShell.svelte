<script lang="ts">
	import type { Snippet } from 'svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import ModuleSidebar from '#lib/components/navigation/ModuleSidebar.svelte';
	import Navbar from '#lib/components/navigation/Navbar.svelte';
	import type { ModuleMenuItem } from '#lib/components/navigation/module-menu.js';

	type Props = {
		items: readonly ModuleMenuItem[];
		isAdmin: boolean;
		username: string;
		userid: string;
		children: Snippet;
	};

	let { items, isAdmin, username, userid, children }: Props = $props();
	let sidebarExpanded = $state(false);
</script>

<main class="flex min-h-dvh">
	<ModuleSidebar {items} {isAdmin} expanded={sidebarExpanded} />
	<section class="min-w-0 flex-1">
		<Navbar {username} {userid} {sidebarExpanded} onToggleSidebar={() => (sidebarExpanded = !sidebarExpanded)} />
		<Section>
			{@render children()}
		</Section>
	</section>
</main>
