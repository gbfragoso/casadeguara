<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
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

	const printReceipt = () => window.print();

	afterNavigate(({ to }) => {
		if (!to) return;
		void fulfillPrintRequest(to.url, {
			clearRequest: () => goto(receiptPath, { replace: true, shallow: true }),
			print: printReceipt,
		});
	});
</script>

<div id="breadcrumb" class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('biblioteca')}>Biblioteca</a></li>
			<li><a href={resolve('biblioteca/emprestimos')}>Empréstimos</a></li>
			<li class="is-active">
				<a href={receiptPath} aria-current="page">Recibo</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Recibo</h1>
</div>

<LoanReceipt {recibo} />

<div class="mt-4 has-text-centered">
	<button type="button" class="button is-primary is-hidden-print" onclick={printReceipt}>Imprimir recibo</button>
</div>
