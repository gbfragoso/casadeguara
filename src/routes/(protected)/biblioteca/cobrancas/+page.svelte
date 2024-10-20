<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ emprestimos } = data);
	dayjs.extend(utc);

	function body(leitor: string, titulo: string, data: string) {
		return (
			'Estimado(a) ' +
			leitor +
			',%0D%0AO prazo para devolução do livro ' +
			titulo +
			' expirou em ' +
			data +
			', se possível dirigir-se à biblioteca para regularização.%0D%0A' +
			'Atenciosamente,%0D%0AClébio Fragoso'
		);
	}
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/emprestimos" aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Empréstimos em atraso</h1>
</div>

<div id="printable-content" class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Leitor</th>
						<th>Título</th>
						<th>Ex</th>
						<th>Prazo</th>
						<th>Cobrança</th>
						<th class="table-actions">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#await emprestimos}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as emprestimo}
							<tr>
								<td>
									<a href="/biblioteca/leitores/{emprestimo.idleitor}">
										{emprestimo.leitor}
									</a>
								</td>
								<td>{emprestimo.titulo}</td>
								<td>{emprestimo.numero}</td>
								<td>{dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
								{#if emprestimo.cobranca}
									<td
										><span class="tag is-success"
											>{dayjs.utc(emprestimo.cobranca).format('DD/MM/YYYY')}</span
										></td>
								{:else}
									<td><span class="tag is-warning">Não cobrado</span></td>
								{/if}
								<td class="table-actions">
									<div class="field is-grouped">
										{#if emprestimo.telefone}
											<a
												aria-label="link"
												href="https://wa.me/{emprestimo.telefone}?text={body(
													emprestimo.leitor,
													emprestimo.titulo,
													dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY'),
												).replace('%0D%0A', ' ')}"
												title="Whatsapp"
												target="_blank">
												<i class="fa-brands fa-whatsapp fa-fw"></i>
											</a>
										{/if}
										{#if emprestimo.celular}
											<a
												aria-label="link"
												href="https://wa.me/{emprestimo.celular}?text={body(
													emprestimo.leitor,
													emprestimo.titulo,
													dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY'),
												).replace('%0D%0A', ' ')}"
												title="Celular"
												target="_blank">
												<i class="fa-solid fa-phone fa-fw"></i>
											</a>
										{/if}
										{#if emprestimo.email}
											<a
												aria-label="link"
												href="mailto:{emprestimo.email}?subject=Prazo para devolução expirado&body={body(
													emprestimo.leitor,
													emprestimo.titulo,
													dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY'),
												)}"
												title="Email"
												target="_blank">
												<i class="fa-regular fa-envelope fa-fw"></i>
											</a>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
