<script lang="ts">
	let isHidden = $state(true);
	let theme = $state('light');

	interface Props {
		username: string;
		userid: string;
	}

	let { username, userid }: Props = $props();

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

	function showDropdown() {
		let menu = document.getElementById('dropdown');
		if (menu) {
			if (menu.classList.contains('is-active')) {
				menu.classList.remove('is-active');
			} else {
				menu.classList.add('is-active');
			}
		}
	}

	function changeTheme() {
		if (theme === 'light') {
			theme = 'dark';
		} else {
			theme = 'light';
		}
		document.querySelector('html')?.setAttribute('data-theme', theme);
	}
</script>

<div class="box p-0 px-3 py-2" style="border-radius: 30px">
	<div class="is-flex is-flex-direction-row is-justify-content-end">
		<input class="input pr-4" type="text" name="nome" id="nome" style="border-radius: 30px" />
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
		<button aria-label={theme} type="button" class="is-size-5 mr-2" data-theme-toggle onclick={changeTheme}>
			<i class="fa-regular {theme === 'light' ? 'fa-sun' : 'fa-moon'} fa-fw"></i>
		</button>
		<div id="dropdown" class="dropdown is-right">
			<div class="dropdown-trigger">
				<button
					class="button is-rounded is-primary"
					type="button"
					aria-haspopup="true"
					aria-controls="dropdown-menu"
					style="width:40px; height:40px; border-radius: 50%"
					onclick={showDropdown}>
					<span>{username.substring(0, 1).toUpperCase()}</span>
				</button>
			</div>
			<div class="dropdown-menu" id="dropdown-menu" role="menu">
				<div class="dropdown-content">
					<p class="dropdown-item">Bem vindo, {username.substring(0, username.indexOf(' '))}</p>
					<hr class="dropdown-divider" />
					<a href="/usuario/{userid}" class="dropdown-item"> Configurações </a>
					<hr class="dropdown-divider" />
					<form class="p-0" action="/logout" method="POST">
						<button class="dropdown-item" aria-label="sair" type="submit">
							<i class="fa-solid fa-right-from-bracket fa-fw"></i>Sair
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
