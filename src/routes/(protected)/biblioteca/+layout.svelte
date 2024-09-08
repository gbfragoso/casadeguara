<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';
	export let data: LayoutServerData;

	let open = true;
	$: ({ name } = data);
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
					<a href="/biblioteca/autores">
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
				<li class="sidebar-item">
					<a href="/biblioteca/cobrancas">
						<i class="fa-solid fa-envelopes-bulk fa-fw"></i>
						<span class="item-description has-text-weight-bold">Cobranças</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/colecoes">
						<i class="fa-solid fa-layer-group fa-fw"></i>
						<span class="item-description has-text-weight-bold">Coleções</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/editoras">
						<i class="fa-solid fa-landmark-flag fa-fw"></i>
						<span class="item-description has-text-weight-bold">Editoras</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/emprestimos">
						<i class="fa-solid fa-hand-holding fa-fw"></i>
						<span class="item-description has-text-weight-bold">Empréstimos</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/leitores">
						<i class=" fa-solid fa-book-open-reader fa-fw"></i>
						<span class="item-description has-text-weight-bold">Leitores</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/livros">
						<i class="fa-solid fa-book fa-fw"></i>
						<span class="item-description has-text-weight-bold">Livros</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/biblioteca/keywords">
						<i class="fa-solid fa-key fa-fw"></i>
						<span class="item-description has-text-weight-bold">Palavras-chave</span>
					</a>
				</li>
			</ul>
			<button id="sidebar-button" class="is-hidden-mobile" on:click={() => (open = !open)}>
				<i id="sidebar-button-icon" class="fa-solid fa-chevron-right fa-fw"></i>
			</button>
		</div>
		<div id="logout">
			<form action="/logout" method="POST" use:enhance>
				<button id="logout-button">
					<i class="fa-solid fa-right-from-bracket fa-fw"></i>
					<span class="item-description has-text-weight-bold">Sair</span>
				</button>
			</form>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<slot />
	</section>
</main>
