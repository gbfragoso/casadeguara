<script lang="ts">
	import { resolve } from '$app/paths';
	let dropdownOpen = $state(false);
	let theme = $state<'light' | 'dark'>('light');

	interface Props {
		username: string;
		userid: string;
		sidebarExpanded: boolean;
		onToggleSidebar: () => void;
	}

	let { username, userid, sidebarExpanded, onToggleSidebar }: Props = $props();

	function changeTheme() {
		if (theme === 'light') {
			theme = 'dark';
		} else {
			theme = 'light';
		}
		document.querySelector('html')?.setAttribute('data-theme', theme);
	}
</script>

<div class="is-flex is-justify-content-space-between is-hidden-print pb-1 pt-2">
	<div>
		<button
			type="button"
			class={['navbar-burger', sidebarExpanded && 'is-active']}
			aria-label="menu"
			aria-expanded={sidebarExpanded}
			onclick={onToggleSidebar}>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
		</button>
	</div>
	<div>
		<button
			aria-label={theme}
			type="button"
			class="is-size-5 mr-2 mb-1"
			data-theme-toggle
			onclick={changeTheme}
			style="width:40px; height:40px;">
			<i class="fa-regular {theme === 'light' ? 'fa-sun' : 'fa-moon'} fa-fw"></i>
		</button>
		<div id="dropdown" class={['dropdown is-right', dropdownOpen && 'is-active']}>
			<div class="dropdown-trigger">
				<button
					class="button is-rounded is-primary mb-1"
					type="button"
					aria-haspopup="true"
					aria-controls="dropdown-menu"
					style="width:40px; height:40px; border-radius: 50%"
					onclick={() => (dropdownOpen = !dropdownOpen)}>
					<span><strong>{username.substring(0, 1).toUpperCase()}</strong></span>
				</button>
			</div>
			<div class="dropdown-menu" id="dropdown-menu" role="menu">
				<div class="dropdown-content">
					<p class="dropdown-item">Bem vindo(a), {username.substring(0, username.indexOf(' '))}</p>
					<hr class="dropdown-divider" />
					<a href={resolve('/(protected)/usuario/[id=alphanumeric]', { id: userid })} class="dropdown-item">
						Configurações
					</a>
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
