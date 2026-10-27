<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import TalkProgramDialog from '#lib/components/talks/TalkProgramDialog.svelte';

	type Props = { hoje: string };

	let { hoje }: Props = $props();

	const DIALOG_ID = 'programacao-do-mes';
</script>

<Button type="button" popovertarget={DIALOG_ID}>
	<i class="fa-solid fa-print fa-fw" aria-hidden="true"></i>Programação do mês
</Button>
<TalkProgramDialog id={DIALOG_ID} {hoje} />
