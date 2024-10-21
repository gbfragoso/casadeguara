<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutServerData } from './$types';
	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { isAdmin } = $derived(data);
	let isHidden = $state(true);

	function showMenu() {
		let menu = document.getElementById('sidebar');
		if (menu) {
			if (menu.classList.contains('is-hidden-touch')) {
				menu.classList.remove('is-hidden-touch');
				isHidden = false;
			} else {
				menu.classList.add('is-hidden-touch');
				isHidden = true;
			}
		}
	}
</script>

<main class="is-flex">
	<nav id="sidebar" class="is-flex is-flex-direction-column is-justify-content-space-between is-hidden-touch">
		<div class="p-3">
			<div class="mb-5 pl-1 is-flex is-2 is-align-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column is-align-content-center">
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca'}>
					<a aria-label="home" title="Página inicial" href="/biblioteca">
						<i class="fa-solid fa-house fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/autores'}>
					<a aria-label="autores" title="Autores" href="/biblioteca/autores">
						<i class="fa-solid fa-user-pen fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/avisos'}>
					<a aria-label="avisos" title="Avisos" href="/biblioteca/avisos">
						<i class="fa-solid fa-inbox fa-fw"></i>
					</a>
				</li>
				{#if isAdmin}
					<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/cobrancas'}>
						<a aria-label="cobranças" title="Cobranças" href="/biblioteca/cobrancas">
							<i class="fa-solid fa-envelopes-bulk fa-fw"></i>
						</a>
					</li>
				{/if}
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/colecoes'}>
					<a aria-label="coleções" title="Coleções" href="/biblioteca/colecoes">
						<i class="fa-solid fa-layer-group fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/editoras'}>
					<a aria-label="editoras" title="Editoras" href="/biblioteca/editoras">
						<i class="fa-solid fa-landmark-flag fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/emprestimos'}>
					<a aria-label="empréstimos" title="Empréstimos" href="/biblioteca/emprestimos">
						<i class="fa-solid fa-hand-holding fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/leitores'}>
					<a aria-label="leitores" title="Leitores" href="/biblioteca/leitores">
						<i class=" fa-solid fa-book-open-reader fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/livros'}>
					<a aria-label="livros" title="Livros" href="/biblioteca/livros">
						<i class="fa-solid fa-book fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/biblioteca/keywords'}>
					<a aria-label="keywords" title="Palavras-chave" href="/biblioteca/keywords">
						<i class="fa-solid fa-key fa-fw"></i>
					</a>
				</li>
			</ul>
		</div>
		<div id="logout" class="has-text-centered">
			<form action="/logout" method="POST">
				<button aria-label="sair" id="logout-button">
					<i class="fa-solid fa-right-from-bracket fa-fw"></i>
				</button>
			</form>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<button
			class="mb-2 navbar-burger"
			class:is-active={!isHidden}
			style="background-color: white"
			aria-label="menu"
			aria-expanded="false"
			onclick={showMenu}>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
		</button>
		{@render children?.()}
	</section>
</main>
