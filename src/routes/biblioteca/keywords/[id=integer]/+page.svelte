<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ keyword } = data);
</script>

<form action="?/update" method="POST">
	<input type="text" name="chave" id="chave" value={keyword.chave} />
	<button>Atualizar</button>
</form>
