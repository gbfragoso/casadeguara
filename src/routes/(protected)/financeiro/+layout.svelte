<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutServerData } from './$types';
	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { username, userid } = $derived(data);
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
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/contribuintes'}>
					<a aria-label="contribuintes" title="Contribuintes" href="/financeiro/contribuintes">
						<i class="fa-solid fa-user-plus fa-fw"></i>
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
