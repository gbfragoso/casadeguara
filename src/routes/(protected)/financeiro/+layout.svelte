<script lang="ts">
	import { page } from '$app/stores';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
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
			<div class="mb-5 is-flex is-2 is-align-content-center">
				<img src="/logo.png" id="user-avatar" alt="Avatar" />
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column">
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro'}>
					<a data-sveltekit-reload aria-label="home" title="Página Inicial" href="/financeiro">
						<i class="fa-solid fa-house fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/entradas'}>
					<a data-sveltekit-reload aria-label="entradas" title="Entradas" href="/financeiro/entradas">
						<i class="fa-solid fa-wallet fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/saidas'}>
					<a data-sveltekit-reload aria-label="saídas" title="Saídas" href="/financeiro/saidas">
						<i class="fa-solid fa-money-bill-transfer fa-fw"></i>
					</a>
				</li>
				<li class="sidebar-item" class:active={$page.url.pathname === '/financeiro/contribuntes'}>
					<a
						data-sveltekit-reload
						aria-label="contribuintes"
						title="Contribuintes"
						href="/financeiro/contribuintes">
						<i class="fa-solid fa-user fa-fw"></i>
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
			class="mb-2 navbar-burger {isHidden ? '' : 'is-active'}"
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
