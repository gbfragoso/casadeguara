<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Navbar from '$lib/components/navigation/Navbar.svelte';
	import type { LayoutServerData } from './$types';
	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { isAdmin, username, userid } = $derived(data);
	let sidebarExpanded = $state(false);
	const toggleSidebar = () => (sidebarExpanded = !sidebarExpanded);
</script>

<main class="is-flex">
	<nav
		id="sidebar"
		class={[
			'is-flex is-flex-direction-column is-justify-content-space-between',
			!sidebarExpanded && 'is-hidden-touch',
		]}>
		<div class="pt-3">
			<div class="mb-5 pl-1 is-flex is-2 is-justify-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column is-align-items-start">
				<li class={['sidebar-item', page.url.pathname === '/secretaria' && 'active']}>
					<a aria-label="home" title="Página Inicial" href={resolve('/secretaria')}>
						<i class="fa-solid fa-house fa-fw"></i>&nbsp<strong>Início</strong>
					</a>
				</li>
				<li class={['sidebar-item', page.url.pathname.includes('/secretaria/frequencia') && 'active']}>
					<a aria-label="frequência" title="Frequência" href={resolve('/secretaria/frequencia')}>
						<i class="fa-solid fa-list-check fa-fw"></i>&nbsp<strong>Frequência</strong>
					</a>
				</li>
				<li class={['sidebar-item', page.url.pathname.includes('/secretaria/aniversariantes') && 'active']}>
					<a
						aria-label="aniversariantes"
						title="Aniversariantes"
						href={resolve('/secretaria/aniversariantes')}>
						<i class="fa-solid fa-cake-candles fa-fw"></i>&nbsp<strong>Aniversariantes</strong>
					</a>
				</li>
				<li class={['sidebar-item', page.url.pathname.includes('/secretaria/cadastros') && 'active']}>
					<a aria-label="cadastros" title="Cadastros" href={resolve('/secretaria/cadastros')}>
						<i class="fa-brands fa-wpforms fa-fw"></i>&nbsp<strong>Cadastros</strong>
					</a>
				</li>
				<li class={['sidebar-item', page.url.pathname.includes('/secretaria/amigofraterno') && 'active']}>
					<a aria-label="amigo fraterno" title="Amigo Fraterno" href={resolve('/secretaria/amigofraterno')}>
						<i class="fa-solid fa-people-group fa-fw"></i>&nbsp<strong>Amigo Fraterno</strong>
					</a>
				</li>
				{#if isAdmin}
					<li class={['sidebar-item', page.url.pathname.includes('/secretaria/usuarios') && 'active']}>
						<a aria-label="usuários" title="Usuários" href={resolve('/secretaria/usuarios')}>
							<i class="fa-solid fa-user-plus fa-fw"></i>&nbsp<strong>Usuários</strong>
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1" style="max-width: 100vw !important;">
		<Navbar {username} {userid} {sidebarExpanded} onToggleSidebar={toggleSidebar}></Navbar>
		{@render children?.()}
	</section>
</main>
