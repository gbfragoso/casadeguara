<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let total;
	$: currentPage = 1;
	$: totalPages = Math.ceil(total / 10) || 1;

	function paginate(newPage: number) {
		let query = new URLSearchParams($page.url.searchParams.toString());
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
			query.set('page', String(newPage));
			goto(`?${query.toString()}`);
		}
	}
</script>

<nav class="is-flex is-flex-direction-row is-justify-content-center" aria-label="pagination">
	<button class="mr-3" on:click|preventDefault={() => paginate(1)}
		><i class="fa-solid fa-angles-left fa-fw"></i></button>
	<button on:click|preventDefault={() => paginate(currentPage - 1)}
		><i class="fa-solid fa-angle-left fa-fw"></i></button>
	<p class="mx-2">Página {currentPage} / {totalPages}</p>
	<button on:click|preventDefault={() => paginate(currentPage + 1)}>
		<i class="fa-solid fa-angle-right fa-fw"></i>
	</button>
	<button class="ml-3" on:click|preventDefault={() => paginate(totalPages)}
		><i class="fa-solid fa-angles-right fa-fw"></i></button>
</nav>
