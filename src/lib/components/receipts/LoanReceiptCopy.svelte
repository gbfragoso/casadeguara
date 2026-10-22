<script lang="ts">
	import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';

	interface Props {
		recibo: ReciboEmprestimo;
		via: 'biblioteca' | 'leitor';
	}

	const MISSING_DATE = '—';

	let { recibo, via }: Props = $props();
	let dataEmprestimo = $derived(recibo.dataEmprestimo ?? MISSING_DATE);
	let dataDevolucao = $derived(recibo.dataDevolucao ?? MISSING_DATE);
	let identificacao = $derived(via === 'biblioteca' ? 'Via da biblioteca' : 'Via do leitor');
</script>

<section class="via" aria-label={identificacao}>
	<header class="cabecalho">
		<p class="maiusculas">Biblioteca Batuíra</p>
		<p>Recibo de empréstimo</p>
		<p>{identificacao}</p>
	</header>

	<div class="bloco">
		<p class="linha">
			<span>{`Empréstimo nº ${recibo.idemp}`}</span>
			<span>{`Data: ${dataEmprestimo}`}</span>
		</p>
		<p>Leitor: <span class="maiusculas">{recibo.leitor}</span></p>
		<p>{`Livro: ${recibo.tombo}`} <span class="maiusculas">{recibo.titulo}</span></p>
		{#if via === 'biblioteca'}
			<p class="linha">
				<span>{`Exemplar: ${recibo.exemplar}`}</span>
				<span>{`Devolver até: ${dataDevolucao}`}</span>
			</p>
		{:else}
			<p>{`Exemplar: ${recibo.exemplar}`}</p>
			<p class="destaque-devolucao maiusculas">{`Devolver até ${dataDevolucao}`}</p>
		{/if}
	</div>

	{#if via === 'biblioteca'}
		<div class="controle">
			<p>Renovado para: ____/____/______</p>
			<p class="campo-manuscrito">Recebido por:<span class="espaco-manuscrito"></span></p>
		</div>
		<footer class="assinatura">
			<p class="maiusculas">{recibo.leitor}</p>
			<p>Fora da caridade não há salvação</p>
		</footer>
	{:else}
		<p class="regras">Prazo de 14 dias. Pode ser renovado uma vez, por mais 14 dias.</p>
	{/if}
</section>

<style>
	.via {
		break-inside: avoid;
	}

	.cabecalho {
		text-align: center;
		font-weight: bold;
	}

	.cabecalho,
	.bloco {
		padding-bottom: 1mm;
		margin-bottom: 1mm;
		border-bottom: 1px solid var(--color-black);
	}

	.linha {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		column-gap: 2mm;
	}

	.maiusculas {
		text-transform: uppercase;
	}

	.destaque-devolucao {
		margin-block: 2mm;
		text-align: center;
		font-size: 14pt;
		font-weight: bold;
	}

	.campo-manuscrito {
		display: flex;
		gap: 1mm;
		margin-top: 2mm;
	}

	.espaco-manuscrito {
		flex: 1;
		border-bottom: 1px solid var(--color-black);
	}

	.assinatura {
		margin-top: 12mm;
		padding-top: 1mm;
		border-top: 1px solid var(--color-black);
		text-align: center;
	}
</style>
