<script lang="ts">
	import { page } from '$app/stores';
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import QRCode from 'qrcode';
	import extenso from 'extenso';

	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ entrada } = data);
	dayjs.extend(utc);

	let qrcode = QRCode.toDataURL($page.url.href);
</script>

<div id="recibo" style="background-color: white !important;">
	<div class="p-2">
		<div class="is-flex is-justify-content-space-between">
			<div class="has-text-centered p-2 mt-4 fit-content" style="border: 1px solid;">
				<h2 class="has-text-weight-bold is-underlined is-size-4">GRUPO ESPÍRITA CASA DE GUARÁ</h2>
				<p>Rua Major Dórea, 86 - B. Castália - Itabuna - Ba</p>
				<p>Fundado em 13/05/1966</p>
				<p>Reconhecido de Utilidade Pública pela Lei Municipal n° 1.303 de 12/12/1983</p>
				<p>CNPJ: 13.271.788/0001-12</p>
			</div>
			<div>
				{#await qrcode then dataUrl}
					<img class="qrcode" alt="qrcode" src={dataUrl} />
				{/await}
			</div>
		</div>
		{#await entrada}
			<div class="is-flex is-justify-content-end mt-3">
				<div class="columns">
					<div class="column has-text-weight-bold py-1">N°</div>
					<div class="column border fit-content py-1">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
				</div>
				<div class="columns pl-5 pr-2">
					<div class="column has-text-weight-bold py-1">Valor</div>
					<div class="column border fit-content py-1">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">Recebemos do Sr.(a)</div>
					<div class="column border fit-content py-1">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
				</div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">A quantia de</div>
					<div class="column border fit-content py-1">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
				</div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">Referente ao mês</div>
					<div class="column border fit-content py-1">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
				</div>
			</div>
			<div class="is-flex is-justify-content-space-around pt-3">
				<div class="column has-text-centered">
					<div class="has-text-weight-bold">
						<div class="skeleton-lines">
							<div></div>
						</div>
					</div>
					<div>Data</div>
				</div>
				<div class="column has-text-centered">
					<div>_______________________________</div>
					<div>Assinatura</div>
				</div>
			</div>
		{:then item}
			<div class="is-flex is-justify-content-end mt-3">
				<div class="columns">
					<div class="column has-text-weight-bold py-1">N°</div>
					<div class="column border fit-content py-1">{item[0].id}</div>
				</div>
				<div class="columns pl-5 pr-2">
					<div class="column has-text-weight-bold py-1">Valor</div>
					<div class="column border fit-content py-1">{moeda(Number(item[0].valor))}</div>
				</div>
			</div>
			<div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">Recebemos do Sr.(a)</div>
					<div class="column border fit-content py-1">{item[0].contribuinte}</div>
				</div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">A quantia de</div>
					<div class="column border fit-content py-1">
						{extenso(Number(item[0].valor).toLocaleString('pt-BR'), { mode: 'currency' })}
					</div>
				</div>
				<div class="columns py-1 pr-2">
					<div class="column is-one-quarter py-1">Referente ao mês</div>
					<div class="column border fit-content py-1">{dayjs.utc(item[0].data).format('MM / YYYY')}</div>
				</div>
			</div>
			<div class="is-flex is-justify-content-space-around pt-3">
				<div class="column has-text-centered">
					<div class="has-text-weight-bold">{dayjs.utc(item[0].data).format('DD / MM / YYYY')}</div>
					<div>Data</div>
				</div>
				<div class="column has-text-centered">
					<div>_______________________________</div>
					<div>Assinatura</div>
				</div>
			</div>
		{/await}
		<p class="has-text-centered py-2">
			Esta sua contribuição permite a manutenção dos nossos trabalhos. Jesus o abençoe.
		</p>
	</div>
</div>

<style>
	.border {
		border: 1px solid;
		border-radius: 5px;
	}

	.fit-content {
		block-size: fit-content;
	}

	@media only screen {
		#recibo {
			width: 49rem;
			margin: auto;
		}
	}
</style>
