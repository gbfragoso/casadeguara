<script lang="ts">
	import type { LayoutServerData } from './$types';
	export let data: LayoutServerData;

	let open = false;
	let isHidden = true;

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
	$: ({ name, isAdmin } = data);
</script>

<main class="is-flex">
	<nav
		id="sidebar"
		class="is-flex is-flex-direction-column is-justify-content-space-between {open === true ? 'open-sidebar' : ''}">
		<div class="p-3">
			<div class="mb-5 is-flex is-2 is-align-content-center">
				<img
					src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
					id="user-avatar"
					alt="Avatar" />

				<p id="user-info">
					<span class="item-description pl-2 is-size-6">Bem vindo</span>
					<span class="item-description pl-2 is-size-6 has-text-weight-bold">{name}</span>
				</p>
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column">
				<li class="sidebar-item">
					<a href="/biblioteca">
						<i class="fa-solid fa-house fa-fw"></i>
						<span class="item-description has-text-weight-bold">Home</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/autores">
						<i class="fa-solid fa-user-pen fa-fw"></i>
						<span class="item-description has-text-weight-bold">Autores</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/avisos">
						<i class="fa-solid fa-inbox fa-fw"></i>
						<span class="item-description has-text-weight-bold">Avisos</span>
					</a>
				</li>
				{#if isAdmin}
					<li class="sidebar-item">
						<a href="/biblioteca/cobrancas">
							<i class="fa-solid fa-envelopes-bulk fa-fw"></i>
							<span class="item-description has-text-weight-bold">Cobranças</span>
						</a>
					</li>
				{/if}
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/colecoes">
						<i class="fa-solid fa-layer-group fa-fw"></i>
						<span class="item-description has-text-weight-bold">Coleções</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/editoras">
						<i class="fa-solid fa-landmark-flag fa-fw"></i>
						<span class="item-description has-text-weight-bold">Editoras</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/emprestimos">
						<i class="fa-solid fa-hand-holding fa-fw"></i>
						<span class="item-description has-text-weight-bold">Empréstimos</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/leitores">
						<i class=" fa-solid fa-book-open-reader fa-fw"></i>
						<span class="item-description has-text-weight-bold">Leitores</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/livros">
						<i class="fa-solid fa-book fa-fw"></i>
						<span class="item-description has-text-weight-bold">Livros</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a data-sveltekit-reload href="/biblioteca/keywords">
						<i class="fa-solid fa-key fa-fw"></i>
						<span class="item-description has-text-weight-bold">Palavras-chave</span>
					</a>
				</li>
			</ul>
			<button aria-label="sidebar" id="sidebar-button" class="is-hidden-mobile" on:click={() => (open = !open)}>
				<i id="sidebar-button-icon" class="fa-solid fa-chevron-right fa-fw"></i>
			</button>
		</div>
		<div id="logout">
			<form action="/logout" method="POST">
				<button id="logout-button">
					<i class="fa-solid fa-right-from-bracket fa-fw"></i>
					<span class="item-description has-text-weight-bold">Sair</span>
				</button>
			</form>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<button
			class="mb-2 navbar-burger {isHidden ? '' : 'is-active'}"
			style="background-color: white"
			aria-label="menu"
			aria-expanded="false"
			on:click={showMenu}>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
		</button>
		<slot />
	</section>
</main>
