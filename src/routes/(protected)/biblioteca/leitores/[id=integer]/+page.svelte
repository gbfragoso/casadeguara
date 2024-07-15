<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ leitor } = data);
</script>

<form action="?/update" method="POST">
	<fieldset>
		<label for="nome">Nome</label>
		<input type="text" name="nome" id="nome" value={leitor.nome} />

		<label for="rg">RG</label>
		<input type="text" name="rg" id="rg" value={leitor.rg} />

		<label for="rg">CPF</label>
		<input type="text" name="cpf" id="cpf" value={leitor.cpf} />

		<label for="email">E-mail</label>
		<input type="text" name="email" id="email" value={leitor.email} />

		<label for="celular">Celular</label>
		<input type="text" name="celular" id="celular" value={leitor.celular} />

		<label for="telefone">Telefone</label>
		<input type="text" name="telefone" id="telefone" value={leitor.telefone} />

		<label for="logradouro">Logradouro</label>
		<input type="text" name="logradouro" id="logradouro" value={leitor.logradouro} />

		<label for="bairro">Bairro</label>
		<input type="text" name="bairro" id="bairro" value={leitor.bairro} />

		<label for="complemento">Complemento</label>
		<input type="text" name="complemento" id="complemento" value={leitor.complemento} />

		<label for="cidade">Cidade</label>
		<input type="text" name="cidade" id="cidade" value={leitor.cidade} />

		<label for="cep">CEP</label>
		<input type="text" name="cep" id="cep" value={leitor.cep} />

		<span>
			<input type="checkbox" name="trab" id="trab" checked={leitor.trab} />Trabalhador
			<input type="checkbox" name="status" id="status" checked={leitor.status} />Ativo
		</span>
	</fieldset>

	<button>Atualizar</button>
</form>
