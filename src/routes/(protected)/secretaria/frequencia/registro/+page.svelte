<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ leitores } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li>
				<a href="/secretaria">Secretaria</a>
			</li>
			<li class="is-active">
				<a href="/secretaria/frequencia" aria-current="page">Frequência</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Registro de frequência</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th></th>
					<th>Nome</th>
				</thead>
				<tbody>
					{#await leitores}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as leitor}
							<tr>
								<td>
									<input type="checkbox" value={leitor.idleitor} name="leitor" id="leitor" checked />
								</td>
								<td>
									{leitor.nome.toUpperCase()}
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
			<div class="field">
				<label class="label" for="dataFim">Data</label>
				<div class="control">
					<input class="input" type="date" name="data" id="data" aria-label="Date" required />
				</div>
			</div>
			<div class="control mt-3">
				<button class="button is-primary has-text-weight-semibold" type="submit">Registrar</button>
			</div>
		</div>
	</div>
</form>
{#if form?.status === 201}
	<Notification class="is-success">Presença registrada com sucesso!</Notification>
{/if}
