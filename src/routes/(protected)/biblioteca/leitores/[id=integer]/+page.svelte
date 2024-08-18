<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ leitor } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/leitores" aria-current="page">Leitor</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">
		Atualizar dados do leitor
	</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="columns">
			<div class="field column is-three-fifths">
				<label class="label" for="nome">Nome</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="nome"
						id="nome"
						value={leitor.nome}
					/>
				</div>
				{#if form?.field === "nome"}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
			<div class="field column">
				<label class="label" for="rg">RG</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="rg"
						id="rg"
						value={leitor.rg}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">CPF</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cpf"
						id="cpf"
						value={leitor.cpf}
					/>
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="email">E-mail</label>
				<div class="control">
					<input
						class="input"
						type="email"
						name="email"
						id="email"
						value={leitor.email}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="celular">Celular</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="celular"
						id="celular"
						value={leitor.celular}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="telefone">Whatsapp</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="telefone"
						id="telefone"
						value={leitor.telefone}
					/>
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column is-half">
				<label class="label" for="logradouro">Logradouro</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="logradouro"
						id="logradouro"
						value={leitor.logradouro}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="bairro">Bairro</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="bairro"
						id="bairro"
						value={leitor.bairro}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="complemento">Complemento</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="complemento"
						id="complemento"
						value={leitor.complemento}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cidade">Cidade</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cidade"
						id="cidade"
						value={leitor.cidade}
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cep">CEP</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cep"
						id="cep"
						value={leitor.cep}
					/>
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<label for="trab" class="checkbox">
				<input
					type="checkbox"
					name="trab"
					id="trab"
					checked={leitor.trab}
				/>
				Trabalhador
			</label>
			<label for="status" class="checkbox">
				<input
					type="checkbox"
					name="status"
					id="status"
					checked={leitor.status}
				/>
				Ativo
			</label>
		</div>
		<div class="control">
			<button class="button is-primary px-5" type="submit"
				>Atualizar</button
			>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Leitor atualizado com sucesso!</p>
	</div>
{/if}
