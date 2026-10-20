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
				<li class={['sidebar-item', page.url.pathname === '/biblioteca' && 'active']}>
					<a
						aria-current={toAriaCurrent(page.url.pathname === '/biblioteca')}
						aria-label="home"
						title="Página inicial"
						href={resolve('biblioteca')}>
						<i class="fa-solid fa-house fa-fw"></i>&nbsp;<strong>Início</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/autores') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/autores'))}
						aria-label="autores"
						title="Autores"
						href={resolve('biblioteca/autores')}>
						<i class="fa-solid fa-user-pen fa-fw"></i>&nbsp;<strong>Autores</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/avisos') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/avisos'))}
						aria-label="avisos"
						title="Avisos"
						href={resolve('biblioteca/avisos')}>
						<i class="fa-solid fa-inbox fa-fw"></i>&nbsp;<strong>Avisos</strong>
					</a>
				</li>
				{#if isAdmin}
					<li class={['sidebar-item', isSectionActive('/biblioteca/cobrancas') && 'active']}>
						<a
							aria-current={toAriaCurrent(isSectionActive('/biblioteca/cobrancas'))}
							aria-label="cobranças"
							title="Cobranças"
							href={resolve('biblioteca/cobrancas')}>
							<i class="fa-solid fa-envelopes-bulk fa-fw"></i>&nbsp;<strong>Cobranças</strong>
						</a>
					</li>
				{/if}
				<li class={['sidebar-item', isSectionActive('/biblioteca/colecoes') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/colecoes'))}
						aria-label="coleções"
						title="Coleções"
						href={resolve('biblioteca/colecoes')}>
						<i class="fa-solid fa-layer-group fa-fw"></i>&nbsp;<strong>Coleções</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/editoras') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/editoras'))}
						aria-label="editoras"
						title="Editoras"
						href={resolve('biblioteca/editoras')}>
						<i class="fa-solid fa-landmark-flag fa-fw"></i>&nbsp;<strong>Editoras</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/emprestimos') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/emprestimos'))}
						aria-label="empréstimos"
						title="Empréstimos"
						href={resolve('biblioteca/emprestimos')}>
						<i class="fa-solid fa-hand-holding fa-fw"></i>&nbsp;<strong>Empréstimos</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/leitores') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/leitores'))}
						aria-label="leitores"
						title="Leitores"
						href={resolve('biblioteca/leitores')}>
						<i class=" fa-solid fa-book-open-reader fa-fw"></i>&nbsp;<strong>Leitores</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/livros') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/livros'))}
						aria-label="livros"
						title="Livros"
						href={resolve('biblioteca/livros')}>
						<i class="fa-solid fa-book fa-fw"></i>&nbsp;<strong>Livros</strong>
					</a>
				</li>
				<li class={['sidebar-item', isSectionActive('/biblioteca/keywords') && 'active']}>
					<a
						aria-current={toAriaCurrent(isSectionActive('/biblioteca/keywords'))}
						aria-label="keywords"
						title="Palavras-chave"
						href={resolve('biblioteca/keywords')}>
						<i class="fa-solid fa-key fa-fw"></i>&nbsp;<strong>Palavras-chave</strong>
					</a>
				</li>
				{#if isAdmin}
					<li class={['sidebar-item', isSectionActive('/biblioteca/usuarios') && 'active']}>
						<a
							aria-current={toAriaCurrent(isSectionActive('/biblioteca/usuarios'))}
							aria-label="usuários"
							title="Usuários"
							href={resolve('biblioteca/usuarios')}>
							<i class="fa-solid fa-user-plus fa-fw"></i>&nbsp;<strong>Usuários</strong>
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
