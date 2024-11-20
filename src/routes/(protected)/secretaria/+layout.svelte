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
				<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria'}>
					<a aria-label="home" title="Página Inicial" href="/secretaria">
						<i class="fa-solid fa-house fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria/frequencia'}>
					<a aria-label="frequência" title="Frequência" href="/secretaria/frequencia">
						<i class="fa-solid fa-list-check fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria/aniversariantes'}>
					<a aria-label="aniversariantes" title="Aniversariantes" href="/secretaria/aniversariantes">
						<i class="fa-solid fa-cake-candles fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria/trabalhadores'}>
					<a aria-label="trabalhadores" title="Trabalhadores" href="/secretaria/trabalhadores">
						<i class="fa-solid fa-handshake-angle fa-fw"></i>
					</a>
				</li>
				{#if isAdmin}
					<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria/usuarios'}>
						<a aria-label="usuários" title="Usuários" href="/secretaria/usuarios">
							<i class="fa-solid fa-user-plus fa-fw"></i>
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<Navbar {username} {userid}></Navbar>
		{@render children?.()}
	</section>
</main>
