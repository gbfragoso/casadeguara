<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ usuario } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/usuarios" aria-current="page">Usuários</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de usuários</h1>
</div>

<form class="card" method="post">
	<div class="card-content">
		<div class="field">
			<label class="label" for="username">Usuário</label>
			<div class="control">
				<input class="input" name="username" id="username" value={usuario.username}/>
			</div>
		</div>
		<div class="field">
			<label class="label" for="password">Senha</label>
			<div class="control">
				<input class="input" type="password" name="password" id="password" />
			</div>
		</div>
		<div class="field">
			<label class="label" for="name">Nome</label>
			<div class="control">
				<input class="input" name="name" id="name" value={usuario.name}/>
			</div>
		</div>
		<label class="label" for="roles">Setor</label>
		<div class="select mb-4">
			<select name="roles" id="roles" value={usuario.roles}>
				<option value="biblioteca">Biblioteca</option>
				<option value="secretaria">Secretaria</option>
				<option value="financeiro">Tesouraria</option>
			</select>
		</div>
		<div class="field">
			<div class="control">
				<button class="button is-primary has-text-weight-semibold">Cadastrar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Usuário cadastrado com sucesso!</p>
	</div>
{/if}
