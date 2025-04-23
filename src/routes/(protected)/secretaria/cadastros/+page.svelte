<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);

	function uncheck(id: number) {
		const checkbox = document.getElementById(id.toString()) as HTMLInputElement;
		if (checkbox) {
			fetch(`/api/cadastros?id=${id}&trabalhador=${checkbox.checked}`, {
				method: 'POST',
			}).then((data) => {
				if (data.status === 200) {
					console.log('Sucesso ao atualizar trabalhador');
				} else {
					console.error('Erro ao atualizar trabalhador');
				}
			});
		}
	}
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/cadastros" aria-current="page">Cadastros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de cadastros</h1>
</div>

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome</label>
			<div class="control">
				<input class="input" type="text" name="nome" id="nome" placeholder="Digite o nome" />
			</div>
		</div>
		<div class="field">
			<label class="checkbox">
				<input type="checkbox" name="trabalhadores" id="trabalhadores" />
				Somente trabalhadores
			</label>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/secretaria/cadastros/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.leitores}
	<div class="card">
		<div class="card-content">
			<span class="tag is-warning is-light is-size-5 mb-2"
				>Obs.: Somente os nomes marcados aparecerão na lista de presença</span>
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th style="width:50px"></th>
							<th>Nome</th>
							<th class="table-actions">Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.leitores as leitor}
							<tr>
								<td style="width:50px"
									><input
										type="checkbox"
										name="trab"
										id={leitor.idleitor.toString()}
										checked={leitor.trab}
										onchange={() => uncheck(leitor.idleitor)} /></td>
								<td>{leitor.nome}</td>
								<td class="table-actions">
									<a aria-label="editar" href="/secretaria/cadastros/{leitor.idleitor}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
