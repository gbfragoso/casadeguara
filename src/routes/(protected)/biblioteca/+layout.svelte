<main class="container-fluid columns m-0">
	<aside class="column menu is-2 m-0 ml-6 mt-6 is-hidden-mobile is-fullheigth card">
		<p class="menu-label has-text-weight-semibold secondary-gray">
			Movimentação
		</p>
		<ul class="menu-list">
			<li>
				<a href="/biblioteca/autores">Acervo</a>
			</li>
		</ul>
		<p class="menu-label has-text-weight-semibold secondary-gray">
			Consulta
		</p>
		<ul class="menu-list">
			<li>
				<a href="/biblioteca/autores">Autores</a>
			</li>
			<li>
				<a href="/biblioteca/colecoes">Coleções</a>
			</li>
			<li>
				<a href="/biblioteca/editoras">Editoras</a>
			</li>
			<li>
				<a href="/biblioteca/emprestimos?ativos=on">Empréstimos</a>
			</li>
			<li>
				<a href="/biblioteca/leitores">Leitores</a>
			</li>
			<li>
				<a href="/biblioteca/livros">Livros</a>
			</li>
			<li>
				<a href="/biblioteca/keywords">Palavras-chave</a>
			</li>
		</ul>
	</aside>
	<section class="column section">
		<slot />
	</section>
</main>
