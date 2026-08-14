<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}
	type ModulePath = '/biblioteca' | '/secretaria' | '/tesouraria';

	let { data }: Props = $props();
	let { roles } = $derived(data);
	const modules: Array<{ role: string; path: ModulePath }> = [
		{ role: 'biblioteca', path: '/biblioteca' },
		{ role: 'secretaria', path: '/secretaria' },
		{ role: 'tesouraria', path: '/tesouraria' },
	];
	let availableModules = $derived(
		modules.filter((module) => roles.some((role) => role.replace(':admin', '') === module.role)),
	);
</script>

<main>
	<section class="section">
		<div class="container card mt-6" style="max-width:400px">
			<div class="card-content">
				<div class="has-text-centered">
					<p class="is-size-4 mb-6">Selecione o módulo</p>
					<div class="is-flex is-flex-direction-column">
						{#each availableModules as module (module.role)}
							<a class="button has-text-weight-semibold mb-2" href={resolve(module.path)}
								>{module.role}</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
