<script lang="ts">
	import { page } from '$app/stores';
</script>

<main>
	<section class="section">
		<div class="container card mt-6" style="max-width:400px">
			<div class="card-content">
				<div class="is-primary">
					<p class="pb-3 is-size-3 has-text-weight-semibold has-text-primary has-text-centered">
						{$page.status}
					</p>
				</div>
				<div class="has-text-centered">
					{#if $page.status === 404}
						<p>Página não encontrada</p>
					{:else}
						<p>{$page.error?.message}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>
</main>
