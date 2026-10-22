<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import LoanReceipt from '#lib/components/receipts/LoanReceipt.svelte';
	import { fulfillPrintRequest } from '#lib/printing/print-request.js';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { recibo } = $derived(data);
	let receiptPath = $derived(
		resolve('/(protected)/biblioteca/emprestimos/[id=integer]/recibo', { id: String(recibo.idemp) }),
	);
	let breadcrumb = $derived([
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Empréstimos', href: resolve('biblioteca/emprestimos') },
		{ label: 'Recibo', href: receiptPath },
	]);

	const printReceipt = () => window.print();

	afterNavigate(({ to }) => {
		if (!to) return;
		void fulfillPrintRequest(to.url, {
			clearRequest: () => goto(receiptPath, { replace: true, shallow: true }),
			print: printReceipt,
		});
	});
</script>

<PageHeader {breadcrumb} printTitle={false}>Recibo</PageHeader>

<LoanReceipt {recibo} />

<div class="mt-4 flex justify-center print:hidden">
	<Button type="button" tone="primary" onclick={printReceipt}>Imprimir recibo</Button>
</div>
