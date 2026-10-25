<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import PublicHeader from '#lib/components/layout/PublicHeader.svelte';
	import { formatBrlDecimal } from '#lib/utils/currency.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import QRCode from 'qrcode';
	import extenso from 'extenso';

	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	dayjs.extend(utc);
</script>

{#snippet receiptField(label: string, content: string)}
	<div
		class="grid gap-1 tablet:grid-cols-[11rem_1fr] tablet:items-center tablet:gap-3 print:grid-cols-[11rem_1fr] print:items-center print:gap-3">
		<span>{label}</span>
		<span class="rounded-sm border border-black px-3 py-1">{content}</span>
	</div>
{/snippet}

{#snippet receiptNumber(label: string, content: string | number)}
	<p class="flex items-center gap-2 whitespace-nowrap">
		<span class="font-bold">{label}</span>
		<span class="rounded-sm border border-black px-3 py-1">{content}</span>
	</p>
{/snippet}

<PublicHeader />
<main class="px-4 py-6 tablet:py-10 print:p-0">
	{#if data.status === 'estornado'}
		<InlineNotification
			id="recibo-estornado"
			kind="warning"
			element="section"
			role="status"
			class="mx-auto w-full desktop:max-w-receipt print:border-black">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-bold">Recibo estornado</h1>
				<p>Este recibo não é válido.</p>
				<p><strong>Motivo:</strong> {data.motivo}</p>
			</div>
		</InlineNotification>
	{:else}
		<div
			id="recibo"
			translate="no"
			class="notranslate mx-auto w-full overflow-hidden rounded-lg border border-divider bg-white text-black shadow-card desktop:max-w-receipt print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:text-sm print:leading-5">
			<div class="flex flex-col gap-4 p-4 tablet:p-6 print:gap-3 print:p-0">
				<div
					class="flex flex-col items-center gap-4 tablet:flex-row tablet:items-start tablet:justify-between print:flex-row print:items-start print:justify-between">
					<div
						class="w-full border border-black p-3 text-center tablet:w-auto tablet:flex-1 print:w-auto print:flex-1">
						<h2 class="text-lg font-bold text-black underline tablet:text-2xl print:text-xl">
							GRUPO ESPÍRITA CASA DE GUARÁ
						</h2>
						<p>Rua Major Dórea, 86 - B. Castália - Itabuna - Ba</p>
						<p>Fundado em 13/05/1966</p>
						<p>Reconhecido de Utilidade Pública pela Lei Municipal n° 1.303 de 12/12/1983</p>
						<p>CNPJ: 13.271.788/0001-12</p>
					</div>
					{#await QRCode.toDataURL(page.url.href) then dataUrl}
						<img class="size-32 shrink-0" alt="QR Code para conferir este recibo" src={dataUrl} />
					{/await}
				</div>
				<div class="flex flex-wrap justify-end gap-x-6 gap-y-2">
					{@render receiptNumber('N°', data.entrada.id)}
					{@render receiptNumber('Valor', formatBrlDecimal(data.entrada.valor))}
				</div>
				<div class="flex flex-col gap-3 print:gap-2">
					{@render receiptField('Recebemos do Sr.(a)', data.entrada.contribuinte.toUpperCase())}
					{@render receiptField(
						'A quantia de',
						extenso(data.entrada.valor, { mode: 'currency' }).toUpperCase(),
					)}
					{@render receiptField('Referente a', data.entrada.descricao.toUpperCase())}
				</div>
				<div
					class="flex flex-col items-center gap-4 pt-2 tablet:flex-row tablet:justify-around print:flex-row print:justify-around">
					<div class="text-center">
						<div class="font-bold">{dayjs.utc(data.entrada.dataRegistro).format('DD / MM / YYYY')}</div>
						<div>Data</div>
					</div>
					<div class="max-w-full text-center">
						<div class="overflow-hidden">_______________________________</div>
						<div>Assinatura</div>
					</div>
				</div>
				<p class="text-center">
					Esta sua contribuição permite a manutenção dos nossos trabalhos. Jesus o abençoe.
				</p>
			</div>
		</div>

		<div class="mt-8 flex justify-center print:hidden">
			<Button tone="primary" onclick={() => window.print()}>Clique aqui para imprimir</Button>
		</div>
	{/if}
</main>

<style>
	@page recibo-contribuicao {
		size: A4 portrait;
		margin: 0;
	}

	@media print {
		#recibo {
			page: recibo-contribuicao;
			width: 210mm;
			height: 148.5mm;
			padding: 8mm 10mm;
		}
	}
</style>
