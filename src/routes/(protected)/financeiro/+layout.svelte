<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutServerData } from './$types';
	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { isAdmin, username, userid } = $derived(data);
</script>

<main class="is-flex">
	<nav id="sidebar" class="is-flex is-flex-direction-column is-justify-content-space-between is-hidden-touch">
		<div class="p-3">
			<div class="mb-5 is-flex is-2 is-align-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column">
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro'}>
					<a aria-label="home" title="Página Inicial" href="/financeiro">
						<i class="fa-solid fa-house fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/entradas'}>
					<a aria-label="entradas" title="Entradas" href="/financeiro/entradas">
						<i class="fa-solid fa-wallet fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/saidas'}>
					<a aria-label="saídas" title="Saídas" href="/financeiro/saidas">
						<i class="fa-solid fa-money-bill-transfer fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/estornos'}>
					<a aria-label="estornos" title="Estornos" href="/financeiro/estornos">
						<i class="fa-solid fa-clock-rotate-left fa-fw"></i>
					</a>
				</li>
				{#if isAdmin}
					<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/caixa'}>
						<a aria-label="caixa" title="Caixa" href="/financeiro/caixa">
							<i class="fa-solid fa-file-invoice-dollar fa-fw"></i>
						</a>
					</li>
				{/if}
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/contribuintes'}>
					<a aria-label="contribuintes" title="Contribuintes" href="/financeiro/contribuintes">
						<i class="fa-solid fa-user fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/historico'}>
					<a aria-label="historico" title="Histórico" href="/financeiro/historico">
						<i class="fa-regular fa-rectangle-list fa-fw"></i>
					</a>
				</li>
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<Navbar {username} {userid}></Navbar>
		{@render children?.()}
	</section>
</main>
