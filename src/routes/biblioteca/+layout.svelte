<main class="wrapper container-fluid">
	<aside class="sidemenu">
		<nav class="is-sticky-above-lg">
			<details open>
				<summary>Movimentação</summary>
				<ul></ul>
			</details>
			<details>
				<summary>Consultas</summary>
				<ul>
					<li><a href="/biblioteca/autores" class="contrast">Autores</a></li>
					<li><a href="/biblioteca/colecoes" class="contrast">Coleções</a></li>
					<li><a href="/biblioteca/editoras" class="contrast">Editoras</a></li>
					<li><a href="/biblioteca/emprestimos?ativos=on" class="contrast">Empréstimos</a></li>
					<li><a href="/biblioteca/leitores" class="contrast">Leitores</a></li>
					<li><a href="/biblioteca/livros" class="contrast">Livros</a></li>
					<li><a href="/biblioteca/keywords" class="contrast">Palavras-chave</a></li>
				</ul>
			</details>
		</nav>
	</aside>
	<section>
		<slot />
	</section>
</main>
