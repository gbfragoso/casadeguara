<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		CORRECTION_NOTICE,
		buildBirthdayFileName,
		describeEmptyBirthdays,
		describeReadyBirthdays,
		formatBirthdayDate,
		formatBirthdayListTitle,
	} from '#lib/birthdays/format.js';
	import {
		BIRTHDAY_MONTH_OPTIONS,
		parseBirthdayMonth,
		readCurrentMonthValue,
		resolveReferenceMonth,
	} from '#lib/birthdays/months.js';
	import { requestBirthdayPdf, type BirthdayPdfFailure } from '#lib/birthdays/request.js';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import PdfOutcome from '#lib/components/feedback/PdfOutcome.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { PdfDelivery } from '#lib/pdf/delivery.svelte.js';
	import type { CalendarMonth } from '#lib/utils/calendar-month.js';
	import { readBahiaIsoDate } from '#lib/utils/date.js';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer({ reset: false });
	const birthdayPdf = new PdfDelivery<CalendarMonth, BirthdayPdfFailure>();
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Aniversariantes', href: resolve('secretaria/aniversariantes') },
	];
	let chosenMonth = $derived(form?.mes ?? readCurrentMonthValue(data.hoje));
	const searchedOption = $derived(parseBirthdayMonth(form?.mes ?? null));

	function generatePdf() {
		const month = resolveReferenceMonth(Number(chosenMonth), readBahiaIsoDate(new Date()));
		return birthdayPdf.deliver(month, (signal) => requestBirthdayPdf(fetch, month, signal));
	}

	const releaseOnUnmount = () => () => birthdayPdf.release();
</script>

<PageHeader {breadcrumb} printTitle={false}>Lista de aniversariantes</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-3 tablet:flex-row" {@attach formEnhancer.submitWithLoading}>
	<Select name="mes" aria-label="Mês" class="grow" bind:value={chosenMonth} onchange={() => birthdayPdf.reset()}>
		{#each BIRTHDAY_MONTH_OPTIONS as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</Select>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-50">
		<i class="fa-regular fa-rectangle-list fa-fw" aria-hidden="true"></i>Gerar lista
	</Button>
	<Button type="button" bold class="tablet:min-w-50" onclick={generatePdf}>
		<i class="fa-solid fa-file-pdf fa-fw" aria-hidden="true"></i>Gerar PDF
	</Button>
</Card>

{#if birthdayPdf.current.status !== 'idle'}
	<div class="mt-6 flex flex-col gap-3 print:hidden" {@attach releaseOnUnmount}>
		<PdfOutcome
			outcome={birthdayPdf.current}
			loadingLabel="Gerando o PDF…"
			readyLabel={describeReadyBirthdays(birthdayPdf.current.subject)}
			fileName={buildBirthdayFileName(birthdayPdf.current.subject)} />
	</div>
{/if}

{#if searchedOption && form}
	{#if form.leitores.length === 0}
		<Card class="mt-6"><p role="status">{describeEmptyBirthdays(searchedOption)}</p></Card>
	{:else}
		<Card id="printable-content" class="notranslate mt-6 flex flex-col gap-2" translate="no">
			<h1 class="text-center text-lg font-bold text-primary-ink">GRUPO ESPÍRITA CASA DE GUARÁ</h1>
			<h2 class="text-center font-bold text-danger-ink uppercase">
				{formatBirthdayListTitle(searchedOption, form.ano)}
			</h2>
			<DataTable class="-mx-5 mt-2 tablet:-mx-6 print:mx-0">
				{#snippet head()}
					<tr>
						<th>Nome</th>
						<th>Data</th>
					</tr>
				{/snippet}
				{#each form.leitores as leitor (leitor.id)}
					<tr>
						<td>
							{leitor.nome.toUpperCase()}
							{#if leitor.desencarnado}
								<span class="font-bold text-danger-ink">(IN MEMORIAM)</span>
							{/if}
						</td>
						<td>{formatBirthdayDate(leitor.dia, searchedOption)}</td>
					</tr>
				{/each}
			</DataTable>
			<p class="mt-4 text-center font-bold text-danger-ink print:fixed print:bottom-0 print:w-full">
				{CORRECTION_NOTICE}
			</p>
		</Card>
	{/if}
{/if}
