<script lang="ts">
	import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
	import LoanReceiptCopy from './LoanReceiptCopy.svelte';

	interface Props {
		recibo: ReciboEmprestimo;
	}

	let { recibo }: Props = $props();
</script>

<div class="recibo-termico notranslate" translate="no" data-testid="recibo-termico">
	<LoanReceiptCopy {recibo} via="biblioteca" />
	<p class="corte" role="separator">corte aqui</p>
	<LoanReceiptCopy {recibo} via="leitor" />
</div>

<style>
	@page recibo-termico {
		margin: 0;
	}

	.recibo-termico {
		box-sizing: border-box;
		color: var(--color-black);
		background-color: var(--color-white);
		font-family: var(--font-sans);
		font-size: 10pt;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.corte {
		display: flex;
		align-items: center;
		gap: 2mm;
		margin-block: 4mm;
	}

	.corte::before,
	.corte::after {
		content: '';
		flex: 1;
		border-top: 1px dashed var(--color-black);
	}

	@media screen {
		.recibo-termico {
			width: 80mm;
			max-width: 100%;
			margin-inline: auto;
			padding: 4mm;
			border: 1px solid var(--color-divider);
			border-radius: var(--radius-sm);
			box-shadow: var(--shadow-card);
		}
	}

	@media print {
		.recibo-termico {
			page: recibo-termico;
			width: 72mm;
			max-width: 100%;
			margin-inline: auto;
			padding: 0;
			border: none;
		}
	}
</style>
