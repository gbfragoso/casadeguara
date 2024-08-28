<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ autores, autoresLivro, role } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li><a href="/biblioteca/livros">Livros</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros/autores" aria-current="page">Autores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de autores</h1>
</div>

<form class="card" action="?/adicionar" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="select is-fullwidth">
				<select name="autor" id="autor" required>
					<option></option>
					{#each autores as autor}
						<option value={autor.idautor}>{autor.nome}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Adicionar</button>
		</div>
	</div>
</form>
{#if autoresLivro && autoresLivro.length > 0}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Nome</th>
						<th class="table-actions">Ações</th>
					</thead>
					<tbody>
						{#each autoresLivro as autor}
							<tr>
								<td>{autor.nome}</td>
								<td>
									{#if role.includes('admin')}
										<div class="field is-grouped">
											<form action="?/excluir&autor={autor.idautor}" method="POST">
												<button>
													<i class="fa-regular fa-trash-can fa-fw"></i>
												</button>
											</form>
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
