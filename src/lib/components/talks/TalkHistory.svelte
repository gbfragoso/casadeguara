<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import TalkCard from '#lib/components/talks/TalkCard.svelte';
	import { deleteTalk, updateTalkField, type TalkRequestContext } from '#lib/talks/requests.js';
	import type { SpeakerOption, TalkCard as Talk } from '#lib/talks/types.js';

	type Props = {
		talks: Talk[];
		hoje: string;
		isAdmin: boolean;
		palestrantes: readonly SpeakerOption[];
		pagina: number;
		temProxima: boolean;
		context: TalkRequestContext;
	};

	const FIRST_PAGE = 1;

	let { talks, hoje, isAdmin, palestrantes, pagina, temProxima, context }: Props = $props();

	const pageHref = (page: number) => resolve(`comunicacao/palestras?visao=historico&pagina=${page}`);
</script>

{#if talks.length === 0}
	<Card><p role="status">Nenhuma palestra no histórico.</p></Card>
{:else}
	<ol aria-label="Histórico de palestras" class="flex flex-col gap-3">
		{#each talks as talk (talk.id)}
			<li>
				<TalkCard
					{talk}
					{hoje}
					{isAdmin}
					{palestrantes}
					readonly={!isAdmin}
					onUpdate={(campo, valor) => updateTalkField(context, talk, campo, valor)}
					onDelete={isAdmin ? () => deleteTalk(context, talk.id) : undefined} />
			</li>
		{/each}
	</ol>
{/if}
{#if pagina > FIRST_PAGE || temProxima}
	<nav aria-label="Páginas do histórico" class="mt-6">
		<ButtonGroup>
			{#if pagina > FIRST_PAGE}
				<Button href={pageHref(pagina - 1)}>
					<i class="fa-solid fa-arrow-left fa-fw" aria-hidden="true"></i>Mais recentes
				</Button>
			{/if}
			{#if temProxima}
				<Button href={pageHref(pagina + 1)}>
					Mais antigas<i class="fa-solid fa-arrow-right fa-fw" aria-hidden="true"></i>
				</Button>
			{/if}
		</ButtonGroup>
	</nav>
{/if}
