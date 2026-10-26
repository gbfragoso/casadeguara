<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import NewTalkCard from '#lib/components/talks/NewTalkCard.svelte';
	import TalkBoard from '#lib/components/talks/TalkBoard.svelte';
	import TalkHistory from '#lib/components/talks/TalkHistory.svelte';
	import { submitAction } from '#lib/forms/action-request.js';
	import type { TalkRequestContext } from '#lib/talks/requests.js';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let notice = $state('');

	const boardPath = resolve('comunicacao/palestras');
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestras', href: boardPath },
	];
	const views = [
		{ visao: 'agenda', label: 'Agenda', icon: 'fa-solid fa-calendar-days', href: boardPath },
		{
			visao: 'historico',
			label: 'Histórico',
			icon: 'fa-solid fa-clock-rotate-left',
			href: resolve('comunicacao/palestras?visao=historico'),
		},
	];
	const context: TalkRequestContext = {
		submit: submitAction,
		refresh: refreshAll,
		onNotice: (message) => (notice = message),
	};
</script>

<PageHeader {breadcrumb}>Palestras</PageHeader>

<div class="flex max-w-3xl flex-col gap-4">
	<nav aria-label="Visão das palestras">
		<ul class="flex gap-2">
			{#each views as view (view.visao)}
				{@const current = data.visao === view.visao}
				<li>
					<a
						href={view.href}
						aria-current={current ? 'page' : undefined}
						class={[
							'inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-medium transition-colors hover:no-underline motion-reduce:transition-none',
							current
								? 'bg-primary-600 text-on-primary'
								: 'border border-line bg-surface text-ink-strong hover:bg-surface-muted',
						]}>
						<i class={[view.icon, 'fa-fw']} aria-hidden="true"></i>{view.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	{#if notice}
		<InlineNotification kind="warning" role="alert">
			<p class="flex-1">{notice}</p>
			<IconAction
				icon="fa-solid fa-xmark"
				aria-label="Fechar aviso"
				class="-my-2"
				onclick={() => (notice = '')} />
		</InlineNotification>
	{/if}

	{#if data.visao === 'historico'}
		<TalkHistory
			talks={data.palestras}
			hoje={data.hoje}
			isAdmin={data.isAdmin}
			palestrantes={data.palestrantes}
			pagina={data.pagina}
			temProxima={data.temProxima}
			{context} />
	{:else}
		<NewTalkCard
			{context}
			hoje={data.hoje}
			isAdmin={data.isAdmin}
			localPadrao={data.localPadrao}
			reuniaoComPadrao={data.reuniaoComPadrao}
			horariosSugeridos={data.horariosSugeridos} />
		{#if data.palestras.length === 0}
			<Card>
				<p role="status">
					Nenhuma palestra programada a partir de hoje. Use “Nova palestra” para montar a programação do mês.
				</p>
			</Card>
		{:else}
			<TalkBoard
				talks={data.palestras}
				hoje={data.hoje}
				isAdmin={data.isAdmin}
				palestrantes={data.palestrantes}
				{context} />
		{/if}
	{/if}
</div>
