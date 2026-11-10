<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		INSTITUTION_ADDRESS,
		INSTITUTION_EMAIL,
		INSTITUTION_INSTAGRAM_URL,
		INSTITUTION_NAME,
		INSTITUTION_POSTAL_CODE,
		INSTITUTION_YOUTUBE_URL,
	} from '#lib/brand/institution.js';
	import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
	import { SITE_MENU } from '#lib/site/menu.js';
	import type { SiteIconName } from '#lib/site/site-icons.js';

	import SectionWave from './SectionWave.svelte';
	import SiteIcon from './SiteIcon.svelte';

	const SOCIAL_LINKS: readonly { rotulo: string; href: string; icone: SiteIconName }[] = [
		{ rotulo: 'Instagram', href: INSTITUTION_INSTAGRAM_URL, icone: 'instagram' },
		{ rotulo: 'YouTube', href: INSTITUTION_YOUTUBE_URL, icone: 'youtube' },
	];
</script>

<footer class="relative bg-footer pt-28 pb-14 text-on-primary tablet:pt-36">
	<SectionWave shape="crest" fill="fill-ground" edge="top" />
	<div class="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-16 gap-y-10 px-4 tablet:px-8">
		<div class="max-w-xs">
			<p class="font-display text-2xl font-bold text-balance text-on-primary">{INSTITUTION_NAME}</p>
			<p class="mt-3 text-primary-100">{INSTITUTION_ADDRESS}<br />CEP {INSTITUTION_POSTAL_CODE}</p>
		</div>
		<div>
			<h2 class="font-display text-xl font-bold text-on-primary">Contato</h2>
			<p class="mt-3">
				<a href={`mailto:${INSTITUTION_EMAIL}`} class="text-primary-100 hover:underline">{INSTITUTION_EMAIL}</a>
			</p>
			<ul class="-ms-2.5 mt-2 flex gap-1" aria-label="Redes sociais">
				{#each SOCIAL_LINKS as social (social.href)}
					<li>
						<a
							href={social.href}
							rel="external"
							aria-label={social.rotulo}
							class="inline-flex size-11 items-center justify-center rounded-full text-2xl text-primary-100 hover:bg-primary-800 hover:text-on-primary hover:no-underline">
							<SiteIcon name={social.icone} />
						</a>
					</li>
				{/each}
			</ul>
		</div>
		<nav aria-labelledby="titulo-navegue">
			<h2 id="titulo-navegue" class="font-display text-xl font-bold text-on-primary">Navegue</h2>
			<ul class="mt-3 grid gap-2 text-primary-100">
				{#each SITE_MENU as item (item.rotulo)}
					{#if item.kind === 'group'}
						<li>
							<span class="font-semibold text-on-primary">{item.rotulo}</span>
							<ul class="mt-2 grid gap-2 border-s border-primary-400 ps-4">
								{#each item.links as link (link.path)}
									<li>
										<a href={resolve(link.path)} class="text-primary-100 hover:underline"
											>{link.rotulo}</a>
									</li>
								{/each}
							</ul>
						</li>
					{:else}
						<li><a href={resolve(item.path)} class="text-primary-100 hover:underline">{item.rotulo}</a></li>
					{/if}
				{/each}
				<li><a href={resolve(LOGIN_PATH)} class="text-primary-100 hover:underline">Login</a></li>
			</ul>
		</nav>
	</div>
</footer>
