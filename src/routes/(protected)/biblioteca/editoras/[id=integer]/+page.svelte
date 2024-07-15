<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ editora } = data);
</script>

<form action="?/update" method="POST">
	<input type="text" name="nome" id="nome" value={editora.nome} />
	<button>Atualizar</button>
</form>
