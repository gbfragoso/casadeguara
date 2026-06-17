<script lang="ts">
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { roles } = $derived(data);
</script>

<main>
	<section class="section">
		<div class="container card mt-6" style="max-width:400px">
			<div class="card-content">
				<div class="has-text-centered">
					<p class="is-size-4 mb-6">Selecione o módulo</p>
					<div class="is-flex is-flex-direction-column">
						{#each roles as role}
							<a class="button has-text-weight-semibold mb-2" href="/{role.replace(':admin', '')}"
								>{role.replace(':admin', '')}</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
