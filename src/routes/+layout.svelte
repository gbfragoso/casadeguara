<script lang="ts">
	import '../app.css';
	import '@picocss/pico/css/pico.min.css';
	import '@picocss/pico/css/pico.colors.min.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<header>
	<div class="container-fluid">
		<nav>
			<ul>
				<li><strong>Casa de Guará</strong></li>
			</ul>
			<ul>
				<li><a href="/biblioteca" class="contrast">Biblioteca</a></li>
				<li><a href="/financeiro" class="contrast">Financeiro</a></li>
			</ul>
		</nav>
	</div>
</header>

<slot />
