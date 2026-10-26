<script lang="ts">
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import DescriptionEditor from '#lib/components/tesouraria/DescriptionEditor.svelte';
	import { submitAction, type SubmitAction } from '#lib/forms/action-request.js';
	import { submitDescriptionChange } from '#lib/tesouraria/description-update.js';
	import { moeda } from '#lib/utils/currency.js';
	import { formatCivilDate } from '#lib/utils/date.js';

	type LancamentoRow = {
		id: number;
		tipo: 'entrada' | 'saida';
		descricao: string;
		valor: string;
		dataLancamento: string;
		contraparte: { nome: string } | null;
		reciboUuid: string | null;
	};
	type Props = { items: readonly LancamentoRow[]; submit?: SubmitAction };

	let { items, submit = submitAction }: Props = $props();

	let editingId = $state<number | null>(null);
	let updatedDescriptions = $state<Record<number, string>>({});
	let notice = $state('');

	const editButtonId = (id: number) => `editar-descricao-${id}`;
	const descriptionOf = (item: LancamentoRow) => updatedDescriptions[item.id] ?? item.descricao;

	async function closeEditor(id: number) {
		editingId = null;
		await tick();
		document.getElementById(editButtonId(id))?.focus();
	}

	function startEditing(id: number) {
		notice = '';
		editingId = id;
	}

	async function saveDescription(id: number, descricao: string) {
		const result = await submitDescriptionChange(submit, id, descricao);
		if (!result.ok) return result;

		updatedDescriptions[id] = result.descricao;
		notice = `Descrição do lançamento ${id} atualizada.`;
		await closeEditor(id);
		return { ok: true as const };
	}
</script>

{#if notice}
	<InlineNotification kind="success" element="p" role="status" class="mt-6">{notice}</InlineNotification>
{/if}
<Card class="mt-6 overflow-hidden" padded={false}>
	<DataTable caption="Lançamentos ativos">
		{#snippet head()}
			<tr>
				<th>ID</th>
				<th>Contraparte</th>
				<th>Descrição</th>
				<th>Tipo</th>
				<th class="text-right">Valor</th>
				<th>Data</th>
				<th class="text-right print:hidden">Ações</th>
			</tr>
		{/snippet}
		{#each items as item (item.id)}
			<tr>
				<td>{item.id}</td>
				<td>{item.contraparte?.nome ?? '—'}</td>
				<td>
					{#if editingId === item.id}
						<DescriptionEditor
							lancamentoId={item.id}
							value={descriptionOf(item)}
							onSave={(descricao) => saveDescription(item.id, descricao)}
							onCancel={() => closeEditor(item.id)} />
					{:else}
						{descriptionOf(item)}
					{/if}
				</td>
				<td>
					{#if item.tipo === 'entrada'}
						<Tag kind="success">Entrada</Tag>
					{:else}
						<Tag kind="danger">Despesa</Tag>
					{/if}
				</td>
				<td class="text-right whitespace-nowrap">{moeda(Number(item.valor))}</td>
				<td>{formatCivilDate(item.dataLancamento)}</td>
				<td class="print:hidden">
					<div class="flex justify-end gap-1">
						{#if item.tipo === 'entrada' && item.reciboUuid}
							<IconAction
								icon="fa-regular fa-file-lines"
								title="Recibo"
								aria-label={`Recibo do lançamento ${item.id}`}
								target="_blank"
								href={resolve('/recibo/[uuid=uuid]', { uuid: item.reciboUuid })} />
						{/if}
						<IconAction
							id={editButtonId(item.id)}
							icon="fa-regular fa-pen-to-square"
							title="Editar descrição"
							aria-label={`Editar descrição do lançamento ${item.id}`}
							aria-expanded={editingId === item.id}
							onclick={() => startEditing(item.id)} />
						<IconAction
							icon="fa-regular fa-trash-can"
							tone="danger"
							title="Estorno"
							aria-label={`Estornar lançamento ${item.id}`}
							href={resolve('/(protected)/tesouraria/lancamentos/[id=integer]/estorno', {
								id: `${item.id}`,
							})} />
					</div>
				</td>
			</tr>
		{/each}
	</DataTable>
</Card>
