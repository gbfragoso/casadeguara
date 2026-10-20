<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Navbar from '#lib/components/navigation/Navbar.svelte';
	import type { LayoutServerData } from './$types';

	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { isAdmin, username, userid } = $derived(data);
	let sidebarExpanded = $state(false);
	const toggleSidebar = () => (sidebarExpanded = !sidebarExpanded);
	const isSectionActive = (path: string) => page.url.pathname.includes(path);
	const toAriaCurrent = (active: boolean) => (active ? 'page' : undefined);
</script>

<main class="is-flex">
	<nav
		id="sidebar"
		data-testid="regiao-menu-lateral"
		class={[
			'is-flex is-flex-direction-column is-justify-content-space-between',
			!sidebarExpanded && 'is-hidden-touch',
		]}>
		<div class="pt-3">
			<div class="mb-5 pl-1 is-flex is-2 is-justify-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column is-align-items-start">
				<li class={['sidebar-item', page.url.pathname === '/tesouraria' && 'active']}>
					<a
						aria-current={toAriaCurrent(page.url.pathname === '/tesouraria')}
						aria-label="home"
						title="Página Inicial"
						href={resolve('tesouraria')}>
						<i class="fa-solid fa-house fa-fw"></i>&nbsp;<strong>Início</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/tesouraria/lancamentos') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/tesouraria/lancamentos'))}
						aria-label="lançamentos"
						title="Lançamentos"
						href={resolve('tesouraria/lancamentos')}>
						<i class="fa-solid fa-wallet fa-fw"></i>&nbsp;<strong>Lançamentos</strong>
					</a>
				</li>
				{#if isAdmin}
					<li class={['sidebar-item', isSectionActive('/tesouraria/estornos') && 'active']}>
						<a
							aria-current={toAriaCurrent(isSectionActive('/tesouraria/estornos'))}
							aria-label="estornos"
							title="Estornos"
							href={resolve('tesouraria/estornos')}>
							<i class="fa-solid fa-clock-rotate-left fa-fw"></i>&nbsp;<strong>Estornos</strong>
						</a>
					</li>
				{/if}
				{#if isAdmin}
					<li class={['sidebar-item', isSectionActive('/tesouraria/caixa') && 'active']}>
						<a
							aria-current={toAriaCurrent(isSectionActive('/tesouraria/caixa'))}
							aria-label="caixa"
							title="Caixa"
							href={resolve('tesouraria/caixa')}>
							<i class="fa-solid fa-cash-register fa-fw"></i>&nbsp;<strong>Caixa</strong>
						</a>
					</li>
				{/if}
				<li class={['sidebar-item', isSectionActive('/tesouraria/contribuintes') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/tesouraria/contribuintes'))}
						aria-label="contribuintes"
						title="Contribuintes"
						href={resolve('tesouraria/contribuintes')}>
						<i class="fa-solid fa-user fa-fw"></i>&nbsp;<strong>Contribuintes</strong>
					</a>
				</li>
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1" style="max-width: 100vw !important;">
		<Navbar {username} {userid} {sidebarExpanded} onToggleSidebar={toggleSidebar}></Navbar>
		{@render children?.()}
	</section>
</main>
