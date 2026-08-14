<script lang="ts">
	import { resolve } from '$app/paths';
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
			<div class="mb-5 pl-1 is-flex is-2 is-justify-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column is-align-items-start">
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria'}>
					<a aria-label="home" title="Página Inicial" href={resolve('/tesouraria')}>
						<i class="fa-solid fa-house fa-fw"></i>&nbsp;<strong>Início</strong>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/entradas'}>
					<a aria-label="entradas" title="Entradas" href={resolve('/tesouraria/entradas')}>
						<i class="fa-solid fa-wallet fa-fw"></i>&nbsp;<strong>Lançamentos</strong>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/saidas'}>
					<a aria-label="saídas" title="Saídas" href={resolve('/tesouraria/saidas')}>
						<i class="fa-solid fa-money-bill-transfer fa-fw"></i>&nbsp;<strong>Despesas</strong>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/estornos'}>
					<a aria-label="estornos" title="Estornos" href={resolve('/tesouraria/estornos')}>
						<i class="fa-solid fa-clock-rotate-left fa-fw"></i>&nbsp;<strong>Estornos</strong>
					</a>
				</li>
				{#if isAdmin}
					<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/caixa'}>
						<a aria-label="caixa" title="Caixa" href={resolve('/tesouraria/caixa')}>
							<i class="fa-solid fa-cash-register fa-fw"></i>&nbsp;<strong>Caixa</strong>
						</a>
					</li>
				{/if}
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/contribuintes'}>
					<a aria-label="contribuintes" title="Contribuintes" href={resolve('/tesouraria/contribuintes')}>
						<i class="fa-solid fa-user fa-fw"></i>&nbsp;<strong>Contribuintes</strong>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/tesouraria/historico'}>
					<a aria-label="historico" title="Histórico" href={resolve('/tesouraria/historico')}>
						<i class="fa-regular fa-rectangle-list fa-fw"></i>&nbsp;<strong>Histórico</strong>
					</a>
				</li>
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1" style="max-width: 100vw !important;">
		<Navbar {username} {userid}></Navbar>
		{@render children?.()}
	</section>
</main>
