<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhanceForm } from '$lib/forms/enhancer.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { emprestimos } = $derived(data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/emprestimos')} aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Empréstimos em atraso</h1>
</div>

<div id="printable-content" class="card notranslate" translate="no">
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
						{#each item as emprestimo (emprestimo.idemp)}
							{@const dueDate = dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}
							<tr>
								<td>
									<a
										href={resolve('/(protected)/biblioteca/leitores/[id=integer]', {
											id: `${emprestimo.idleitor}`,
										})}>
										{emprestimo.leitor}
									</a>
								</td>
								<td>{emprestimo.titulo}</td>
								<td>{emprestimo.numero}</td>
								<td>{dueDate}</td>
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
											<form action="?/whatsapp" method="POST" {@attach enhanceForm}>
												<input type="hidden" name="id" value={emprestimo.idemp} />
												<input type="hidden" name="leitor" value={emprestimo.leitor} />
												<input type="hidden" name="titulo" value={emprestimo.titulo} />
												<input type="hidden" name="telefone" value={emprestimo.telefone} />
												<input type="hidden" name="prazo" value={dueDate} />
												<button aria-label="Whatsapp" title="Whatsapp" class="control"
													><i class="fa-brands fa-whatsapp fa-fw"></i></button>
											</form>
										{/if}
										{#if emprestimo.celular}
											<form action="?/whatsapp" method="POST" {@attach enhanceForm}>
												<input type="hidden" name="id" value={emprestimo.idemp} />
												<input type="hidden" name="leitor" value={emprestimo.leitor} />
												<input type="hidden" name="titulo" value={emprestimo.titulo} />
												<input type="hidden" name="telefone" value={emprestimo.celular} />
												<input type="hidden" name="prazo" value={dueDate} />
												<button aria-label="Whatsapp" title="Whatsapp" class="control"
													><i class="fa-brands fa-whatsapp fa-fw"></i></button>
											</form>
										{/if}
										{#if emprestimo.email}
											<form action="?/email" method="POST" {@attach enhanceForm}>
												<input type="hidden" name="id" value={emprestimo.idemp} />
												<input type="hidden" name="leitor" value={emprestimo.leitor} />
												<input type="hidden" name="titulo" value={emprestimo.titulo} />
												<input type="hidden" name="email" value={emprestimo.email} />
												<input type="hidden" name="prazo" value={dueDate} />
												<button aria-label="Whatsapp" title="Whatsapp" class="control"
													><i class="fa-regular fa-envelope fa-fw"></i></button>
											</form>
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
