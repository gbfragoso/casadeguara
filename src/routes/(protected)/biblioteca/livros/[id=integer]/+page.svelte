<script lang="ts">
	import type { PageServerData } from './$types';
	//export let data: PageServerData;

	//$: ({ exemplar } = data);
</script>

<form action="?/update" method="POST">
	<select name="status" id="status">
		<option value="Disponível">Disponível</option>
	</select>
	<button>Atualizar</button>
</form>
