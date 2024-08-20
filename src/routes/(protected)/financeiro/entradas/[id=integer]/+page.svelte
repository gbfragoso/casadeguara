<script lang="ts">
	import dayjs from "dayjs";
	import utc from "dayjs/plugin/utc";
	import type { PageServerData, ActionData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;

	$: ({ entrada } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a data-sveltekit-reload href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a data-sveltekit-reload href="/financeiro/entradas" aria-current="page">Entradas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">
		Atualizar os dados da doação
	</h1>
</div>

<form class="card" action="?/update" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					id="descricao"
					value="{entrada.descricao}"
				/>
				{#if form?.field === "descricao"}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="valor">Valor</label>
				<div class="control">
					<input
						class="input"
						type="number"
						name="valor"
						id="valor"
						value="{entrada.valor}"
						step=".01"
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="data_entrada"
					>Data do recebimento</label
				>
				<div class="control">
					<input
						class="input"
						type="date"
						name="data_entrada"
						value={dayjs
							.utc(entrada.data_entrada)
							.format("YYYY-MM-DD")}
					/>
				</div>
			</div>
		</div>
		<div class="field">
			<div class="control">
				<button class="button  is-primary has-text-weight-semibold" type="submit"
					>Atualizar</button
				>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Doação atualizada com sucesso!</p>
	</div>
{/if}
