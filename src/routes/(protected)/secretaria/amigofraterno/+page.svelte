<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/secretaria')}>Secretaria</a></li>
			<li class="is-active">
				<a href={resolve('/secretaria/amigofraterno')} aria-current="page">Amigo Fraterno</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Amigo Fraterno</h1>
</div>

<div class="card">
	<div class="card-content">
		<p class="mb-4">
			Revise os participantes antes de gerar os cartões. Altere participantes e fotos em <a
				href={resolve('/secretaria/cadastros')}>Cadastros</a
			>.
		</p>
		<div class="tags are-medium mb-4" aria-live="polite">
			<span class="tag is-primary">Total: {data.total}</span>
			<span class="tag is-warning">Sem foto: {data.withoutPhoto}</span>
		</div>
		{#if data.total === 0}
			<p role="status">Não há participantes elegíveis no momento. Revise os Cadastros para atualizar a lista.</p>
		{:else}
			<form class="mb-4" method="GET" action={resolve('/secretaria/amigofraterno/pdf')}>
				<div class="field">
					<label class="label" for="nextDrawDate">Data do próximo sorteio</label>
					<div class="control">
						<input id="nextDrawDate" class="input" type="date" name="nextDrawDate" required />
					</div>
				</div>
				<button class="button is-primary" type="submit">Baixar cartões em PDF</button>
			</form>
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead><tr><th>Nome</th><th>Foto</th></tr></thead>
					<tbody>
						{#each data.participants as participant (participant.id)}
							<tr
								><td>{participant.name}</td><td>{participant.hasPhoto ? 'Cadastrada' : 'Pendente'}</td
								></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
