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
				<li class="sidebar-item" class:active={$page.url.pathname === '/secretaria/usuarios'}>
					<a aria-label="usuários" title="Usuários" href="/secretaria/usuarios">
						<i class="fa-solid fa-user fa-fw"></i>
					</a>
				</li>
			</ul>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<div class="is-flex is-flex-direction-row is-justify-content-end">
			<div class="box p-0 px-3 py-2">
				<form action="/logout" method="POST">
					<div class="field is-grouped">
						<button
							type="button"
							class="navbar-burger"
							class:is-active={!isHidden}
							aria-label="menu"
							aria-expanded="false"
							onclick={showMenu}>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
						</button>
						<button
							aria-label="light"
							type="button"
							class="is-size-5 mr-2 pb-1"
							data-theme-toggle
							onclick={() => document.querySelector('html')?.setAttribute('data-theme', 'light')}>
							<i class="fa-regular fa-sun fa-fw"></i>
						</button>
						<button
							aria-label="light"
							type="button"
							data-theme-toggle
							class="is-size-5 mr-2 pb-1"
							onclick={() => document.querySelector('html')?.setAttribute('data-theme', 'dark')}>
							<i class="fa-regular fa-moon fa-fw"></i>
						</button>
						<button class="is-size-5 pb-1" aria-label="sair" type="submit">
							<i class="fa-solid fa-right-from-bracket fa-fw"></i>
						</button>
					</div>
				</form>
			</div>
		</div>
		{@render children?.()}
	</section>
</main>
