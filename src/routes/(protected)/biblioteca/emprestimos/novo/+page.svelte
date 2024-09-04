<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ leitores, exemplares } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/emprestimos" aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Novo empréstimo</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="columns">
			<div class="column">
				<label class="label" for="leitor">Leitor</label>
				<div class="select is-fullwidth">
					<select name="leitor" id="leitor" required>
						<option>Selecione um leitor</option>
						{#each leitores as leitor}
							<option value={leitor.idleitor}>{leitor.nome}</option>
						{/each}
					</select>
					{#if form?.field === 'leitor'}
						<p class="help is-danger">{form?.message}</p>
					{/if}
				</div>
			</div>
			<div class="column">
				<label class="label" for="exemplar">Exemplar</label>
				<div class="select is-fullwidth">
					<select name="exemplar" id="exemplar" required>
						<option>Selecione o exemplar</option>
						{#each exemplares as exemplar}
							<option value={exemplar.idexemplar}
								>{exemplar.tombo} - {exemplar.titulo} - Ex: {exemplar.numero}</option>
						{/each}
					</select>
					{#if form?.field === 'exemplar'}
						<p class="help is-danger">{form?.message}</p>
					{/if}
				</div>
			</div>
		</div>
		<div class="control mt-3">
			<button class="button is-primary has-text-weight-semibold" type="submit">Cadastrar</button>
		</div>
	</div>
</form>
