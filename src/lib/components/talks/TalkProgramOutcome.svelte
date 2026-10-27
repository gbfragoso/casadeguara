<script module lang="ts">
	import type { ProgramMonth } from '#lib/talks/program/months.js';
	import type { ProgramPendency } from '#lib/talks/program/readiness.js';

	export type ActiveProgram =
		| { status: 'loading'; month: ProgramMonth }
		| { status: 'ready'; month: ProgramMonth; url: string }
		| { status: 'blocked'; month: ProgramMonth; message: string; pendencias: ProgramPendency[] };
</script>

<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import { describeReadyProgram } from '#lib/talks/program/format.js';

	type Props = { program: ActiveProgram; fileName: string; popoverId: string };

	let { program, fileName, popoverId }: Props = $props();
</script>

{#if program.status === 'loading'}
	<div role="status" class="flex items-center gap-3 rounded-lg bg-surface-muted p-4 text-ink-muted">
		<span
			aria-hidden="true"
			class="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
		></span>
		Gerando a programação…
	</div>
{:else if program.status === 'ready'}
	<InlineNotification kind="success" role="status">{describeReadyProgram(program.month)}</InlineNotification>
{:else}
	<InlineNotification kind="warning" role="alert">
		<div class="flex flex-col gap-2">
			<p>{program.message}</p>
			{#if program.pendencias.length > 0}
				<ul class="flex list-disc flex-col gap-1 pl-5">
					{#each program.pendencias as pendencia (pendencia.id)}
						<li><span class="font-medium">{pendencia.quando}</span>: {pendencia.falta}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</InlineNotification>
{/if}
<div class="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:justify-end">
	{#if program.status === 'ready'}
		<Button tone="primary" href={program.url} target="_blank" rel="noopener">
			<i class="fa-solid fa-print fa-fw" aria-hidden="true"></i>Abrir para imprimir
		</Button>
		<Button href={program.url} download={fileName}>
			<i class="fa-solid fa-download fa-fw" aria-hidden="true"></i>Baixar
		</Button>
	{/if}
	<Button type="button" popovertarget={popoverId} popovertargetaction="hide">Fechar</Button>
</div>
