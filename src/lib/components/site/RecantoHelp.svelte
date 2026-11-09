<script lang="ts">
	import { INSTITUTION_ADDRESS, INSTITUTION_PIX_KEY } from '#lib/brand/institution.js';
</script>

<div class="mt-10 border-t border-sky pt-8 desktop:flex desktop:items-baseline desktop:gap-8">
	<h3 class="shrink-0 font-display text-2xl font-bold text-ink-strong">Como ajudar</h3>
	<ul class="mt-3 grid list-disc gap-2 ps-5 text-lg marker:text-primary-ink desktop:mt-0">
		<li>Doações de roupas podem ser feitas em nossa sede, na {INSTITUTION_ADDRESS}.</li>
		<li>
			Doações em dinheiro podem ser feitas na nossa tesouraria ou através da chave PIX:
			<span class="font-bold text-ink-strong select-all">{INSTITUTION_PIX_KEY}</span>
		</li>
	</ul>
</div>
