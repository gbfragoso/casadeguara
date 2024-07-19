<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from "./$types";
	export let data: LayoutServerData;

	let open = false;
	$:({ name } = data);
</script>

<main class="is-flex">
	<nav id="sidebar" class="is-flex is-flex-direction-column is-justify-content-space-between {open === true? 'open-sidebar' : ''}">
		<div class="p-3">
			<div class="mb-5 is-flex is-2 is-align-content-center">
				<img
					src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
					id="user-avatar"
					alt="Avatar"
				/>

				<p id="user-info">
					<span class="item-description pl-2 is-size-6">Bem vindo</span>
					<span class="item-description pl-2 is-size-6 has-text-weight-bold">{name}</span>
				</p>
			</div>
			<ul id="sidebar-list" class="is-flex is-flex-direction-column">
				<li class="sidebar-item">
					<a href="/financeiro/entradas">
						<i class="fa-solid fa-wallet fa-fw"></i>
						<span class="item-description">Entradas</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/financeiro/saidas">
						<i class="fa-solid fa-money-bill-transfer fa-fw"></i>
						<span class="item-description">Saídas</span>
					</a>
				</li>
				<li class="sidebar-item">
					<a href="/financeiro/contribuintes">
						<i class="fa-solid fa-user fa-fw"></i>
						<span class="item-description">Contribuintes</span>
					</a>
				</li>
			</ul>
			<button id="sidebar-button" class="is-hidden-mobile" on:click={() => open = !open}>
				<i id="sidebar-button-icon" class="fa-solid fa-chevron-right fa-fw"></i>
			</button>
		</div>
		<div id="logout">
			<form action="/logout" method="post" use:enhance>
				<button id="logout-button">
					<i class="fa-solid fa-right-from-bracket fa-fw"></i>
					<span class="item-description">Sair</span>
				</button>
			</form>
		</div>
	</nav>
	<section class="section is-flex-grow-1">
		<slot />
	</section>
</main>
