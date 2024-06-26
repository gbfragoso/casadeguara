<main class="bg-blue-100 bg-opacity-50">
	<nav
		class="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6"
	>
		<ul>
			<li><a href="/financeiro/entradas" class="contrast">Entradas</a></li>
			<li><a href="/financeiro/saidas" class="contrast">Saídas</a></li>
			<li><a href="/financeiro/contribuintes" class="contrast">Contribuintes</a></li>
		</ul>
	</nav>
	<section class="relative md:ml-64">
		<slot />
	</section>
</main>
