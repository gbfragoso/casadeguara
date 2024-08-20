<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<div class="card container mt-6 mx-auto">
	<div class="card-content">
		<h1 class="is-size-3 has-text-weight-semibold">Cadastrar</h1>
		<form method="post" use:enhance>
			<div class="field">
				<label class="label" for="username">Usuário</label>
				<div class="control">
					<input class="input" name="username" id="username" />
				</div>
			</div>
			<div class="field">
				<label class="label" for="password">Senha</label>
				<div class="control">
					<input
						class="input"
						type="password"
						name="password"
						id="password"
					/><br />
				</div>
			</div>
			<div class="field is-grouped">
				<div class="control">
					<button class="button  is-primary has-text-weight-semibold">Continuar</button>
				</div>
			</div>
		</form>
	</div>
</div>
